import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { IUser } from 'src/app/shared/interfaces/user.interface';
import { Irole } from 'src/app/shared/interfaces/user.interface';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { RoleService } from './role.service';

export interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  role: Irole | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private readonly initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    role: null,
    isLoading: false,
    error: null
  };

  private authStateSubject = new BehaviorSubject<AuthState>(this.initialState);

  // Public observables
  public authState$ = this.authStateSubject.asObservable();
  public isAuthenticated$ = this.authState$.pipe(
    map(state => state.isAuthenticated),
    distinctUntilChanged()
  );
  public user$ = this.authState$.pipe(
    map(state => state.user),
    distinctUntilChanged()
  );
  public role$ = this.authState$.pipe(
    map(state => state.role),
    distinctUntilChanged()
  );
  public isLoading$ = this.authState$.pipe(
    map(state => state.isLoading),
    distinctUntilChanged()
  );
  public error$ = this.authState$.pipe(
    map(state => state.error),
    distinctUntilChanged()
  );

  // Computed observables
  public isAdmin$ = this.role$.pipe(
    map(role => role?.name === 'Admin'),
    distinctUntilChanged()
  );
  public isEmployee$ = this.role$.pipe(
    map(role => role?.name === 'Employee'),
    distinctUntilChanged()
  );
  public isUser$ = this.role$.pipe(
    map(role => role?.name === 'User'),
    distinctUntilChanged()
  );

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private roleService: RoleService
  ) {
    this.initializeState();
  }

  /**
   * Initialize the authentication state
   */
  private initializeState(): void {
    const isTokenValid = this.tokenService.isTokenValid();
    const currentUser = this.userService.getCurrentUser();
    const currentRole = this.roleService.getCurrentUserRole();

    this.updateState({
      isAuthenticated: isTokenValid && currentUser !== null,
      user: currentUser,
      role: currentRole,
      isLoading: false,
      error: null
    });
  }

  /**
   * Update the authentication state
   */
  private updateState(partialState: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    const newState = { ...currentState, ...partialState };
    this.authStateSubject.next(newState);
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this.updateState({ error });
  }

  /**
   * Set authenticated state with user and role data
   */
  setAuthenticated(user: IUser, role: Irole | null = null): void {
    this.updateState({
      isAuthenticated: true,
      user,
      role,
      error: null
    });
  }

  /**
   * Set unauthenticated state
   */
  setUnauthenticated(): void {
    this.updateState({
      isAuthenticated: false,
      user: null,
      role: null,
      error: null
    });
  }

  /**
   * Update user data
   */
  updateUser(user: IUser): void {
    this.updateState({ user });
  }

  /**
   * Update role data
   */
  updateRole(role: Irole): void {
    this.updateState({ role });
  }

  /**
   * Get current authentication state snapshot
   */
  getCurrentState(): AuthState {
    return this.authStateSubject.value;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentState().isAuthenticated;
  }

  /**
   * Get current user snapshot
   */
  getCurrentUser(): IUser | null {
    return this.getCurrentState().user;
  }

  /**
   * Get current role snapshot
   */
  getCurrentRole(): Irole | null {
    return this.getCurrentState().role;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const role = this.getCurrentRole();
    return role?.name === 'Admin';
  }

  /**
   * Check if current user is employee
   */
  isEmployee(): boolean {
    const role = this.getCurrentRole();
    return role?.name === 'Employee';
  }

  /**
   * Check if current user has specific role
   */
  hasRole(roleName: string): boolean {
    const role = this.getCurrentRole();
    return role?.name === roleName;
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.authStateSubject.next(this.initialState);
  }

  /**
   * Refresh authentication state from services
   */
  refreshState(): void {
    this.setLoading(true);
    
    const isTokenValid = this.tokenService.isTokenValid();
    
    if (!isTokenValid) {
      this.setUnauthenticated();
      this.setLoading(false);
      return;
    }

    // Get current data from services
    const user = this.userService.getCurrentUser();
    const role = this.roleService.getCurrentUserRole();

    this.updateState({
      isAuthenticated: user !== null,
      user,
      role,
      isLoading: false,
      error: null
    });
  }

  /**
   * Observable that combines user and role data
   */
  getUserWithRole(): Observable<{ user: IUser | null; role: Irole | null }> {
    return combineLatest([this.user$, this.role$]).pipe(
      map(([user, role]) => ({ user, role }))
    );
  }

  /**
   * Observable that emits when authentication state changes
   */
  onAuthStateChange(): Observable<boolean> {
    return this.isAuthenticated$;
  }
}

