import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/_core/services/common.service';
import { ProjectsService, Project } from 'src/app/shared/services/projects.service';
import { AppRoutes } from 'src/app/app.routes';
import { AdminRoutes } from 'src/app/admin/admin.routes';
import { pageTransition } from 'src/app/shared/utils/animations';

@Component({
  selector: 'app-all-projects',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.css'],
  animations: [pageTransition],
})
export class AllProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  sortColumn = '';
  sortDirection = 'asc';
  private subscription = new Subscription();

  constructor(
    private router: Router, 
    private commonService: CommonService,
    public projectsService: ProjectsService // Changed to public
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';
    
    const sub = this.projectsService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = [...projects];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load projects. Please try again.';
        console.error('Error loading projects:', err);
        this.loading = false;
      }
    });
    
    this.subscription.add(sub);
  }

  // Get status class for badges
  getStatusClass(statusId: number): string {
    const statusName = this.projectsService.getStatusName(statusId).toLowerCase();
    
    switch (statusName) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Search projects
  search(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProjects = [...this.projects];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredProjects = this.projects.filter(project => 
      project.name.toLowerCase().includes(term) || 
      project.description.toLowerCase().includes(term)
    );
  }

  // Sort projects
  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredProjects = [...this.filteredProjects].sort((a, b) => {
      let comparison = 0;
      
      // Handle different column types
      switch (column) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type - b.type;
          break;
        case 'goalAmount':
          comparison = parseFloat(a.goalAmount) - parseFloat(b.goalAmount);
          break;
        case 'raisedAmount':
          comparison = parseFloat(a.raisedAmount) - parseFloat(b.raisedAmount);
          break;
        case 'startDate':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'endDate':
          comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          break;
        case 'status':
          comparison = a.status - b.status;
          break;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // Get sorting icon
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'bi bi-arrow-down-up text-gray-400';
    }
    
    return this.sortDirection === 'asc' 
      ? 'bi bi-sort-down-alt text-blue-600' 
      : 'bi bi-sort-up text-blue-600';
  }

  calculateProgress(project: Project): number {
    return this.projectsService.calculateProgress(project);
  }

  // Helper methods for calculations in the template
  getTotalRaisedAmount(): number {
    return this.projects.reduce((sum, p) => sum + parseFloat(p.raisedAmount || '0'), 0);
  }

  getTotalGoalAmount(): number {
    return this.projects.reduce((sum, p) => sum + parseFloat(p.goalAmount || '0'), 0);
  }

  getActiveProjectsCount(): number {
    return this.projects.filter(p => p.status === 10001).length;
  }

  navigateToAddProject() {
    this.router.navigate([
      this.commonService.prepareRoute(
        AppRoutes.Admin,
        AdminRoutes.Projects,
        'add'   
      ),
    ]);
  }

  navigateToAddProjectType() {
    this.router.navigate([
      this.commonService.prepareRoute(
        AppRoutes.Admin,
        AdminRoutes.Projects,
        'add-types'
      ),
    ]);
  }

  navigateToEditProject(id: number) {
    this.router.navigate([
      this.commonService.prepareRoute(
        AppRoutes.Admin,
        AdminRoutes.Projects,
        'edit',
        id.toString()
      ),
    ]);
  }

  navigateToViewProject(id: number) {
    this.router.navigate([
      this.commonService.prepareRoute(
        AppRoutes.Admin,
        AdminRoutes.Projects,
        'view',
        id.toString()
      ),
    ]);
  }

  deleteProject(id: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this project?')) {
      this.loading = true;
      
      const sub = this.projectsService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects(); // Reload projects after deletion
        },
        error: (err) => {
          this.error = 'Failed to delete project. Please try again.';
          console.error('Error deleting project:', err);
          this.loading = false;
        }
      });
      
      this.subscription.add(sub);
    }
  }
}