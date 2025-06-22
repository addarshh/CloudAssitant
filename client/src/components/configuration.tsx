import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Gauge, Database, Shield, Rocket } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { configurationSchema } from "@shared/schema";
import type { ConfigurationData } from "@/lib/types";

interface ConfigurationProps {
  onSubmit: (data: ConfigurationData) => void;
  onBack: () => void;
  projectId: number;
}

export default function Configuration({ onSubmit, onBack, projectId }: ConfigurationProps) {
  const { toast } = useToast();

  const form = useForm<ConfigurationData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
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
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (data: ConfigurationData) => {
      const response = await apiRequest("PUT", `/api/projects/${projectId}/configuration`, data);
      return response.json();
    },
    onSuccess: () => {
      onSubmit(form.getValues());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ConfigurationData) => {
    updateConfigMutation.mutate(data);
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Production Configuration</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Let's configure your production environment for optimal performance and scalability.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Performance Requirements */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Gauge className="text-primary mr-3" />
                Performance & Scale
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="concurrentUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Expected Concurrent Users</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select concurrent users" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="50-100">50-100 users</SelectItem>
                          <SelectItem value="100-500">100-500 users</SelectItem>
                          <SelectItem value="500-1000">500-1,000 users</SelectItem>
                          <SelectItem value="1000-5000">1,000-5,000 users</SelectItem>
                          <SelectItem value="5000+">5,000+ users</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responseTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Response Time Requirement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select response time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-200ms">Under 200ms (Ultra-fast)</SelectItem>
                          <SelectItem value="under-500ms">Under 500ms (Fast)</SelectItem>
                          <SelectItem value="under-1s">Under 1s (Standard)</SelectItem>
                          <SelectItem value="under-2s">Under 2s (Acceptable)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Storage & Database */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Database className="text-secondary mr-3" />
                Data & Storage
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="databaseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Database Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select database type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="postgresql">PostgreSQL (Relational)</SelectItem>
                          <SelectItem value="mongodb">MongoDB (Document)</SelectItem>
                          <SelectItem value="mysql">MySQL (Relational)</SelectItem>
                          <SelectItem value="dynamodb">DynamoDB (NoSQL)</SelectItem>
                          <SelectItem value="redis">Redis (Cache/Session)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Estimated Data Volume</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select data volume" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-1gb">Under 1GB (Small)</SelectItem>
                          <SelectItem value="1-10gb">1-10GB (Medium)</SelectItem>
                          <SelectItem value="10-100gb">10-100GB (Large)</SelectItem>
                          <SelectItem value="100gb-plus">100GB+ (Enterprise)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="autoBackups"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-gray-700">
                          Enable automatic backups
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Shield className="text-success mr-3" />
                Security & Compliance
              </h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sslCertificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">SSL Certificate</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                              <SelectValue placeholder="Select SSL option" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="auto-managed">Auto-managed SSL</SelectItem>
                            <SelectItem value="custom">Custom SSL certificate</SelectItem>
                            <SelectItem value="wildcard">Wildcard SSL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">Geographic Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="us-east-1">US East (Virginia)</SelectItem>
                            <SelectItem value="us-west-2">US West (California)</SelectItem>
                            <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                            <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="ddosProtection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-gray-700">
                            Enable DDoS protection
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gdprCompliance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-gray-700">
                            GDPR compliance features
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monitoring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-gray-700">
                            Enable monitoring and logging
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Deployment Preferences */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Rocket className="text-warning mr-3" />
                Deployment Preferences
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="autoScaling"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Auto-scaling Strategy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select auto-scaling" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative (Cost-optimized)</SelectItem>
                          <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                          <SelectItem value="aggressive">Aggressive (Performance-optimized)</SelectItem>
                          <SelectItem value="custom">Custom scaling rules</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmentStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Environment Strategy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select environment strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="production-only">Production only</SelectItem>
                          <SelectItem value="staging-production">Staging + Production</SelectItem>
                          <SelectItem value="dev-staging-production">Dev + Staging + Production</SelectItem>
                          <SelectItem value="custom">Custom environments</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-xl"
              >
                <ArrowLeft className="mr-2" size={16} />
                Back
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90"
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    Generate Templates
                    <ArrowRight className="ml-2" size={16} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
