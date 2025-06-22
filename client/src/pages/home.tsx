import { useState } from "react";
import StepProgress from "@/components/step-progress";
import ProjectInput from "@/components/project-input";
import Configuration from "@/components/configuration";
import Templates from "@/components/templates";
import Deployment from "@/components/deployment";
import { CloudUpload, User } from "lucide-react";
import type { ProjectFormData, ConfigurationData } from "@/lib/types";

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

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProjectSubmit = (data: ProjectFormData, id: number) => {
    setProjectData(data);
    setProjectId(id);
    nextStep();
  };

  const handleConfigSubmit = (data: ConfigurationData) => {
    setConfigData(data);
    nextStep();
  };

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <CloudUpload className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">CloudForge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hackathon Demo</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white text-sm" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <StepProgress currentStep={currentStep} />

        {/* Step Content */}
        <div className="mt-12">
          {currentStep === 1 && (
            <ProjectInput onSubmit={handleProjectSubmit} />
          )}
          {currentStep === 2 && (
            <Configuration
              onSubmit={handleConfigSubmit}
              onBack={prevStep}
              projectId={projectId!}
            />
          )}
          {currentStep === 3 && (
            <Templates
              onNext={nextStep}
              onBack={prevStep}
              projectId={projectId!}
            />
          )}
          {currentStep === 4 && (
            <Deployment
              onBack={prevStep}
              projectId={projectId!}
              projectData={projectData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
