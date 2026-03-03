import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectsService, ProjectType, ProjectStatus } from '../../../../../shared/services/projects.service';
import { UserService } from '../../../../../_core/services/user.service';
import { LoaderComponent } from '../../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-project-add',
  templateUrl: './project-add.component.html',
  styleUrls: ['./project-add.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent]
})
export class ProjectAddComponent implements OnInit {
  projectForm!: FormGroup;
  projectTypes: ProjectType[] = [];
  projectStatuses: ProjectStatus[] = [];

  isSubmitting = false;
  isLoadingData = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private projectsService: ProjectsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadFormData();
  }

  initializeForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required],
      status: ['', Validators.required],
      goalAmount: ['', [Validators.required, Validators.min(1)]],
      raisedAmount: [0, [Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator to ensure end date is after start date
  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return { dateRange: true };
    }
    return null;
  }

  loadFormData(): void {
    this.isLoadingData = true;

    // Load project types and statuses
    this.projectsService.projectTypes$.subscribe({
      next: (types) => {
        this.projectTypes = types;
        console.log('Project types loaded:', types);
      }
    });

    this.projectsService.projectStatuses$.subscribe({
      next: (statuses) => {
        this.projectStatuses = statuses;
        console.log('Project statuses loaded:', statuses);
        this.isLoadingData = false;
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched(this.projectForm);
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'User not authenticated. Please log in again.';
      this.isSubmitting = false;
      return;
    }

    const formValue = this.projectForm.value;
    const projectData = {
      name: formValue.name,
      description: formValue.description,
      type: parseInt(formValue.type),
      status: parseInt(formValue.status),
      goalAmount: formValue.goalAmount.toString(),
      raisedAmount: formValue.raisedAmount.toString(),
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      user: currentUser.id,
      createdBy: currentUser.id
    };

    console.log('Creating project with data:', projectData);

    this.projectsService.createProject(projectData).subscribe({
      next: (createdProject) => {
        console.log('Project created successfully:', createdProject);
        this.successMessage = 'Project created successfully!';
        this.isSubmitting = false;

        // Navigate to the project view page after a short delay
        setTimeout(() => {
          this.router.navigate(['/admin/projects/view', createdProject.id]);
        }, 1500);
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.errorMessage = 'Failed to create project. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/projects']);
  }

  // Helper method to mark all fields as touched to show validation errors
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.projectForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;

    return 'Invalid value';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Project Name',
      description: 'Description',
      type: 'Project Type',
      status: 'Status',
      goalAmount: 'Goal Amount',
      raisedAmount: 'Raised Amount',
      startDate: 'Start Date',
      endDate: 'End Date'
    };
    return labels[fieldName] || fieldName;
  }

  get dateRangeError(): boolean {
    return !!(this.projectForm.errors?.['dateRange'] &&
      (this.projectForm.get('startDate')?.touched || this.projectForm.get('endDate')?.touched));
  }
}