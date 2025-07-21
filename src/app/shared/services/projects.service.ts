import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap, map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = '/api';
  
  // BehaviorSubjects to store project data
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private projectTypesSubject = new BehaviorSubject<ProjectType[]>([]);
  
  // Observables that components can subscribe to
  public projects$ = this.projectsSubject.asObservable();
  public projectTypes$ = this.projectTypesSubject.asObservable();

  // Status mapping for numeric status codes
  private statusMap: Record<number, string> = {
    10000: 'Draft',
    10001: 'Cancelled',
    10002: 'Completed',
    10003: 'On Hold',
    10004: 'Active'
  };

  // Project type mapping
  private projectTypeMap = {
    10000: 'Infrastructure',
    10001: 'Education',
    10002: 'Healthcare',
    10003: 'Disaster Relief',
    10004: 'Community Development'
  };

  constructor(private http: HttpClient) { }

  // Get status name from ID
  getStatusName(statusId: number): string {
    return this.statusMap[statusId] || 'Unknown';
  }

  // Get project type name from ID
  getProjectTypeName(typeId: number): string {
    return this.projectTypeMap[typeId as keyof typeof this.projectTypeMap] || 'Unknown';
  }

  // Get all projects
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`/projects`).pipe(
      retry(2),
      tap(projects => this.projectsSubject.next(projects)),
      catchError(this.handleError)
    );
  }

  // Get project by ID
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create new project
  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, project).pipe(
      tap(() => {
        // Refresh the projects list after creating a new project
        this.getAllProjects().subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Update project
  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/projects/${id}`, project).pipe(
      tap(updatedProject => {
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
    return this.http.delete(`${this.apiUrl}/projects/${id}`).pipe(
      tap(() => {
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
    return this.http.get<ProjectType[]>(`${this.apiUrl}/projectTypes`).pipe(
      retry(2),
      tap(projectTypes => this.projectTypesSubject.next(projectTypes)),
      catchError(this.handleError)
    );
  }

  // Calculate project progress percentage based on raised vs goal amount
  calculateProgress(project: Project): number {
    const raised = parseFloat(project.raisedAmount);
    const goal = parseFloat(project.goalAmount);
    
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
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}