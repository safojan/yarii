// Updated ProjectViewComponent
import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription, forkJoin, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';

import { Project } from '../../../../../shared/services/projects.service';
import { TasksService, Task } from '../../../../../shared/services/tasks.service';
import { MilestonesService, Milestone } from '../../../../../shared/services/milestones.service';
import { ProjectsService } from '../../../../../shared/services/projects.service';
import { CanComponentDeactivate } from '../../../../../shared/interfaces/can-component-deactivate.interface';
import { UserService } from 'src/app/_core/services/user.service';

import { AdminModalComponent } from '../../../elements/modal/admin-modal.component'

import { switchMap, map } from 'rxjs/operators';
import { IUser } from 'src/app/shared/interfaces/user.interface';


@Component({
  selector: 'app-project-view',
  standalone: true,
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.css'],
  imports: [CommonModule, DatePipe, DecimalPipe, DragDropModule, LoaderComponent],
})
export class ProjectViewComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  @ViewChild(AdminModalComponent) modal!: AdminModalComponent;


  project!: Project;
  milestones: Milestone[] = [];
  tasks: Task[] = [];
  readonly projectId: number;
  //the people assigned to the project
  assignedUsers: IUser[] = []; // Assuming this is an array of user objects

  // Loading states
  loadingProject = false;
  loadingTasks = false;
  loadingMilestones = false;

  //project create name
  project_creator = "Mr Creator"

  //project type name
  projectTypeName: string = "Unknown";

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

  // Subscriptions to be cleaned up
  private routerSubscription: Subscription | undefined;


  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.pendingChangesCount > 0) {
      $event.returnValue = true;
    }
  }
  canDeactivate(): boolean | Promise<boolean> {
    if (this.pendingChangesCount === 0) {
      return true;
    }
    // You can use native confirm or a custom modal
    console.log('ProjectViewComponent: Unsaved changes detected, prompting user');
    return confirm('You have unsaved changes! Do you want to leave without saving?');
  }



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private tasksService: TasksService,
    private milestonesService: MilestonesService,
    private userService: UserService
  ) {
    this.projectId = +this.route.snapshot.params['id'];
    console.log('ProjectViewComponent: Initialized with project ID:', this.projectId);

    // Initialize IDs for drag and drop
    this.milestoneDropListIds = this.columns.map(c => `milestone-${c}`);
    this.taskDropListIds = this.columns.map(c => `task-${c}`);

    // Set up navigation listener to submit pending changes when leaving
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        console.log('ProjectViewComponent: Navigation detected, submitting pending changes');
        this.submitPendingChanges();
      });
  }

  ngOnInit(): void {
    console.log('ProjectViewComponent: ngOnInit - Loading project data');
    // Load project data
    this.loadProjectData();
    //loading all people after loading the project data
    this.getAssignedUsers();
  }

  ngOnDestroy(): void {
    console.log('ProjectViewComponent: ngOnDestroy - Cleaning up');
    // Submit any pending changes when component is destroyed
    this.submitPendingChanges();

    // Clean up subscriptions
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Load project, tasks, and milestones
  loadProjectData(): void {
    // Load project
    this.loadingProject = true;
    console.log('ProjectViewComponent: Loading project data');
    this.projectsService.getProjectById(this.projectId).pipe(
      switchMap((project) => {
        this.project = project;
        return forkJoin({
          project: of(project),
          user: this.userService.getUserById(project.user)
        });
      })
    ).subscribe({
      next: ({ project, user }) => {
        console.log('ProjectViewComponent: Data loaded:', { project, user });
        this.project_creator = user.name;
        this.projectTypeName = this.projectsService.getProjectTypeName(project.type);
        this.loadingProject = false;
      },
      error: (error: any) => {
        console.error('ProjectViewComponent: Error loading data:', error);
        this.loadingProject = false;
      }
    });



    // Load tasks
    this.loadingTasks = true;
    console.log('ProjectViewComponent: Loading tasks');

    this.tasksService.getTasksByProjectId(this.projectId).subscribe({
      next: (tasks: Task[]) => {
        console.log('ProjectViewComponent: Tasks loaded:', tasks);
        this.tasks = tasks;
        this.sortTasksIntoColumns();
        this.loadingTasks = false;
      },
      error: (error: any) => {
        console.error('ProjectViewComponent: Error fetching tasks:', error);
        this.loadingTasks = false;
      }
    });

    // Load milestones
    this.loadingMilestones = true;
    console.log('ProjectViewComponent: Loading milestones');

    this.milestonesService.getMilestonesByProjectId(this.projectId).subscribe({
      next: (milestones: Milestone[]) => {
        console.log('ProjectViewComponent: Milestones loaded:', milestones);
        this.milestones = milestones;
        this.sortMilestonesIntoColumns();
        this.loadingMilestones = false;
      },
      error: (error: any) => {
        console.error('ProjectViewComponent: Error fetching milestones:', error);
        this.loadingMilestones = false;
      }
    });
  }

  // Sort tasks into columns based on status
  sortTasksIntoColumns(): void {
    console.log('ProjectViewComponent: Sorting tasks into columns');
    this.taskColumns = {
      upcoming: this.tasks.filter(t => t.status.toLowerCase() === 'upcoming'),
      inprogress: this.tasks.filter(t => t.status.toLowerCase() === 'inprogress' || t.status.toLowerCase() === 'inprogress'),
      completed: this.tasks.filter(t => t.status.toLowerCase() === 'completed')
    };
    console.log('ProjectViewComponent: Task columns:', {
      upcoming: this.taskColumns['upcoming'].length,
      inprogress: this.taskColumns['inprogress'].length,
      completed: this.taskColumns['completed'].length
    });
  }

  // Sort milestones into columns based on status
  sortMilestonesIntoColumns(): void {
    console.log('ProjectViewComponent: Sorting milestones into columns');
    this.milestoneColumns = {
      upcoming: this.milestones.filter(m => m.status.toLowerCase() === 'upcoming'),
      inprogress: this.milestones.filter(m => m.status.toLowerCase() === 'InProgress' || m.status.toLowerCase() === 'inprogress'),
      completed: this.milestones.filter(m => m.status.toLowerCase() === 'completed')
    };
    console.log('ProjectViewComponent: Milestone columns:', {
      upcoming: this.milestoneColumns['upcoming'].length,
      inprogress: this.milestoneColumns['inprogress'].length,
      completed: this.milestoneColumns['completed'].length
    });
  }

  // Handle dropping a milestone into a new column
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

      // Get the milestone and its new status
      const milestone = event.container.data[event.currentIndex];
      const columnName = event.container.id.split('-')[1] as 'upcoming' | 'inprogress' | 'completed';

      // Map column name to status name (handle 'inprogress' -> 'InProgress')
      let newStatus: string = columnName;
      if (columnName === 'inprogress') {
        newStatus = 'InProgress';
      } else if (columnName === 'upcoming') {
        newStatus = 'Upcoming';
      } else if (columnName === 'completed') {
        newStatus = 'Completed';
      }

      console.log(`ProjectViewComponent: Milestone ${milestone.id} (${milestone.name}) moved to ${newStatus}`);

      // Queue the status change (don't update server immediately)
      this.milestonesService.queueMilestoneStatusChange(milestone.id, newStatus);
    }
  }

  // Handle dropping a task into a new column
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

      // Get the task and its new status
      const task = event.container.data[event.currentIndex];
      const columnName = event.container.id.split('-')[1] as 'upcoming' | 'inprogress' | 'completed';

      // Map column name to status name (handle 'inprogress' -> 'InProgress')
      let newStatus: string = columnName;
      if (columnName === 'inprogress') {
        newStatus = 'InProgress';
      } else if (columnName === 'upcoming') {
        newStatus = 'Upcoming';
      } else if (columnName === 'completed') {
        newStatus = 'Completed';
      }

      console.log(`ProjectViewComponent: Task ${task.id} (${task.title}) moved to ${newStatus}`);

      // Queue the status change (don't update server immediately)
      this.tasksService.queueTaskStatusChange(task.id, newStatus as 'upcoming' | 'inprogress' | 'completed');
    }
  }

  // Submit any pending status changes
  submitPendingChanges(): void {
    console.log('ProjectViewComponent: Checking for pending changes');

    const hasPendingMilestoneChanges = this.milestonesService.hasPendingUpdates();

    if (!hasPendingMilestoneChanges) {
      console.log('ProjectViewComponent: No pending changes to submit');
      return;
    }

    console.log('ProjectViewComponent: Submitting pending changes', {
      milestones: this.milestonesService.getPendingUpdatesCount()
    });

    const updateObservables = [];

    // For now, only handle milestone updates since TasksService doesn't have these methods yet
    if (hasPendingMilestoneChanges) {
      updateObservables.push(this.milestonesService.submitPendingStatusChanges());
    }

    // Add task updates when TasksService is updated with the same methods
    const taskUpdates = this.tasksService.submitPendingStatusChanges();
    updateObservables.push(taskUpdates);

    if (updateObservables.length > 0) {
      forkJoin(updateObservables).subscribe({
        next: (results) => {
          console.log('ProjectViewComponent: All pending updates submitted successfully:', results);
        },
        error: (error) => {
          console.error('ProjectViewComponent: Error submitting updates:', error);
        }
      });
    }
  }

  // Helper function to get column display name
  getColumnDisplayName(col: string): string {
    switch (col) {
      case 'upcoming': return 'Upcoming';
      case 'inprogress': return 'InProgress';
      case 'completed': return 'Completed';
      default: return col;
    }
  }

  // Add a new task
  addTask(task: Partial<Task>): void {
    // Ensure task has the project ID
    const newTask = { ...task, project_id: this.projectId };
    this.loadingTasks = true;
    console.log('ProjectViewComponent: Adding new task:', newTask);

    this.tasksService.createTask(newTask).subscribe({
      next: (createdTask: Task) => {
        console.log('ProjectViewComponent: Task created successfully:', createdTask);
        // Refresh the task list
        this.tasksService.getTasksByProjectId(this.projectId).subscribe({
          next: (tasks: Task[]) => {
            console.log('ProjectViewComponent: Tasks refreshed after creation');
            this.tasks = tasks;
            this.sortTasksIntoColumns();
            this.loadingTasks = false;
          },
          error: (error) => {
            console.error('ProjectViewComponent: Error refreshing tasks:', error);
            this.loadingTasks = false;
          }
        });
      },
      error: (error: any) => {
        console.error('ProjectViewComponent: Error creating task:', error);
        this.loadingTasks = false;
      }
    });
  }

  // Add a new milestone
  addMilestone(milestone: Partial<Milestone>): void {
    // Ensure milestone has the project ID (using 'project' field as per backend structure)
    const newMilestone = { ...milestone, project: this.projectId };
    this.loadingMilestones = true;
    console.log('ProjectViewComponent: Adding new milestone:', newMilestone);

    this.milestonesService.createMilestone(newMilestone).subscribe({
      next: (createdMilestone: Milestone) => {
        console.log('ProjectViewComponent: Milestone created successfully:', createdMilestone);
        // Refresh the milestone list
        this.milestonesService.getMilestonesByProjectId(this.projectId).subscribe({
          next: (milestones: Milestone[]) => {
            console.log('ProjectViewComponent: Milestones refreshed after creation');
            this.milestones = milestones;
            this.sortMilestonesIntoColumns();
            this.loadingMilestones = false;
          },
          error: (error) => {
            console.error('ProjectViewComponent: Error refreshing milestones:', error);
            this.loadingMilestones = false;
          }
        });
      },
      error: (error: any) => {
        console.error('ProjectViewComponent: Error creating milestone:', error);
        this.loadingMilestones = false;
      }
    });
  }

  //getting all the users assgend to the project 
  getAssignedUsers(): void {
    console.log('ProjectViewComponent: Loading assigned users for project', this.projectId);
    this.projectsService.getAllUsersAssignedToProject(this.projectId).subscribe({
      next: (users: IUser[]) => {
        console.log('ProjectViewComponent: Assigned users loaded:', users);
        this.assignedUsers = users;
      },
      error: (error: any) => {
        console.error('ProjectViewComponent: Error loading assigned users:', error);
      }
    });
  }

  // Check if any data is still loading
  get isLoading(): boolean {
    return this.loadingProject || this.loadingTasks || this.loadingMilestones;
  }

  // Get pending changes count for UI display
  get pendingChangesCount(): number {
    // For now, only count milestone updates
    return this.milestonesService.getPendingUpdatesCount();
  }

  // Check if there are any pending changes
  get hasPendingChanges(): boolean {
    // For now, only check milestone updates
    return this.milestonesService.hasPendingUpdates();
  }

  //save the pending milestones statuses to the server once this component is distroyed / changes 
  savePendingMilestoneStatuses(): void {
    console.log('ProjectViewComponent: Saving pending milestone statuses');
    this.milestonesService.submitPendingStatusChanges().subscribe({
      next: () => {
        console.log('ProjectViewComponent: Pending milestone statuses saved successfully');
      },
      error: (error) => {
        console.error('ProjectViewComponent: Error saving pending milestone statuses:', error);
      }
    });
  }

  //delete project 
  deleteProject(): void {
    this.modal.open({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      type: 'error',
      primaryButtonText: 'Delete',
      primaryButtonClass: 'btn-danger',
      secondaryButtonText: 'Cancel'
    });
  }

  getInitials(name: string): string {
    if (!name) return '??';

    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getAvatarColor(id: number): string {
    // Generate a consistent color based on the user ID
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
      '#F97316', '#D946EF', '#06B6D4', '#84CC16'
    ];

    // Use modulo to get a consistent color from the array
    return colors[id % colors.length];
  }


}