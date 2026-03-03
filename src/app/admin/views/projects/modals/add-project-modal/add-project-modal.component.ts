import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectsService, ProjectType, ProjectStatus, Project } from '../../../../../shared/services/projects.service';
import { UserService } from '../../../../../_core/services/user.service';
import { AdminModalComponent } from '../../../elements/modal/admin-modal.component';

@Component({
    selector: 'add-project-modal',
    templateUrl: './add-project-modal.component.html',
    styleUrls: ['./add-project-modal.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AdminModalComponent]
})
export class AddProjectModalComponent {
    @ViewChild(AdminModalComponent) modal!: AdminModalComponent;
    @Output() projectCreated = new EventEmitter<Project>();
    @Output() cancelled = new EventEmitter<void>();

    projectForm!: FormGroup;
    projectTypes: ProjectType[] = [];
    projectStatuses: ProjectStatus[] = [];

    isSubmitting = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private projectsService: ProjectsService,
        private userService: UserService
    ) {
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

    dateRangeValidator(control: AbstractControl): ValidationErrors | null {
        const startDate = control.get('startDate')?.value;
        const endDate = control.get('endDate')?.value;

        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            return { dateRange: true };
        }
        return null;
    }

    loadFormData(): void {
        this.projectsService.projectTypes$.subscribe({
            next: (types) => {
                this.projectTypes = types;
            }
        });

        this.projectsService.projectStatuses$.subscribe({
            next: (statuses) => {
                this.projectStatuses = statuses;
            }
        });
    }

    open(): void {
        this.projectForm.reset({ raisedAmount: 0 });
        this.errorMessage = '';
        this.modal.open({
            title: 'Create New Project',
            size: 'xl',
            showCloseButton: true,
            showFooter: false
        });
    }

    close(): void {
        this.modal.close();
        this.cancelled.emit();
    }

    onSubmit(): void {
        if (this.projectForm.invalid) {
            this.markFormGroupTouched(this.projectForm);
            this.errorMessage = 'Please fill in all required fields correctly.';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

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

        this.projectsService.createProject(projectData).subscribe({
            next: (createdProject) => {
                console.log('Project created successfully:', createdProject);
                this.isSubmitting = false;
                this.projectCreated.emit(createdProject);
                this.close();
            },
            error: (error) => {
                console.error('Error creating project:', error);
                this.errorMessage = 'Failed to create project. Please try again.';
                this.isSubmitting = false;
            }
        });
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

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
