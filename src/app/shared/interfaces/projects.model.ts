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
