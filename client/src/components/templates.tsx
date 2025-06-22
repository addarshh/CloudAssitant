import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Settings, Download, Copy, X, Rocket } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@/lib/types";

interface TemplatesProps {
  onNext: () => void;
  onBack: () => void;
  projectId: number;
}

export default function Templates({ onNext, onBack, projectId }: TemplatesProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    // Start generating templates
    setTimeout(() => {
      generateTemplatesMutation.mutate();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const closeTemplateDetails = () => {
    setSelectedTemplate(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Template code copied to clipboard",
    });
  };

  const downloadTemplate = (template: Template) => {
    const element = document.createElement("a");
    const file = new Blob([template.code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${template.provider}-template.${template.provider === 'azure' ? 'json' : 'yaml'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Infrastructure Templates</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your requirements, here are optimized infrastructure templates for each cloud provider.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Settings className="text-primary text-2xl animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Templates...</h3>
            <p className="text-gray-600">Analyzing your requirements and creating optimized infrastructure</p>
            <div className="w-64 mx-auto mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}

        {/* Generated Templates */}
        {!loading && Object.keys(templates).length > 0 && (
          <>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* AWS Template */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">AWS</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">AWS</h3>
                  </div>
                  <span className="bg-success text-white text-xs px-2 py-1 rounded-full">Recommended</span>
                </div>
                <div className="space-y-3 text-sm text-gray-700 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>EC2 t3.medium (Auto-scaling)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>RDS PostgreSQL (Multi-AZ)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>CloudFront CDN</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Application Load Balancer</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-orange-600">${templates.aws?.estimatedCost}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Button
                  className="w-full mt-4 bg-orange-600 text-white hover:bg-orange-700"
                  onClick={() => selectTemplate(templates.aws)}
                >
                  View Template
                </Button>
              </div>

              {/* GCP Template */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">GCP</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">GCP</h3>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Cost-Effective</span>
                </div>
                <div className="space-y-3 text-sm text-gray-700 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Compute Engine n2-standard-2</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Cloud SQL PostgreSQL</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Cloud CDN</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Load Balancing</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-600">${templates.gcp?.estimatedCost}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Button
                  className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => selectTemplate(templates.gcp)}
                >
                  View Template
                </Button>
              </div>

              {/* Azure Template */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">AZ</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Azure</h3>
                  </div>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Enterprise</span>
                </div>
                <div className="space-y-3 text-sm text-gray-700 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Virtual Machines B2s</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Azure Database PostgreSQL</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Azure CDN</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 mr-2">•</span>
                    <span>Application Gateway</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-purple-600">${templates.azure?.estimatedCost}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Button
                  className="w-full mt-4 bg-purple-600 text-white hover:bg-purple-700"
                  onClick={() => selectTemplate(templates.azure)}
                >
                  View Template
                </Button>
              </div>
            </div>

            {/* Template Details */}
            {selectedTemplate && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedTemplate.name}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={closeTemplateDetails}>
                    <X size={20} />
                  </Button>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap">
                    {selectedTemplate.code}
                  </pre>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadTemplate(selectedTemplate)}
                    >
                      <Download className="mr-2" size={16} />
                      Download
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => copyToClipboard(selectedTemplate.code)}
                    >
                      <Copy className="mr-2" size={16} />
                      Copy
                    </Button>
                  </div>
                  <span className="text-sm text-gray-600">Ready for deployment</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-xl"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back
          </Button>
          {!loading && selectedTemplate && (
            <Button
              className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90"
              onClick={onNext}
            >
              Deploy Now
              <Rocket className="ml-2" size={16} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
