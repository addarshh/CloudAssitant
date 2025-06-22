# CloudForge - Code Implementation Analysis

## Database Schema & Type System

### Drizzle ORM Schema Design
```typescript
// shared/schema.ts - PostgreSQL table definition
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),                    // Auto-incrementing primary key
  name: text("name").notNull(),                     // Required project name
  description: text("description").notNull(),       // Required description
  techStack: text("tech_stack"),                    // Optional technology stack
  expectedUsers: text("expected_users").notNull(),  // Required user scale
  uploadedFiles: jsonb("uploaded_files").$type<string[]>().default([]), // JSON array of file paths
  configuration: jsonb("configuration").$type<Record<string, any>>(),   // JSON configuration object
  selectedProvider: text("selected_provider"),      // aws | gcp | azure
  deploymentStatus: text("deployment_status").default("pending"),       // deployment state
  createdAt: timestamp("created_at").defaultNow(),  // Auto timestamp
});
```

### Type Safety Implementation
```typescript
// Type inference from schema
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Zod validation schema creation
export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  techStack: true,
  expectedUsers: true,
  uploadedFiles: true,
  configuration: true,
  selectedProvider: true,
});

// Configuration-specific validation
export const configurationSchema = z.object({
  concurrentUsers: z.string(),
  responseTime: z.string(),
  databaseType: z.string(),
  dataVolume: z.string(),
  autoBackups: z.boolean(),
  sslCertificate: z.string(),
  region: z.string(),
  ddosProtection: z.boolean(),
  gdprCompliance: z.boolean(),
  monitoring: z.boolean(),
  autoScaling: z.string(),
  environmentStrategy: z.string(),
});
```

## Storage Layer Implementation

### Interface-Based Architecture
```typescript
// server/storage.ts - Abstract storage interface
export interface IStorage {
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
}

// In-memory implementation with Map for O(1) access
export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.currentId = 1;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const project: Project = {
      id,
      name: insertProject.name,
      description: insertProject.description,
      techStack: insertProject.techStack || null,
      expectedUsers: insertProject.expectedUsers,
      uploadedFiles: Array.isArray(insertProject.uploadedFiles) ? insertProject.uploadedFiles : null,
      configuration: insertProject.configuration || null,
      selectedProvider: insertProject.selectedProvider || null,
      deploymentStatus: "pending",
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }
}
```

## API Route Implementation Details

### File Upload with Multer
```typescript
// server/routes.ts - Multer configuration
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and PDF files are allowed.'));
    }
  },
});

// File upload endpoint with array handling
app.post("/api/projects/:id/upload", upload.array('files', 5), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const files = req.files as Express.Multer.File[];
    const filePaths = files.map(file => file.filename);
    
    const updatedProject = await storage.updateProject(projectId, {
      uploadedFiles: [...(project.uploadedFiles || []), ...filePaths]
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: "File upload failed" });
  }
});
```

### Template Generation Logic
```typescript
// Static template generation with string interpolation
app.post("/api/projects/:id/templates", async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const templates = {
      aws: {
        name: "AWS CloudFormation",
        code: generateAWSTemplate(project),
        estimatedCost: 247,
        provider: "aws"
      },
      gcp: {
        name: "Google Cloud Deployment Manager", 
        code: generateGCPTemplate(project),
        estimatedCost: 198,
        provider: "gcp"
      },
      azure: {
        name: "Azure Resource Manager",
        code: generateAzureTemplate(project),
        estimatedCost: 289,
        provider: "azure"
      }
    };

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Template generation failed" });
  }
});
```

## Frontend Component Architecture

### Form Handling with React Hook Form + Zod
```typescript
// client/src/components/project-input.tsx
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.string().optional(),
  expectedUsers: z.string().min(1, "Expected user base is required"),
});

export default function ProjectInput({ onSubmit }: ProjectInputProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      techStack: "",
      expectedUsers: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: (project) => {
      if (files.length > 0) {
        uploadFiles(project.id);
      } else {
        onSubmit(form.getValues(), project.id);
      }
    },
  });
}
```

