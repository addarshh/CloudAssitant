import { projects, type Project, type InsertProject } from "@shared/schema";

export interface IStorage {
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private projects: Map<number, Project>;
  private currentId: number;

  constructor() {
    this.projects = new Map();
    this.currentId = 1;
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
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

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
}

export const storage = new MemStorage();
