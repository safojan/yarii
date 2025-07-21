export interface IProject {
  id: number;
  name: string;
  description: string;
  typeId: number;
  goalAmount: number;
  raisedAmount: number;
  startDate: Date;
  endDate: Date;
  statusId: number;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMilestone {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: 'upcoming' | 'inprogress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignee: string;
  status: 'upcoming' | 'inprogress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}


// /Users/us/Desktop/yarii/src/app/shared/interfaces/projects.model.ts
export interface Project {
  id?: string;
  name: string;
  description: string;
  status?: string;
  progress?: number;
  date_created?: Date;
  last_updated?: Date;
  created_by?: string;
  start_date?: Date;
  end_date?: Date;
  project_type_id?: string;
  projectType?: ProjectType;
}

export interface ProjectType {
  id?: string;
  name: string;
  description?: string;
  date_created?: Date;
  last_updated?: Date;
}

export interface ProjectStatus {
  id?: string;
  name: string;
  colorClass: string;
  description?: string;
}