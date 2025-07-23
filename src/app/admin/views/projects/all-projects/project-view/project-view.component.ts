import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

// Interfaces matching DB schema
export interface Project {
  id: number;
  name: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  start_date: Date;
  end_date: Date;
  created_by: number;
  type_id: number;
  status_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: 'upcoming' | 'inprogress' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  assignee: string;
  status: 'upcoming' | 'inprogress' | 'completed';
  created_at: Date;
  updated_at: Date;
}

@Component({
  selector: 'app-project-view',
  standalone: true,
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.css'],
  imports: [CommonModule, DatePipe, DecimalPipe, DragDropModule],
})
export class ProjectViewComponent {
  project: Project;
  milestones: Milestone[] = [];
  tasks: Task[] = [];
  readonly projectId: number;

  // Kanban columns for drag and drop
  milestoneColumns: { [key: string]: Milestone[] } = {
    upcoming: [],
    inprogress: [],
    completed: [],
  };
  taskColumns: { [key: string]: Task[] } = {
    upcoming: [],
    inprogress: [],
    completed: [],
  };
  columns: Array<'upcoming' | 'inprogress' | 'completed'> = ['upcoming', 'inprogress', 'completed'];
  
  // Added these properties for drag and drop IDs
  milestoneDropListIds: string[] = [];
  taskDropListIds: string[] = [];

  constructor(private route: ActivatedRoute) {
    this.projectId = +this.route.snapshot.params['id'];
    
    // Initialize IDs for drag and drop
    this.milestoneDropListIds = this.columns.map(c => `milestone-${c}`);
    this.taskDropListIds = this.columns.map(c => `task-${c}`);
    
    // Dummy data with correct structure
    this.project = {
      id: 1,
      name: 'Steam education for Durkut',
      description:
        'Steam education for Durkut is a project to provide steam education to the students of Durkut village in Pakistan. The project aims to provide students with the necessary skills and knowledge to succeed in the 21st century. The project will include a series of workshops, training sessions, and hands-on activities to help students learn about science, technology, engineering, arts, and mathematics. The project will also provide students with access to mentors, resources, and opportunities to help them pursue their interests and achieve their goals.',
      type_id: 2,
      goal_amount: 50000,
      raised_amount: 37500,
      start_date: new Date('2024-02-02'),
      end_date: new Date('2024-11-22'),
      status_id: 2,
      created_by: 1,
      created_at: new Date('2024-02-02'),
      updated_at: new Date('2024-02-02'),
    };
    this.milestones = [
      {
        id: 1,
        project_id: 1,
        title: 'Start project',
        description: 'Got survey of the area for analysis',
        status: 'completed',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
      {
        id: 2,
        project_id: 1,
        title: 'Beta Testing',
        description: 'Conduct beta testing with selected users.',
        status: 'inprogress',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
      {
        id: 3,
        project_id: 1,
        title: 'Full Launch',
        description: 'Launch the CRM system to all users.',
        status: 'upcoming',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
      {
        id: 4,
        project_id: 1,
        title: 'User Training',
        description: 'Provide training to all users on how to use the CRM system.',
        status: 'upcoming',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
    ];
    this.tasks = [
      {
        id: 1,
        project_id: 1,
        title: 'Auth flow bugfix',
        description: 'Fix the authentication flow bug in the CRM system.',
        assignee: 'John Doe',
        status: 'completed',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
      {
        id: 2,
        project_id: 1,
        title: 'UI improvements',
        description: 'Improve the user interface of the CRM system.',
        assignee: 'Jane Smith',
        status: 'inprogress',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
      {
        id: 3,
        project_id: 1,
        title: 'Add new feature',
        description: 'Add the new reporting feature to the CRM system.',
        assignee: 'Mike Johnson',
        status: 'upcoming',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
      {
        id: 4,
        project_id: 1,
        title: 'Performance testing',
        description: 'Conduct performance testing of the CRM system.',
        assignee: 'John Doe',
        status: 'upcoming',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
      {
        id: 5,
        project_id: 1,
        title: 'Water Channel',
        description: 'Collect feedback from users on the CRM system.',
        assignee: 'Jane Smith',
        status: 'completed',
        created_at: new Date('2024-02-02'),
        updated_at: new Date('2024-02-02'),
      },
    ];
    // Fill Kanban columns
    this.milestoneColumns['upcoming'] = this.milestones.filter(m => m.status === 'upcoming');
    this.milestoneColumns['inprogress'] = this.milestones.filter(m => m.status === 'inprogress');
    this.milestoneColumns['completed'] = this.milestones.filter(m => m.status === 'completed');
    this.taskColumns['upcoming'] = this.tasks.filter(t => t.status === 'upcoming');
    this.taskColumns['inprogress'] = this.tasks.filter(t => t.status === 'inprogress');
    this.taskColumns['completed'] = this.tasks.filter(t => t.status === 'completed');
  }

  dropMilestone(event: CdkDragDrop<Milestone[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the status of the milestone based on the new container
      const milestone = event.container.data[event.currentIndex];
      const newStatus = event.container.id.split('-')[1] as 'upcoming' | 'inprogress' | 'completed';
      milestone.status = newStatus;
    }
  }

  dropTask(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the status of the task based on the new container
      const task = event.container.data[event.currentIndex];
      const newStatus = event.container.id.split('-')[1] as 'upcoming' | 'inprogress' | 'completed';
      task.status = newStatus;
    }
  }
  
  // Helper function to get column display name
  getColumnDisplayName(col: string): string {
    switch (col) {
      case 'upcoming': return 'Upcoming';
      case 'inprogress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return col;
    }
  }
}