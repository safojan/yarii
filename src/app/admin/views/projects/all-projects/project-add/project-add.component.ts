import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { pageTransition } from 'src/app/shared/utils/animations';

@Component({
  selector: 'app-project-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './project-add.component.html',
  styleUrl: './project-add.component.css',
  animations: [pageTransition],
})
export class ProjectAddComponent {
  projectForm: FormGroup;
  projectTypes = [
    { id: 1, name: 'Women Developement' },
    { id: 2, name: 'Eduaction' },
    { id: 3, name: 'IT infrstructure' },
  ];
  projectStatuses = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'Inactive' },
    { id: 3, name: 'compelete' },
  ];
  projectMembers = [
    { id: 1, name: 'Member 1' },
    { id: 2, name: 'Member 2' },
    { id: 3, name: 'Member 3' },
  ];
  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type_id: ['', Validators.required],
      goal_amount: ['', Validators.required],
      raised_amount: [0, Validators.required],
      status_id: ['', Validators.required],
      members: [[], Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      details: this.fb.array([]),
    });
  }

  ngOnInit(): void {}

  get details(): FormArray {
    return this.projectForm.get('details') as FormArray;
  }

  addField(): void {
    const detailGroup = this.fb.group({
      key: [''],
      value: [''],
    });
    this.details.push(detailGroup);
  }

  removeField(index: number): void {
    this.details.removeAt(index);
  }

  saveProject(): void {
    console.log(this.projectForm.value);
  }
}
