import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Download, Copy, X, Rocket, Cpu, Shield, TrendingUp, Lightbulb, Brain, Network, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AITemplate, ArchitectureAnalysis, Recommendations } from "@shared/schema";

interface AITemplatesProps {
  onNext: () => void;
  onBack: () => void;
  projectId: number;
}

export default function AITemplates({ onNext, onBack, projectId }: AITemplatesProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [templates, setTemplates] = useState<Record<string, any>>({});
  const [architecture, setArchitecture] = useState<ArchitectureAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
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
        description: "Failed to generate AI templates",
        variant: "destructive",
      });
      setLoading(false);
    },
  });

  const generateArchitectureMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/architecture`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setArchitecture(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate architecture analysis",
        variant: "destructive",
      });
    },
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/recommendations`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recommendations",
        variant: "destructive",
      });
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

    // Start generating AI analysis
    setTimeout(() => {
      generateTemplatesMutation.mutate();
      generateArchitectureMutation.mutate();
      generateRecommendationsMutation.mutate();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const selectTemplate = (template: any) => {
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

  const downloadTemplate = (template: any) => {
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Brain className="text-primary" />
            AI-Powered Infrastructure Templates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI has analyzed your requirements and generated optimized infrastructure templates with
            detailed architecture analysis and recommendations.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Settings className="text-primary text-2xl animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analyzing Your Project...</h3>
            <p className="text-gray-600">Generating templates, architecture diagrams, and optimization recommendations</p>
            <div className="w-64 mx-auto mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        )}

        {/* AI Analysis Tabs */}
        {!loading && Object.keys(templates).length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* AWS Template */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">AWS</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">AWS</h3>
                    </div>
                    <Badge className="bg-success text-white">AI Recommended</Badge>
                  </div>
                  
                  {templates.aws?.optimizations && (
                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      {templates.aws.optimizations.slice(0, 3).map((opt: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <Zap className="w-3 h-3 mr-2 text-orange-600" />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-orange-600">${templates.aws?.estimatedCost}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <Button
                    className="w-full bg-orange-600 text-white hover:bg-orange-700"
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
                    <Badge variant="secondary">Cost-Effective</Badge>
                  </div>
                  
                  {templates.gcp?.optimizations && (
                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      {templates.gcp.optimizations.slice(0, 3).map((opt: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <Zap className="w-3 h-3 mr-2 text-blue-600" />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">${templates.gcp?.estimatedCost}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
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
                    <Badge variant="outline">Enterprise</Badge>
                  </div>
                  
                  {templates.azure?.optimizations && (
                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      {templates.azure.optimizations.slice(0, 3).map((opt: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <Zap className="w-3 h-3 mr-2 text-purple-600" />
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <span className="text-2xl font-bold text-purple-600">${templates.azure?.estimatedCost}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <Button
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    onClick={() => selectTemplate(templates.azure)}
                  >
                    View Template
                  </Button>
                </div>
              </div>

              {/* Template Details */}
              {selectedTemplate && (
                <div className="bg-gray-50 rounded-xl p-6 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedTemplate.name}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={closeTemplateDetails}>
                      <X size={20} />
                    </Button>
                  </div>

                  {/* AI Insights */}
                  {selectedTemplate.reasoning && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Analysis
                      </h4>
                      <p className="text-blue-800 text-sm">{selectedTemplate.reasoning}</p>
                    </div>
                  )}

                  {/* Security & Scalability Features */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {selectedTemplate.securityConsiderations && selectedTemplate.securityConsiderations.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Security Features
                        </h4>
                        <ul className="text-green-800 text-sm space-y-1">
                          {selectedTemplate.securityConsiderations.map((item: string, index: number) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedTemplate.scalabilityFeatures && selectedTemplate.scalabilityFeatures.length > 0 && (
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Scalability Features
                        </h4>
                        <ul className="text-orange-800 text-sm space-y-1">
                          {selectedTemplate.scalabilityFeatures.map((item: string, index: number) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                    <pre className="text-green-400 text-sm whitespace-pre-wrap">
                      {selectedTemplate.code}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between">
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
                    <span className="text-sm text-gray-600">AI-Generated Template</span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Architecture Tab */}
            <TabsContent value="architecture" className="space-y-6">
              {architecture ? (
                <div className="space-y-6">
                  {/* Architecture Components */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Network className="text-primary mr-3" />
                      System Components
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {architecture.components.map((component, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-semibold text-gray-900">{component.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{component.type}</p>
                          <p className="text-sm text-gray-700">{component.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Flow */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Cpu className="text-secondary mr-3" />
                      Data Flow
                    </h3>
                    <div className="space-y-3">
                      {architecture.dataFlow.map((flow, index) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1">
                            <div className="flex items-center text-sm">
                              <span className="font-medium text-blue-900">{flow.from}</span>
                              <span className="mx-2 text-blue-600">→</span>
                              <span className="font-medium text-blue-900">{flow.to}</span>
                              <Badge variant="outline" className="ml-2">{flow.type}</Badge>
                            </div>
                            <p className="text-xs text-blue-700 mt-1">{flow.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scaling Strategy */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="text-success mr-3" />
                      Scaling Strategy
                    </h3>
                    <p className="text-gray-700">{architecture.scalingStrategy}</p>
                  </div>

                  {/* Bottlenecks & Recommendations */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-3">Potential Bottlenecks</h4>
                      <ul className="space-y-2">
                        {(architecture.bottlenecks as { name: string; reason: string; mitigation: string }[]).map(({ name, reason, mitigation }, index) => (
                          <li key={index} className="text-amber-800 text-sm">
                            <span className="font-bold">{name}:</span> {reason}
                            {mitigation && (
                              <span className="block text-xs text-amber-700 ml-4">Mitigation: {mitigation}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-3">Architecture Recommendations</h4>
                      <ul className="space-y-2">
                        {(architecture.recommendations as { title: string; rationale: string; implementation?: string; impact?: string }[]).map(({ title, rationale, implementation, impact }, index) => (
                          <li key={index} className="text-green-800 text-sm">
                            <span className="font-bold">{title}:</span> {rationale}
                            {implementation && (
                              <span className="block text-xs text-green-700 ml-4">Implementation: {implementation}</span>
                            )}
                            {impact && (
                              <span className="block text-xs text-green-700 ml-4">Impact: {impact}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="mx-auto text-4xl text-gray-400 mb-4 animate-spin" />
                  <p className="text-gray-600">Generating architecture analysis...</p>
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Brain className="text-primary mr-3" />
                  AI Analysis Summary
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Cost Analysis */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-900 mb-3">Cost Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">AWS:</span>
                        <span className="font-medium">${templates.aws?.estimatedCost}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">GCP:</span>
                        <span className="font-medium">${templates.gcp?.estimatedCost}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Azure:</span>
                        <span className="font-medium">${templates.azure?.estimatedCost}/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Score */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-900 mb-3">Security Features</h4>
                    <div className="space-y-2">
                      {templates.aws?.securityConsiderations?.slice(0, 3).map((security: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <Shield className="w-3 h-3 mr-2 text-green-600" />
                          <span className="text-gray-700">{security}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Score */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-900 mb-3">Performance Features</h4>
                    <div className="space-y-2">
                      {templates.aws?.scalabilityFeatures?.slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center text-sm">
                          <Zap className="w-3 h-3 mr-2 text-orange-600" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Comparison */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Provider Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Feature</th>
                        <th className="text-center py-2">AWS</th>
                        <th className="text-center py-2">GCP</th>
                        <th className="text-center py-2">Azure</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Monthly Cost</td>
                        <td className="text-center py-2">${templates.aws?.estimatedCost}</td>
                        <td className="text-center py-2">${templates.gcp?.estimatedCost}</td>
                        <td className="text-center py-2">${templates.azure?.estimatedCost}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Security Features</td>
                        <td className="text-center py-2">{templates.aws?.securityConsiderations?.length || 0}</td>
                        <td className="text-center py-2">{templates.gcp?.securityConsiderations?.length || 0}</td>
                        <td className="text-center py-2">{templates.azure?.securityConsiderations?.length || 0}</td>
                      </tr>
                      <tr>
                        <td className="py-2">Scalability Features</td>
                        <td className="text-center py-2">{templates.aws?.scalabilityFeatures?.length || 0}</td>
                        <td className="text-center py-2">{templates.gcp?.scalabilityFeatures?.length || 0}</td>
                        <td className="text-center py-2">{templates.azure?.scalabilityFeatures?.length || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {recommendations ? (
                <div className="space-y-6">
                  {/* Performance Recommendations */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Zap className="text-orange-600 mr-3" />
                      Performance Optimizations
                    </h3>
                    <div className="grid gap-4">
                      {recommendations.performance.map((perf, index) => (
                        <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-orange-900">{perf.title}</h4>
                            <div className="flex gap-2">
                              <Badge variant={perf.impact === 'high' ? 'destructive' : perf.impact === 'medium' ? 'default' : 'secondary'}>
                                {perf.impact} impact
                              </Badge>
                              <Badge variant="outline">
                                {perf.effort} effort
                              </Badge>
                            </div>
                          </div>
                          <p className="text-orange-800 text-sm">{perf.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Recommendations */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Shield className="text-green-600 mr-3" />
                      Security Improvements
                    </h3>
                    <div className="grid gap-4">
                      {recommendations.security.map((sec, index) => (
                        <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-green-900">{sec.title}</h4>
                            <Badge variant={sec.severity === 'critical' ? 'destructive' : sec.severity === 'high' ? 'default' : 'secondary'}>
                              {sec.severity} severity
                            </Badge>
                          </div>
                          <p className="text-green-800 text-sm mb-2">{sec.description}</p>
                          <p className="text-green-700 text-xs font-medium">Implementation: {sec.implementation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Recommendations */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="text-blue-600 mr-3" />
                      Cost Optimizations
                    </h3>
                    <div className="grid gap-4">
                      {recommendations.cost.map((cost, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-blue-900">{cost.title}</h4>
                            <Badge className="bg-blue-600 text-white">{cost.savings}</Badge>
                          </div>
                          <p className="text-blue-800 text-sm mb-2">{cost.description}</p>
                          <p className="text-blue-700 text-xs">Tradeoffs: {cost.tradeoffs}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-600">Generating AI recommendations...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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