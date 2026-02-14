import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap, map } from 'rxjs/operators';
import { IUser } from '../interfaces/user.interface';

// Updated Project interface to match the actual data structure
export interface Project {
  id: number;
  name: string;
  description: string;
  goalAmount: string;
  raisedAmount: string;
  startDate: string;
  endDate: string;
  createdBy: number;
  type: number;
  status: number;
  user: number;
}

export interface ProjectType {
  id: number;
  name: string;
  description?: string;
  date_created?: Date;
  last_updated?: Date;
}

export interface ProjectStatus {
  id: number;
  name: string;
  description?: string;
  date_created?: Date;
  last_updated?: Date;
}


@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  
  // BehaviorSubjects to store project data
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private projectTypesSubject = new BehaviorSubject<ProjectType[]>([]);
  private projectStatusesSubject = new BehaviorSubject<ProjectStatus[]>([]);
  
  // Observables that components can subscribe to
  public projects$ = this.projectsSubject.asObservable();
  public projectTypes$ = this.projectTypesSubject.asObservable();
  public projectStatuses$ = this.projectStatusesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getAllProjectStatuses().subscribe();
    this.getAllProjectTypes().subscribe();
  }

  // Get status name from ID using fetched statuses
   getStatusName(statusId: number): string {
    const statuses = this.projectStatusesSubject.value;
    if (!statuses || statuses.length === 0) {
      console.warn('Project statuses not loaded yet when calling getStatusName');
      return 'Unknown';
    }
    const status = statuses.find(s => s.id === statusId);
    console.log('getStatusName called with:', statusId, 'found:', status);
    return status ? status.name : 'Unknown';
  }

  // Get project type name from ID using fetched types
  getProjectTypeName(typeId: number): string {
    const types = this.projectTypesSubject.value;
    if (!types || types.length === 0) {
      console.warn('Project types not loaded yet when calling getProjectTypeName');
      return 'Unknown';
    }
    const type = types.find(t => t.id === typeId);
    console.log('getProjectTypeName called with:', typeId, 'found:', type);
    return type ? type.name : 'Unknown';
  }

  // Get all projects
  getAllProjects(): Observable<Project[]> {
    console.log('Fetching all projects');
    return this.http.get<Project[]>(`/projects`).pipe(
      retry(2),
      tap(projects => {
        console.log('Projects fetched:', projects);
        this.projectsSubject.next(projects);
      }),
      catchError(this.handleError)
    );
  }

  // Get project by ID
  getProjectById(id: number): Observable<Project> {
    console.log('Fetching project by ID:', id);
    return this.http.get<Project>(`/projects/${id}`).pipe(
      tap(project => console.log('Project fetched:', project)),
      catchError(this.handleError)
    );
  }

  // Create new project
  createProject(project: Partial<Project>): Observable<Project> {
    console.log('Creating project:', project);
    return this.http.post<Project>(`/projects`, project).pipe(
      tap(newProject => {
        console.log('Project created:', newProject);
        // Refresh the projects list after creating a new project
        this.getAllProjects().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Update project
  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    console.log('Updating project:', id, project);
    return this.http.put<Project>(`/projects/${id}`, project).pipe(
      tap(updatedProject => {
        console.log('Project updated:', updatedProject);
        // Update the project in the local cache
        const currentProjects = this.projectsSubject.value;
        const index = currentProjects.findIndex(p => p.id === id);
        
        if (index !== -1) {
          currentProjects[index] = { ...currentProjects[index], ...updatedProject };
          this.projectsSubject.next([...currentProjects]);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Delete project
  deleteProject(id: number): Observable<any> {
    console.log('Deleting project:', id);
    return this.http.delete(`/projects/${id}`).pipe(
      tap(() => {
        console.log('Project deleted:', id);
        // Remove the project from the local cache
        const currentProjects = this.projectsSubject.value;
        const updatedProjects = currentProjects.filter(project => project.id !== id);
        this.projectsSubject.next(updatedProjects);
      }),
      catchError(this.handleError)
    );
  }

  // Get all project types
  getAllProjectTypes(): Observable<ProjectType[]> {
    console.log('Fetching all project types');
    return this.http.get<ProjectType[]>(`/projectTypes`).pipe(
      retry(2),
      tap(projectTypes => {
        console.log('Project types fetched:', projectTypes);
        this.projectTypesSubject.next(projectTypes);
      }),
      catchError(this.handleError)
    );
  }

  // Get all project statuses
  getAllProjectStatuses(): Observable<ProjectStatus[]> {
    console.log('Fetching all project statuses');
    return this.http.get<ProjectStatus[]>(`/statuses`).pipe(
      retry(2),
      tap(projectStatuses => {
        console.log('Project statuses fetched:', projectStatuses);
        this.projectStatusesSubject.next(projectStatuses);
      }),
      catchError(this.handleError)
    );
  }

  // Calculate project progress percentage based on raised vs goal amount
  calculateProgress(project: Project): number {
    const raised = parseFloat(project.raisedAmount);
    const goal = parseFloat(project.goalAmount);
    console.log('Calculating progress for project:', project, 'raised:', raised, 'goal:', goal);
    if (isNaN(raised) || isNaN(goal) || goal === 0) {
      return 0;
    }
    const progress = (raised / goal) * 100;
    return Math.min(Math.round(progress), 100); // Ensure it doesn't exceed 100%
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('HTTP Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  //get all the people assigend on a project 
  getAllUsersAssignedToProject(projectId: number): Observable<IUser[]> {
    console.log('Fetching users assigned to project:', projectId);
    return this.http.get<IUser[]>(`/projects/${projectId}/users`).pipe(
      retry(2),
      tap(users => console.log('Users fetched for project:', users)),
      catchError(this.handleError)
    );
  }

  





}

