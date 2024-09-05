import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllProjectsComponent } from './all-projects/all-projects.component';
import { ProjectsContainerComponent } from './all-projects/layout/projects/projects.component';
import { ProjectEditComponent } from './all-projects/project-edit/project-edit.component';
import { ProjectAddComponent } from './all-projects/project-add/project-add.component';
import { ProjectTypesAddComponent } from './all-projects/project-types-add/project-types-add.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    //project components
    AllProjectsComponent,
    ProjectsContainerComponent,
    ProjectEditComponent,
    ProjectAddComponent,
    ProjectTypesAddComponent,
  ],
})
export class ProjectsModule {}
