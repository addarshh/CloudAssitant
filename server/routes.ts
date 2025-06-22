import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, configurationSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  // Upload project files
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

  // Update project configuration
  app.put("/api/projects/:id/configuration", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const configuration = configurationSchema.parse(req.body);
      
      const updatedProject = await storage.updateProject(projectId, {
        configuration
      });

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  // Generate infrastructure templates
  app.post("/api/projects/:id/templates", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Simulate template generation delay
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

  // Start deployment
  app.post("/api/projects/:id/deploy", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { provider } = req.body;
      
      const updatedProject = await storage.updateProject(projectId, {
        selectedProvider: provider,
        deploymentStatus: "deploying"
      });

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ message: "Deployment started", project: updatedProject });
    } catch (error) {
      res.status(500).json({ error: "Deployment failed to start" });
    }
  });

  // Get deployment status
  app.get("/api/projects/:id/deployment-status", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({
        status: project.deploymentStatus,
        progress: project.deploymentStatus === "deploying" ? Math.floor(Math.random() * 100) : 100
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get deployment status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

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
  # VPC Configuration
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '\${AWS::StackName}-vpc'
      
  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: application
      Scheme: internet-facing
      SecurityGroups: [!Ref ALBSecurityGroup]
      Subnets: [!Ref PublicSubnet1, !Ref PublicSubnet2]
      
  # Auto Scaling Group
  AutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      MinSize: 2
      MaxSize: 10
      DesiredCapacity: 2
      VPCZoneIdentifier: [!Ref PrivateSubnet1, !Ref PrivateSubnet2]
      LaunchTemplate:
        LaunchTemplateId: !Ref LaunchTemplate
        Version: !GetAtt LaunchTemplate.LatestVersionNumber
        
  # RDS Database
  DatabaseInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.micro
      Engine: postgres
      EngineVersion: 13.7
      MultiAZ: true
      StorageEncrypted: true
      BackupRetentionPeriod: 7

Outputs:
  ApplicationURL:
    Description: Application Load Balancer URL
    Value: !Sub 'https://\${ApplicationLoadBalancer.DNSName}'
    Export:
      Name: !Sub '\${AWS::StackName}-ApplicationURL'`;
}

function generateGCPTemplate(project: any): string {
  return `# Google Cloud Deployment Manager Template
resources:
- name: vpc-network
  type: compute.v1.network
  properties:
    autoCreateSubnetworks: false
    description: VPC network for ${project.name}
    
- name: app-subnet
  type: compute.v1.subnetwork
  properties:
    network: $(ref.vpc-network.selfLink)
    ipCidrRange: 10.0.1.0/24
    region: us-central1
    description: Application subnet
    
- name: database
  type: sqladmin.v1beta4.instance
  properties:
    databaseVersion: POSTGRES_13
    region: us-central1
    settings:
      tier: db-custom-2-4096
      backupConfiguration:
        enabled: true
        startTime: "03:00"
      ipConfiguration:
        ipv4Enabled: true
        authorizedNetworks: []
        
- name: instance-template
  type: compute.v1.instanceTemplate
  properties:
    properties:
      machineType: n2-standard-2
      disks:
      - boot: true
        initializeParams:
          sourceImage: projects/debian-cloud/global/images/family/debian-11
      networkInterfaces:
      - network: $(ref.vpc-network.selfLink)
        subnetwork: $(ref.app-subnet.selfLink)
        
- name: managed-instance-group
  type: compute.v1.instanceGroupManager
  properties:
    baseInstanceName: ${project.name.toLowerCase()}-instance
    instanceTemplate: $(ref.instance-template.selfLink)
    targetSize: 2
    zone: us-central1-a`;
}

function generateAzureTemplate(project: any): string {
  return `{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "environment": {
      "type": "string",
      "defaultValue": "production",
      "allowedValues": ["development", "staging", "production"]
    },
    "projectName": {
      "type": "string",
      "defaultValue": "${project.name}",
      "metadata": {
        "description": "Name of the project"
      }
    }
  },
  "variables": {
    "location": "[resourceGroup().location]",
    "vnetName": "[concat(parameters('projectName'), '-vnet')]",
    "subnetName": "[concat(parameters('projectName'), '-subnet')]",
    "nsgName": "[concat(parameters('projectName'), '-nsg')]"
  },
  "resources": [
    {
      "type": "Microsoft.Network/virtualNetworks",
      "apiVersion": "2021-02-01",
      "name": "[variables('vnetName')]",
      "location": "[variables('location')]",
      "properties": {
        "addressSpace": {
          "addressPrefixes": ["10.0.0.0/16"]
        },
        "subnets": [
          {
            "name": "[variables('subnetName')]",
            "properties": {
              "addressPrefix": "10.0.1.0/24",
              "networkSecurityGroup": {
                "id": "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
              }
            }
          }
        ]
      },
      "dependsOn": [
        "[resourceId('Microsoft.Network/networkSecurityGroups', variables('nsgName'))]"
      ]
    },
    {
      "type": "Microsoft.DBforPostgreSQL/servers",
      "apiVersion": "2017-12-01",
      "name": "[concat(parameters('projectName'), '-database')]",
      "location": "[variables('location')]",
      "sku": {
        "name": "B_Gen5_2",
        "tier": "Basic",
        "capacity": 2,
        "size": "51200",
        "family": "Gen5"
      },
      "properties": {
        "createMode": "Default",
        "version": "11",
        "administratorLogin": "dbadmin",
        "administratorLoginPassword": "[concat('P@ssw0rd', uniqueString(resourceGroup().id))]",
        "storageProfile": {
          "storageMB": 51200,
          "backupRetentionDays": 7,
          "geoRedundantBackup": "Disabled"
        }
      }
    }
  ],
  "outputs": {
    "vnetId": {
      "type": "string",
      "value": "[resourceId('Microsoft.Network/virtualNetworks', variables('vnetName'))]"
    },
    "databaseFQDN": {
      "type": "string",
      "value": "[reference(resourceId('Microsoft.DBforPostgreSQL/servers', concat(parameters('projectName'), '-database'))).fullyQualifiedDomainName]"
    }
  }
}`;
}
