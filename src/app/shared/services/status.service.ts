import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

export interface Status {
  id: number;
  name: string;
  date_created?: Date;
  last_updated?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  
  // BehaviorSubjects to store project data
  public projectStatusesSubject = new BehaviorSubject<Status[]>([]); // Made public for MilestonesService access
  
  // Observables that components can subscribe to
  public projectStatuses$ = this.projectStatusesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getAllProjectStatuses().subscribe();
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

  // Get status ID by name (helper method for other services)
  getStatusIdByName(statusName: string): number | null {
    const statuses = this.projectStatusesSubject.value;
    if (!statuses || statuses.length === 0) {
      console.warn('Project statuses not loaded yet when calling getStatusIdByName');
      return null;
    }
    const status = statuses.find(s => s.name.toLowerCase() === statusName.toLowerCase());
    console.log('getStatusIdByName called with:', statusName, 'found:', status);
    return status ? status.id : null;
  }

  // Check if statuses are loaded
  areStatusesLoaded(): boolean {
    return this.projectStatusesSubject.value.length > 0;
  }

  // Get all project statuses
  getAllProjectStatuses(): Observable<Status[]> {
    console.log('Fetching all project statuses');
    return this.http.get<Status[]>(`/statuses`).pipe(
      retry(2),
      tap(projectStatuses => {
        console.log('Project statuses fetched:', projectStatuses);
        this.projectStatusesSubject.next(projectStatuses);
      }),
      catchError(this.handleError)
    );
  }

  // Force reload statuses
  reloadStatuses(): Observable<Status[]> {
    return this.getAllProjectStatuses();
  }


  ensureStatusesLoaded(): Observable<Status[]> {
    console.log('StatusService: Ensuring statuses are loaded');
    
    if (this.projectStatusesSubject.value.length > 0) {
      console.log('StatusService: Statuses already loaded, returning existing');
      return new BehaviorSubject(this.projectStatusesSubject.value).asObservable();
    }
    
    console.log('StatusService: Statuses not loaded, fetching from server');
    return this.getAllProjectStatuses();
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
}