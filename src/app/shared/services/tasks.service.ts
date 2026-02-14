// src/app/shared/services/tasks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  
  // Track tasks with pending status changes
  private pendingStatusUpdates: Map<number, string> = new Map();

  constructor(private http: HttpClient) {}

  // Get all tasks
  getAllTasks(): Observable<Task[]> {
    console.log('Fetching all tasks');
    return this.http.get<Task[]>('/tasks').pipe(
      retry(2),
      tap(tasks => {
        console.log('Tasks fetched:', tasks);
        this.tasksSubject.next(tasks);
      }),
      catchError(this.handleError)
    );
  }

  // Get tasks by project ID
  getTasksByProjectId(projectId: number): Observable<Task[]> {
    console.log(`Fetching tasks for project ID: ${projectId}`);
    return this.http.get<Task[]>(`/tasks?project_id=${projectId}`).pipe(
      retry(2),
      tap(tasks => {
        console.log('Project tasks fetched:', tasks);
        this.tasksSubject.next(tasks.filter(task => task.project_id === projectId));
      }),
      catchError(this.handleError)
    );
  }

  // Get task by ID
  getTaskById(id: number): Observable<Task> {
    console.log('Fetching task by ID:', id);
    return this.http.get<Task>(`/tasks/${id}`).pipe(
      tap(task => console.log('Task fetched:', task)),
      catchError(this.handleError)
    );
  }

  // Create new task
  createTask(task: Partial<Task>): Observable<Task> {
    console.log('Creating task:', task);
    return this.http.post<Task>('/tasks', task).pipe(
      tap(newTask => {
        console.log('Task created:', newTask);
        // Update the tasks list
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next([...currentTasks, newTask]);
      }),
      catchError(this.handleError)
    );
  }

  // Update task
  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    console.log('Updating task:', id, task);
    return this.http.put<Task>(`/tasks/${id}`, task).pipe(
      tap(updatedTask => {
        console.log('Task updated:', updatedTask);
        // Update the task in the local cache
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex(t => t.id === id);
        
        if (index !== -1) {
          currentTasks[index] = { ...currentTasks[index], ...updatedTask };
          this.tasksSubject.next([...currentTasks]);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Delete task
  deleteTask(id: number): Observable<any> {
    console.log('Deleting task:', id);
    return this.http.delete(`/tasks/${id}`).pipe(
      tap(() => {
        console.log('Task deleted:', id);
        // Remove the task from the local cache
        const currentTasks = this.tasksSubject.value;
        const updatedTasks = currentTasks.filter(task => task.id !== id);
        this.tasksSubject.next(updatedTasks);
      }),
      catchError(this.handleError)
    );
  }

  // Queue task status change (don't update server immediately)
  queueTaskStatusChange(id: number, status: 'upcoming' | 'inprogress' | 'completed'): void {
    console.log(`Queueing status change for task ${id} to ${status}`);
    
    // Update locally
    const currentTasks = this.tasksSubject.value;
    const index = currentTasks.findIndex(t => t.id === id);
    
    if (index !== -1) {
      currentTasks[index].status = status;
      this.tasksSubject.next([...currentTasks]);
    }
    
    // Add to pending updates
    this.pendingStatusUpdates.set(id, status);
  }

  // Submit all pending task status changes
  submitPendingStatusChanges(): Observable<any>[] {
    if (this.pendingStatusUpdates.size === 0) {
      return [];
    }
    
    console.log(`Submitting ${this.pendingStatusUpdates.size} pending task status changes`);
    
    const updateRequests: Observable<any>[] = [];
    
    this.pendingStatusUpdates.forEach((status, id) => {
      updateRequests.push(
        this.updateTask(id, { status: status as 'upcoming' | 'inprogress' | 'completed' })
      );
    });
    
    // Clear pending updates
    this.pendingStatusUpdates.clear();
    
    return updateRequests;
  }

  // Error handling
  private handleError(error: any) {
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
}