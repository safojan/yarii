import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForOf } from '@angular/common';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  IProject,
  IMilestone,
  ITask,
} from 'src/app/shared/interfaces/projects.model';

@Component({
  selector: 'app-project-view',
  standalone: true,
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.css'],
  imports: [DatePipe, DecimalPipe, NgForOf],
})
export class ProjectViewComponent {
  project: IProject;
  milestones: IMilestone[] = [];
  tasks: ITask[] = [];
  readonly projectId: number;
  money: any;

  constructor(private route: ActivatedRoute) {
    this.projectId = this.route.snapshot.params['id'];

    this.project = {
      id: 1,
      name: 'Steam education for Durkut',
      description:
        'Steam education for Durkut is a project to provide steam education to the students of Durkut village in Pakistan. The project aims to provide students with the necessary skills and knowledge to succeed in the 21st century. The project will include a series of workshops, training sessions, and hands-on activities to help students learn about science, technology, engineering, arts, and mathematics. The project will also provide students with access to mentors, resources, and opportunities to help them pursue their interests and achieve their goals.',
      typeId: 1,
      goalAmount: 50000,
      raisedAmount: 37500,
      startDate: new Date('2024-02-02'),
      endDate: new Date('2024-11-22'),
      statusId: 2,
      createdBy: 1,
      createdAt: new Date('2024-02-02'),
      updatedAt: new Date('2024-02-02'),
    };

    this.milestones = [
      {
        id: 1,
        projectId: 1,
        title: 'Start project',
        description: 'Got servay of the area for analysis',
        status: 'completed',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
      {
        id: 2,
        projectId: 1,
        title: 'Beta Testing',
        description: 'Conduct beta testing with selected users.',
        status: 'inprogress',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
      {
        id: 3,
        projectId: 1,
        title: 'Full Launch',
        description: 'Launch the CRM system to all users.',
        status: 'upcoming',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
      {
        id: 4,
        projectId: 1,
        title: 'User Training',
        description:
          'Provide training to all users on how to use the CRM system.',
        status: 'upcoming',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
    ];

    this.tasks = [
      {
        id: 1,
        projectId: 1,
        title: 'Auth flow bugfix',
        description: 'Fix the authentication flow bug in the CRM system.',
        assignee: 'John Doe',
        status: 'completed',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
      {
        id: 2,
        projectId: 1,
        title: 'UI improvements',
        description: 'Improve the user interface of the CRM system.',
        assignee: 'Jane Smith',
        status: 'inprogress',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
      {
        id: 3,
        projectId: 1,
        title: 'Add new feature',
        description: 'Add the new reporting feature to the CRM system.',
        assignee: 'Mike Johnson',
        status: 'upcoming',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
      {
        id: 4,
        projectId: 1,
        title: 'Performance testing',
        description: 'Conduct performance testing of the CRM system.',
        assignee: 'John Doe',
        status: 'upcoming',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
      {
        id: 5,
        projectId: 1,
        title: 'Water Channel',
        description: 'Collect feedback from users on the CRM system.',
        assignee: 'Jane Smith',
        status: 'completed',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
      },
    ];
  }

  getUpcomingTasks(): ITask[] {
    return this.tasks.filter((task) => task.status === 'upcoming');
  }

  getInProgressTasks(): ITask[] {
    return this.tasks.filter((task) => task.status === 'inprogress');
  }

  getCompletedTasks(): ITask[] {
    return this.tasks.filter((task) => task.status === 'completed');
  }

  getUpcomingMilestones(): IMilestone[] {
    return this.milestones.filter(
      (milestone) => milestone.status === 'upcoming'
    );
  }

  getInProgressMilestones(): IMilestone[] {
    return this.milestones.filter(
      (milestone) => milestone.status === 'inprogress'
    );
  }

  getCompletedMilestones(): IMilestone[] {
    return this.milestones.filter(
      (milestone) => milestone.status === 'completed'
    );
  }

  toggleDropdown(event: any) {
    event.preventDefault();
    const dropdown = event.target
      .closest('.relative')
      .querySelector('.dropdown-menu');
    dropdown.classList.toggle('hidden');
  }

  movetoinprogress(taskid: number) {
    const task = this.tasks.find((task) => task.id === taskid);
    if (task) {
      task.status = 'inprogress';
    }
  }
}
