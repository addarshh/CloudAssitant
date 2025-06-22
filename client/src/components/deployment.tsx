import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, AlertTriangle, Rocket, ExternalLink, BarChart3, Download, Plus, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DeploymentStep, ProjectFormData } from "@/lib/types";

interface DeploymentProps {
  onBack: () => void;
  projectId: number;
  projectData: ProjectFormData;
}

export default function Deployment({ onBack, projectId, projectData }: DeploymentProps) {
  const [deploymentStarted, setDeploymentStarted] = useState(false);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "[15:42:31] Starting CloudFormation deployment...",
    "[15:42:33] ✓ Template validation successful",
  ]);

  const { toast } = useToast();

  const deploymentSteps: DeploymentStep[] = [
    {
      id: "validate",
      name: "Validating Configuration",
      description: "Template syntax and dependencies verified",
      status: "completed",
    },
    {
      id: "provision",
      name: "Provisioning Resources",
      description: "Creating VPC, subnets, and security groups...",
      status: "in-progress",
    },
    {
      id: "database",
      name: "Setting up Database",
      description: "Configuring PostgreSQL with Multi-AZ deployment",
      status: "pending",
    },
    {
      id: "compute",
      name: "Launching Compute Instances",
      description: "Starting EC2 instances and configuring auto-scaling",
      status: "pending",
    },
    {
      id: "deploy-app",
      name: "Deploying Application",
      description: "Building and deploying your application code",
      status: "pending",
    },
    {
      id: "finalize",
      name: "Final Configuration",
      description: "Setting up monitoring, SSL, and DNS",
      status: "pending",
    },
  ];

  const [steps, setSteps] = useState(deploymentSteps);

  const startDeploymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/deploy`, {
        provider: "aws",
      });
      return response.json();
    },
    onSuccess: () => {
      setDeploymentStarted(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start deployment",
        variant: "destructive",
      });
    },
  });

  const { data: deploymentStatus } = useQuery({
    queryKey: [`/api/projects/${projectId}/deployment-status`],
    enabled: deploymentStarted && !deploymentComplete,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!deploymentStarted) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setDeploymentComplete(true);
          clearInterval(interval);
          return prev;
        }
        
        // Update current step to completed
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

        // Add log entry
        const time = new Date().toLocaleTimeString();
        setLogs((prevLogs) => [
          ...prevLogs,
          `[${time}] ✓ ${steps[prev]?.name} completed successfully`,
        ]);

        // Update progress
        const newProgress = Math.round(((prev + 2) / steps.length) * 100);
        setProgress(newProgress);

        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [deploymentStarted, steps.length]);

  const startDeployment = () => {
    startDeploymentMutation.mutate();
  };

  const resetDemo = () => {
    window.location.reload();
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Deploy Your Infrastructure</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to launch? We'll deploy your infrastructure and application with one click.
          </p>
        </div>

        {/* Pre-deployment Summary */}
        {!deploymentStarted && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <AlertTriangle className="mr-2" />
                Deployment Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Project:</span>
                  <span className="ml-2 text-gray-900">{projectData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Provider:</span>
                  <span className="ml-2 text-gray-900">Amazon Web Services</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Region:</span>
                  <span className="ml-2 text-gray-900">us-east-1 (Virginia)</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estimated Cost:</span>
                  <span className="ml-2 text-gray-900">$247/month</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Deployment Time:</span>
                  <span className="ml-2 text-gray-900">~15-20 minutes</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expected Users:</span>
                  <span className="ml-2 text-gray-900">{projectData.expectedUsers}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                <AlertTriangle className="mr-2" />
                Important Notes
              </h3>
              <ul className="text-sm text-amber-800 space-y-2">
                <li>• You'll need to configure your domain DNS settings after deployment</li>
                <li>• Database credentials will be automatically generated and securely stored</li>
                <li>• SSL certificates will be automatically provisioned and renewed</li>
                <li>• Monitoring and alerting will be enabled by default</li>
              </ul>
            </div>

            <div className="text-center">
              <Button
                className="bg-gradient-to-r from-primary to-secondary text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={startDeployment}
                disabled={startDeploymentMutation.isPending}
              >
                <Rocket className="mr-3" />
                {startDeploymentMutation.isPending ? "Starting Deployment..." : "Deploy Infrastructure"}
              </Button>
            </div>
          </div>
        )}

        {/* Deployment Progress */}
        {deploymentStarted && !deploymentComplete && (
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-4 ${
                      step.status === "completed"
                        ? "bg-success text-white"
                        : step.status === "in-progress"
                        ? "bg-primary text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle size={16} />
                    ) : step.status === "in-progress" ? (
                      <Settings className="animate-spin" size={16} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{step.name}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                  <Badge
                    variant={
                      step.status === "completed"
                        ? "default"
                        : step.status === "in-progress"
                        ? "secondary"
                        : "outline"
                    }
                    className={
                      step.status === "completed"
                        ? "bg-success text-white"
                        : step.status === "in-progress"
                        ? "bg-primary text-white"
                        : ""
                    }
                  >
                    {step.status === "completed"
                      ? "Completed"
                      : step.status === "in-progress"
                      ? "In Progress"
                      : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="mt-2 text-xs text-gray-600">
                Estimated time remaining: {Math.max(0, 18 - Math.floor(progress / 6))} minutes
              </div>
            </div>

            {/* Real-time Logs */}
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">Deployment Logs</h4>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ExternalLink className="mr-1" size={14} />
                  Expand
                </Button>
              </div>
              <div className="text-green-400 text-sm font-mono space-y-1 max-h-40 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deployment Success */}
        {deploymentComplete && (
          <div className="text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-success text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Deployment Successful! 🎉</h3>
            <p className="text-gray-600 mb-8">Your infrastructure is now live and ready to serve your users.</p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Your Application Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Application URL:</span>
                  <a href="#" className="text-primary hover:underline">
                    https://{projectData.name.toLowerCase().replace(/\s+/g, '-')}-prod.cloudforge.io
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin Dashboard:</span>
                  <a href="#" className="text-primary hover:underline">
                    https://admin.{projectData.name.toLowerCase().replace(/\s+/g, '-')}-prod.cloudforge.io
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database Endpoint:</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {projectData.name.toLowerCase().replace(/\s+/g, '-')}-db.amazonaws.com
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deployment ID:</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">cf-stack-{projectId}</code>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90">
                <ExternalLink className="mr-2" size={16} />
                Open Application
              </Button>
              <Button variant="secondary" className="px-6 py-3 rounded-xl font-semibold">
                <BarChart3 className="mr-2" size={16} />
                View Monitoring
              </Button>
              <Button variant="secondary" className="px-6 py-3 rounded-xl font-semibold">
                <Download className="mr-2" size={16} />
                Download Config
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {!deploymentComplete && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-xl"
              disabled={deploymentStarted}
            >
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
          )}
          {deploymentComplete && (
            <Button
              className="bg-success text-white px-8 py-3 rounded-xl font-semibold hover:bg-success/90 mx-auto"
              onClick={resetDemo}
            >
              Start New Project
              <Plus className="ml-2" size={16} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
