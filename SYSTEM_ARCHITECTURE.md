# CloudForge - System Architecture & Build Process

## Build System & Development Toolchain

### Vite Configuration Analysis
```typescript
// vite.config.ts - Multi-environment build configuration
export default defineConfig({
  plugins: [
    react(),
    cartographer({
      enabled: process.env.NODE_ENV === 'development',
      includeNodeModules: false,
    }),
    runtimeErrorModal(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./client/assets"),
    },
  },
  root: "./client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: "./client/index.html",
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

### TypeScript Configuration Strategy
```json
// tsconfig.json - Compiler options
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### Package.json Analysis
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/index.js --external:@replit/vite-plugin-cartographer",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

## Server Architecture Deep Dive

### Express.js Application Bootstrap
```typescript
// server/index.ts - Application initialization
async function main() {
  const app = express();
  
  // Middleware stack configuration
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Request logging middleware
  app.use((req, _res, next) => {
    log(`${req.method} ${req.path}`, "express");
    next();
  });

  // API routes registration
  const httpServer = await registerRoutes(app);

  // Vite integration for development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
    });
  });

  const port = Number(process.env.PORT) || 5000;
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`, "express");
  });
}
```

### Development vs Production Server Handling
```typescript
// server/vite.ts - Development server integration
export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: viteLogger,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // SPA fallback for client-side routing
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const template = await vite.transformIndexHtml(url, `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/vite.svg" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>CloudForge</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.tsx"></script>
          </body>
        </html>
      `);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// Production static file serving
export function serveStatic(app: Express) {
  const publicDir = path.resolve("dist/public");
  app.use(express.static(publicDir));
  
  // SPA fallback for production
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(publicDir, "index.html"));
  });
}
```

## Frontend Architecture Patterns

### Component Composition Strategy
```typescript
// Component hierarchy and data flow
App
├── QueryClientProvider (TanStack Query)
├── TooltipProvider (Radix UI)
├── Toaster (Toast notifications)
└── Router (Wouter)
    └── Home
        ├── StepProgress (Navigation indicator)
        ├── ProjectInput (Step 1)
        │   ├── Form (react-hook-form + Zod)
        │   ├── FileUpload (Drag & drop)
        │   └── Mutations (Create project, upload files)
        ├── Configuration (Step 2)
        │   ├── Performance settings
        │   ├── Database configuration
        │   ├── Security options
        │   └── Deployment preferences
        ├── Templates (Step 3)
        │   ├── Template generation
        │   ├── Provider comparison
        │   └── Code preview
        └── Deployment (Step 4)
            ├── Pre-deployment summary
            ├── Real-time progress
            └── Success state
```

### State Management Patterns
```typescript
// Parent component state coordination
const [currentStep, setCurrentStep] = useState(1);
const [projectData, setProjectData] = useState<ProjectFormData>({...});
const [configData, setConfigData] = useState<ConfigurationData>({...});
const [projectId, setProjectId] = useState<number | null>(null);

// Data flow through callback props
const handleProjectSubmit = (data: ProjectFormData, id: number) => {
  setProjectData(data);      // Store form data
  setProjectId(id);          // Store project ID for subsequent steps
  nextStep();                // Advance wizard
};

const handleConfigSubmit = (data: ConfigurationData) => {
  setConfigData(data);       // Store configuration
  nextStep();                // Advance to templates
};
```

### Form Validation Architecture
```typescript
// Multi-layer validation strategy
// 1. Frontend Zod schema
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.string().optional(),
  expectedUsers: z.string().min(1, "Expected user base is required"),
});

// 2. React Hook Form integration
const form = useForm<ProjectFormData>({
  resolver: zodResolver(projectSchema),
  mode: "onChange", // Real-time validation
  defaultValues: {
    name: "",
    description: "",
    techStack: "",
    expectedUsers: "",
  },
});

