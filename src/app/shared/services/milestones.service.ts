// src/app/shared/services/milestones.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, forkJoin } from 'rxjs';
import { catchError, retry, tap, map, switchMap } from 'rxjs/operators';
import { StatusService } from './status.service';

// Interface matching the backend structure
export interface MilestoneBackend {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  project: number;
  status: number; // Always a number from backend
}

// Interface for frontend use (with status as string)
export interface Milestone {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  project: number;
  status: string; // Converted to string for frontend
}

@Injectable({
  providedIn: 'root'
})
export class MilestonesService {
  
  private milestonesSubject = new BehaviorSubject<Milestone[]>([]);
  public milestones$ = this.milestonesSubject.asObservable();
  
  // Track milestones with pending status changes
  private pendingStatusUpdates: Map<number, string> = new Map();

  constructor(
    private http: HttpClient,
    private statusService: StatusService
  ) {
    console.log('MilestonesService initialized');
  }

  // Get all milestones
  getAllMilestones(): Observable<Milestone[]> {
    console.log('MilestonesService: Fetching all milestones');
    return this.http.get<MilestoneBackend[]>('/milestones').pipe(
      retry(2),
      tap(backendMilestones => console.log('MilestonesService: Raw milestones from backend:', backendMilestones)),
      switchMap(backendMilestones => {
        console.log('MilestonesService: Converting milestone statuses');
        // Ensure statuses are loaded before converting
        return this.statusService.ensureStatusesLoaded().pipe(
          map(() => {
            const statuses = this.statusService.projectStatusesSubject.value;
            console.log('MilestonesService: Available statuses:', statuses);
            
            if (statuses.length === 0) {
              console.error('MilestonesService: No statuses available for conversion');
              throw new Error('Statuses not loaded');
            }
            
            return this.convertMilestonesFromBackend(backendMilestones);
          })
        );
      }),
      tap(milestones => {
        console.log('MilestonesService: Milestones converted and ready:', milestones);
        this.milestonesSubject.next(milestones);
      }),
      catchError(error => {
        console.error('MilestonesService: Error fetching milestones:', error);
        return this.handleError(error);
      })
    );
  }

  // Get milestones by project ID
  getMilestonesByProjectId(projectId: number): Observable<Milestone[]> {
    console.log(`MilestonesService: Fetching milestones for project ID: ${projectId}`);
    return this.http.get<MilestoneBackend[]>(`/milestones?project=${projectId}`).pipe(
      retry(2),
      tap(backendMilestones => console.log(`MilestonesService: Raw milestones for project ${projectId}:`, backendMilestones)),
      switchMap(backendMilestones => {
        // Filter milestones for the specific project
        // const filteredMilestones = backendMilestones.filter(milestone => milestone.project === projectId);
        // console.log(`MilestonesService: Filtered ${filteredMilestones.length} milestones for project ${projectId}`);
        
        // Ensure statuses are loaded before converting
        return this.statusService.ensureStatusesLoaded().pipe(
          map(() => {
            const statuses = this.statusService.projectStatusesSubject.value;
            if (statuses.length === 0) {
              console.error('MilestonesService: No statuses available for conversion');
              throw new Error('Statuses not loaded');
            }
            return this.convertMilestonesFromBackend(backendMilestones);
          })
        );
      }),
      tap(milestones => {
        console.log(`MilestonesService: Project ${projectId} milestones converted:`, milestones);
        this.milestonesSubject.next(milestones);
      }),
      catchError(error => {
        console.error(`MilestonesService: Error fetching milestones for project ${projectId}:`, error);
        return this.handleError(error);
      })
    );
  }

