import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, Lightbulb, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProjectFormData } from "@/lib/types";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.string().optional(),
  expectedUsers: z.string().min(1, "Expected user base is required"),
});

interface ProjectInputProps {
  onSubmit: (data: ProjectFormData, projectId: number) => void;
}

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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const uploadFiles = (projectId: number) => {
    uploadFilesMutation.mutate({ projectId, files });
  };

  const handleSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Describe Your Project</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your application idea and upload any design mockups or architecture diagrams you have.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Text Input Section */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Project Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="My Awesome App"
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                          placeholder="Describe your application idea in detail. What does it do? Who are your users? What are the main features?

For example: 'I'm building a social media platform for pet owners where they can share photos of their pets, connect with other pet owners in their area, and find pet-friendly businesses. Users can create profiles for their pets, post photos and stories, and discover local pet events.'"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Technology Stack (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., React, Node.js, PostgreSQL, Redis"
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Expected User Base</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
              </div>

              {/* Image Upload Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Design Mockups or Architecture
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <CloudUpload className="mx-auto text-4xl text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 mb-2">
                      Drop your files here or <span className="text-primary font-semibold">browse</span>
                    </p>
                    <p className="text-sm text-gray-500">Supports: PNG, JPG, PDF, Figma exports</p>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {files.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Selected files:</p>
                      <ul className="text-sm text-gray-800">
                        {files.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="text-warning mr-2" />
                    Pro Tips
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Include user flow diagrams if available</li>
                    <li>• Architecture sketches help us understand data flow</li>
                    <li>• UI mockups assist with frontend requirements</li>
                    <li>• Database schemas help with storage planning</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                disabled={createProjectMutation.isPending || uploadFilesMutation.isPending}
              >
                {createProjectMutation.isPending || uploadFilesMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    Continue
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
