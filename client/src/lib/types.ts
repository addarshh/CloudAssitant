export interface ProjectFormData {
  name: string;
  description: string;
  techStack: string;
  expectedUsers: string;
}

export interface ConfigurationData {
  concurrentUsers: string;
  responseTime: string;
  databaseType: string;
  dataVolume: string;
  autoBackups: boolean;
  sslCertificate: string;
  region: string;
  ddosProtection: boolean;
  gdprCompliance: boolean;
  monitoring: boolean;
  autoScaling: string;
  environmentStrategy: string;
}

export interface Template {
  name: string;
  code: string;
  estimatedCost: number;
  provider: string;
}

export interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}