  // Get milestone by ID
  getMilestoneById(id: number): Observable<Milestone> {
    console.log(`MilestonesService: Fetching milestone by ID: ${id}`);
    return this.http.get<MilestoneBackend>(`/milestones/${id}`).pipe(
      tap(backendMilestone => console.log(`MilestonesService: Raw milestone ${id} from backend:`, backendMilestone)),
      switchMap(backendMilestone => {
        // Convert status for single milestone
        return this.statusService.ensureStatusesLoaded().pipe(
          map(() => {
            const statuses = this.statusService.projectStatusesSubject.value;
            if (statuses.length === 0) {
              console.error('MilestonesService: No statuses available for conversion');
              throw new Error('Statuses not loaded');
            }
            return this.convertMilestoneFromBackend(backendMilestone);
          })
        );
      }),
      tap(milestone => console.log(`MilestonesService: Milestone ${id} converted:`, milestone)),
      catchError(error => {
        console.error(`MilestonesService: Error fetching milestone ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  // Create new milestone
  createMilestone(milestone: Partial<Milestone>): Observable<Milestone> {
    console.log('MilestonesService: Creating milestone:', milestone);
    
    // Convert to backend format
    const backendData = this.convertMilestoneToBackend(milestone);
    console.log('MilestonesService: Backend data for creation:', backendData);
    
    return this.http.post<MilestoneBackend>('/milestones', backendData).pipe(
      tap(backendMilestone => console.log('MilestonesService: Milestone created on backend:', backendMilestone)),
      map(backendMilestone => this.convertMilestoneFromBackend(backendMilestone)),
      tap(newMilestone => {
        console.log('MilestonesService: New milestone converted:', newMilestone);
        // Update the milestones list
        const currentMilestones = this.milestonesSubject.value;
        this.milestonesSubject.next([...currentMilestones, newMilestone]);
      }),
      catchError(error => {
        console.error('MilestonesService: Error creating milestone:', error);
        return this.handleError(error);
      })
    );
  }

  // Update milestone
  updateMilestone(id: number, milestone: Partial<Milestone>): Observable<Milestone> {
    console.log(`MilestonesService: Updating milestone ${id}:`, milestone);
    
    // Convert to backend format
    const backendData = this.convertMilestoneToBackend(milestone);
    console.log('MilestonesService: Backend data for update:', backendData);
    
    return this.http.patch<MilestoneBackend>(`/milestones/${id}`, backendData).pipe(
      tap(backendMilestone => console.log(`MilestonesService: Milestone ${id} updated on backend:`, backendMilestone)),
      map(backendMilestone => this.convertMilestoneFromBackend(backendMilestone)),
      tap(updatedMilestone => {
        console.log(`MilestonesService: Updated milestone ${id} converted:`, updatedMilestone);
        // Update the milestone in the local cache
        const currentMilestones = this.milestonesSubject.value;
        const index = currentMilestones.findIndex(m => m.id === id);
        
        if (index !== -1) {
          currentMilestones[index] = { ...currentMilestones[index], ...updatedMilestone };
          this.milestonesSubject.next([...currentMilestones]);
          console.log(`MilestonesService: Local cache updated for milestone ${id}`);
        }
      }),
      catchError(error => {
        console.error(`MilestonesService: Error updating milestone ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  // Delete milestone
  deleteMilestone(id: number): Observable<any> {
    console.log(`MilestonesService: Deleting milestone ${id}`);
    return this.http.delete(`/milestones/${id}`).pipe(
      tap(() => {
        console.log(`MilestonesService: Milestone ${id} deleted from backend`);
        // Remove the milestone from the local cache
        const currentMilestones = this.milestonesSubject.value;
        const updatedMilestones = currentMilestones.filter(milestone => milestone.id !== id);
        this.milestonesSubject.next(updatedMilestones);
        console.log(`MilestonesService: Milestone ${id} removed from local cache`);
      }),
      catchError(error => {
        console.error(`MilestonesService: Error deleting milestone ${id}:`, error);
        return this.handleError(error);
      })
    );
  }

  // Queue milestone status change (don't update server immediately)
  queueMilestoneStatusChange(id: number, status: string): void {
    console.log(`MilestonesService: Queueing status change for milestone ${id} to "${status}"`);
    
    // Update locally
    const currentMilestones = this.milestonesSubject.value;
    const index = currentMilestones.findIndex(m => m.id === id);
    
    if (index !== -1) {
      const oldStatus = currentMilestones[index].status;
      currentMilestones[index].status = status;
      this.milestonesSubject.next([...currentMilestones]);
      console.log(`MilestonesService: Local status updated from "${oldStatus}" to "${status}" for milestone ${id}`);
    } else {
      console.warn(`MilestonesService: Milestone ${id} not found in local cache`);
    }
    
    // Add to pending updates
    this.pendingStatusUpdates.set(id, status);
    console.log(`MilestonesService: Pending updates count: ${this.pendingStatusUpdates.size}`);
  }

  // Submit all pending milestone status changes
  submitPendingStatusChanges(): Observable<Milestone[]> {
    if (this.pendingStatusUpdates.size === 0) {
      console.log('MilestonesService: No pending status changes to submit');
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    console.log(`MilestonesService: Submitting ${this.pendingStatusUpdates.size} pending milestone status changes`);
    
    const updateRequests: Observable<Milestone>[] = [];
    
    this.pendingStatusUpdates.forEach((status, id) => {
      console.log(`MilestonesService: Preparing update for milestone ${id} to status "${status}"`);
      updateRequests.push(
        this.updateMilestone(id, { status: status })
      );
    });
    
    // Clear pending updates
    this.pendingStatusUpdates.clear();
    console.log('MilestonesService: Pending updates cleared');
    
    // Execute all updates and return the results
    return forkJoin(updateRequests).pipe(
      tap(results => console.log('MilestonesService: All pending updates completed:', results))
    );
  }

  // Helper method to convert milestones from backend format
  private convertMilestonesFromBackend(backendMilestones: MilestoneBackend[]): Milestone[] {
    console.log(`MilestonesService: Converting ${backendMilestones.length} milestones from backend format`);
    return backendMilestones.map(milestone => this.convertMilestoneFromBackend(milestone));
  }

  // Helper method to convert single milestone from backend format
  private convertMilestoneFromBackend(backendMilestone: MilestoneBackend): Milestone {
    const statusName = this.statusService.getStatusName(backendMilestone.status);
    console.log(`MilestonesService: Converting milestone ${backendMilestone.id} - status ${backendMilestone.status} to "${statusName}"`);
    
    return {
      id: backendMilestone.id,
      name: backendMilestone.name,
      description: backendMilestone.description,
      dueDate: backendMilestone.dueDate,
      project: backendMilestone.project,
      status: statusName
    };
  }

  // Helper method to convert milestone to backend format
  private convertMilestoneToBackend(milestone: Partial<Milestone>): Partial<MilestoneBackend> {
    const backendData: Partial<MilestoneBackend> = {};
    
    if (milestone.id !== undefined) backendData.id = milestone.id;
    if (milestone.name !== undefined) backendData.name = milestone.name;
    if (milestone.description !== undefined) backendData.description = milestone.description;
    if (milestone.dueDate !== undefined) backendData.dueDate = milestone.dueDate;
    if (milestone.project !== undefined) backendData.project = milestone.project;
    
    // Convert status name to ID if present
    if (milestone.status !== undefined) {
      const statusId = this.getStatusIdByName(milestone.status);
      console.log(`MilestonesService: Converting status "${milestone.status}" to ID ${statusId}`);
      backendData.status = statusId;
    }
    
    return backendData;
  }

  // Helper method to get status ID by name (for API calls)
  private getStatusIdByName(statusName: string): number {
    const statuses = this.statusService.projectStatusesSubject.value;
    const status = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase());
    
    if (!status) {
      console.error(`MilestonesService: Status not found for name: "${statusName}"`);
      console.log('MilestonesService: Available statuses:', statuses.map(s => s.name));
      return 0; // Default value, you might want to throw an error instead
    }
    
    console.log(`MilestonesService: Found status ID ${status.id} for name "${statusName}"`);
    return status.id;
  }

 // Complete the error handling method at the end of milestones.service.ts
  // Error handling
  private handleError(error: any) {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      console.error('MilestonesService: Client-side error occurred:', error.error);
    } else {
      // Server-side error
      errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      console.error('MilestonesService: Server-side error occurred:', {
        status: error.status,
        message: error.message,
        error: error.error
      });
      
      // Log additional details if available
      if (error.error && typeof error.error === 'object') {
        console.error('MilestonesService: Server error details:', error.error);
      }
    }
    
    console.error('MilestonesService: Full error object:', error);
    return throwError(() => new Error(errorMessage));
  }

  // Helper method to clear local cache
  clearCache(): void {
    console.log('MilestonesService: Clearing local cache');
    this.milestonesSubject.next([]);
    this.pendingStatusUpdates.clear();
  }

  // Get current cached milestones
  getCachedMilestones(): Milestone[] {
    return this.milestonesSubject.value;
  }

  // Check if there are pending updates
  hasPendingUpdates(): boolean {
    return this.pendingStatusUpdates.size > 0;
  }

  // Get count of pending updates
  getPendingUpdatesCount(): number {
    return this.pendingStatusUpdates.size;
  }

  // Cancel all pending updates
  cancelPendingUpdates(): void {
    console.log(`MilestonesService: Cancelling ${this.pendingStatusUpdates.size} pending updates`);
    
    // Revert local changes
    const milestoneIds = Array.from(this.pendingStatusUpdates.keys());
    if (milestoneIds.length > 0) {
      console.log('MilestonesService: Reverting local changes for milestones:', milestoneIds);
      // You might want to reload milestones from server to revert changes
      this.getAllMilestones().subscribe();
    }
    
    this.pendingStatusUpdates.clear();
    console.log('MilestonesService: Pending updates cancelled');
  }
}