// 3. Server-side validation using same schema
app.post("/api/projects", async (req, res) => {
  try {
    const projectData = insertProjectSchema.parse(req.body);
    const project = await storage.createProject(projectData);
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
```

## Data Flow Architecture

### Request/Response Cycle
```
Client Form Submission
    ↓
React Hook Form Validation (Zod)
    ↓
TanStack Query Mutation
    ↓
API Request (fetch with credentials)
    ↓
Express Route Handler
    ↓
Zod Schema Validation
    ↓
Storage Interface (MemStorage)
    ↓
In-Memory Map Operation
    ↓
Response with Created/Updated Project
    ↓
Query Cache Invalidation
    ↓
UI State Update
```

### File Upload Flow
```
File Drop/Selection
    ↓
Local File State Update
    ↓
FormData Construction
    ↓
Multer Middleware Processing
    ↓
File System Storage (uploads/)
    ↓
Database Record Update (file paths)
    ↓
Success Response
    ↓
UI File List Update
```

## Template Generation Engine

### Static Template System Architecture
```typescript
// Template generation strategy
interface TemplateGenerator {
  generateAWS(project: Project): string;
  generateGCP(project: Project): string;
  generateAzure(project: Project): string;
}

// AWS CloudFormation template
function generateAWSTemplate(project: any): string {
  return `# AWS CloudFormation Template
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Auto-generated infrastructure for ${project.name}'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '\${AWS::StackName}-vpc'
          
  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true
      
  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      
  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub '\${AWS::StackName}-igw'
          
  VPCGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway
      
  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub '\${AWS::StackName}-public-rt'
          
  PublicRoute:
    Type: AWS::EC2::Route
    DependsOn: VPCGatewayAttachment
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway
      
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      SecurityGroups: [!Ref ALBSecurityGroup]
      Subnets: [!Ref PublicSubnet1, !Ref PublicSubnet2]
      Tags:
        - Key: Name
          Value: !Sub '\${AWS::StackName}-alb'
          
  AutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      VPCZoneIdentifier: [!Ref PrivateSubnet1, !Ref PrivateSubnet2]
      LaunchTemplate:
        LaunchTemplateId: !Ref LaunchTemplate
        Version: !GetAtt LaunchTemplate.LatestVersionNumber
      MinSize: 2
      MaxSize: 10
      DesiredCapacity: 2
      TargetGroupARNs: [!Ref TargetGroup]
      HealthCheckType: ELB
      HealthCheckGracePeriod: 300
      Tags:
        - Key: Name
          Value: !Sub '\${AWS::StackName}-asg'
          PropagateAtLaunch: true
          
  DatabaseInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub '\${AWS::StackName}-database'
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: 13.7
      MasterUsername: dbadmin
      MasterUserPassword: !Ref DatabasePassword
      AllocatedStorage: 20
      StorageType: gp2
      StorageEncrypted: true
      VPCSecurityGroups: [!Ref DatabaseSecurityGroup]
      DBSubnetGroupName: !Ref DatabaseSubnetGroup
      MultiAZ: true
      BackupRetentionPeriod: 7
      DeletionProtection: true
      Tags:
        - Key: Name
          Value: !Sub '\${AWS::StackName}-database'

Outputs:
  ApplicationURL:
    Description: Application Load Balancer URL
    Value: !Sub 'https://\${ApplicationLoadBalancer.DNSName}'
    Export:
      Name: !Sub '\${AWS::StackName}-ApplicationURL'
      
  DatabaseEndpoint:
    Description: RDS Database Endpoint
    Value: !GetAtt DatabaseInstance.Endpoint.Address
    Export:
      Name: !Sub '\${AWS::StackName}-DatabaseEndpoint'`;
}
```

### Cost Estimation Logic
```typescript
// Static cost calculation based on resource tiers
const costEstimation = {
  aws: {
    ec2: 50,        // t3.medium instances
    rds: 45,        // PostgreSQL Multi-AZ
    alb: 25,        // Application Load Balancer
    storage: 15,    // EBS volumes
    dataTransfer: 12, // Outbound data transfer
    cloudWatch: 8,  // Monitoring
    route53: 2,     // DNS
    total: 247
  },
  gcp: {
    computeEngine: 42,  // n2-standard-2
    cloudSQL: 38,       // PostgreSQL HA
    loadBalancer: 20,   // HTTP(S) Load Balancer
    storage: 12,        // Persistent disks
    network: 10,        // Network egress
    monitoring: 6,      // Cloud Monitoring
    total: 198
  },
  azure: {
    virtualMachines: 55, // B2s instances
    database: 48,        // Azure Database for PostgreSQL
    loadBalancer: 22,    // Application Gateway
    storage: 18,         // Managed disks
    bandwidth: 14,       // Outbound data transfer
    monitoring: 8,       // Azure Monitor
    total: 289
  }
};
```

## Security Implementation

### Input Sanitization Strategy
```typescript
// Multi-layer input validation
// 1. File upload security
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5,                   // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // MIME type validation
    const allowedTypes = [
      'image/png', 
      'image/jpeg', 
      'image/jpg', 
      'application/pdf'
    ];
    
    // File extension validation
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && 
        allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and PDF files are allowed.'));
    }
  },
});

// 2. Request body validation
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

// 3. Parameter validation
app.post("/api/projects/:id/configuration", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    
    const configuration = configurationSchema.parse(req.body);
    // ... rest of handler
  } catch (error) {
    // Error handling
  }
});
```

### CORS and Security Headers
```typescript
// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:5000']
    : process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

This comprehensive system architecture demonstrates enterprise-grade patterns with proper separation of concerns, type safety, security measures, and scalable design principles throughout the entire stack.