### File Upload Implementation
```typescript
// Drag and drop file handling
const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  const droppedFiles = Array.from(event.dataTransfer.files);
  setFiles(droppedFiles);
};

const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
};

// File upload mutation with FormData
const uploadFilesMutation = useMutation({
  mutationFn: async ({ projectId, files }: { projectId: number; files: File[] }) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`/api/projects/${projectId}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },
  onSuccess: (project) => {
    onSubmit(form.getValues(), project.id);
  },
});
```

### State Management in Multi-Step Wizard
```typescript
// client/src/pages/home.tsx - Parent state management
export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectFormData>({
    name: "",
    description: "",
    techStack: "",
    expectedUsers: "",
  });
  const [configData, setConfigData] = useState<ConfigurationData>({
    concurrentUsers: "",
    responseTime: "",
    databaseType: "",
    dataVolume: "",
    autoBackups: true,
    sslCertificate: "",
    region: "",
    ddosProtection: true,
    gdprCompliance: false,
    monitoring: true,
    autoScaling: "",
    environmentStrategy: "",
  });
  const [projectId, setProjectId] = useState<number | null>(null);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProjectSubmit = (data: ProjectFormData, id: number) => {
    setProjectData(data);
    setProjectId(id);
    nextStep();
  };
}
```

### Real-Time Progress Simulation
```typescript
// client/src/components/deployment.tsx - Deployment progress logic
useEffect(() => {
  if (!deploymentStarted) return;

  const interval = setInterval(() => {
    setCurrentStepIndex((prev) => {
      if (prev >= steps.length - 1) {
        setDeploymentComplete(true);
        clearInterval(interval);
        return prev;
      }
      
      // Update step status
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps];
        if (newSteps[prev]) {
          newSteps[prev].status = "completed";
        }
        if (newSteps[prev + 1]) {
          newSteps[prev + 1].status = "in-progress";
        }
        return newSteps;
      });

      // Add log entry with timestamp
      const time = new Date().toLocaleTimeString();
      setLogs((prevLogs) => [
        ...prevLogs,
        `[${time}] ✓ ${steps[prev]?.name} completed successfully`,
      ]);

      // Update progress percentage
      const newProgress = Math.round(((prev + 2) / steps.length) * 100);
      setProgress(newProgress);

      return prev + 1;
    });
  }, 3000); // 3-second intervals

  return () => clearInterval(interval);
}, [deploymentStarted, steps.length]);
```

## TanStack Query Integration

### Query Client Configuration
```typescript
// client/src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof Response && error.status === 404) {
          return false; // Don't retry 404s
        }
        return failureCount < 2;
      },
    },
  },
});

// Generic API request helper
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any
): Promise<Response> {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  await throwIfResNotOk(response);
  return response;
}
```

### Template Generation Query
```typescript
// client/src/components/templates.tsx
const generateTemplatesMutation = useMutation({
  mutationFn: async () => {
    const response = await apiRequest("POST", `/api/projects/${projectId}/templates`, {});
    return response.json();
  },
  onSuccess: (data) => {
    setTemplates(data);
    setLoading(false);
  },
  onError: () => {
    toast({
      title: "Error",
      description: "Failed to generate templates",
      variant: "destructive",
    });
    setLoading(false);
  },
});
```

## UI Component Implementation

### Radix UI Integration
```typescript
// Form components with Radix UI primitives
<FormField
  control={form.control}
  name="expectedUsers"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-sm font-semibold text-gray-700">Expected User Base</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-xl">
            <SelectValue placeholder="Select expected users" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="1-100">1-100 users</SelectItem>
          <SelectItem value="100-1000">100-1,000 users</SelectItem>
          <SelectItem value="1000-10000">1,000-10,000 users</SelectItem>
          <SelectItem value="10000+">10,000+ users</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Progress Component Implementation
```typescript
// client/src/components/step-progress.tsx
export default function StepProgress({ currentStep }: StepProgressProps) {
  const steps = [
    { number: 1, label: "Project Input" },
    { number: 2, label: "Configuration" },
    { number: 3, label: "Templates" },
    { number: 4, label: "Deploy" },
  ];

  return (
    <div className="flex items-center justify-center space-x-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step.number <= currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {step.number}
            </div>
            <span
              className={`ml-3 text-sm font-medium ${
                step.number <= currentStep ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-gray-300 ml-8"></div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling Strategy

### Global Error Boundary
```typescript
// server/index.ts - Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error handler:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: 'File upload error', details: err.message });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});
```

### Frontend Error Handling
```typescript
// React Query error handling with toast notifications
const createProjectMutation = useMutation({
  mutationFn: async (data: ProjectFormData) => {
    const response = await apiRequest("POST", "/api/projects", data);
    return response.json();
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: error.message || "Failed to create project",
      variant: "destructive",
    });
  },
});
```

This implementation demonstrates production-ready patterns with type safety, error handling, and scalable architecture while maintaining zero external API dependencies.