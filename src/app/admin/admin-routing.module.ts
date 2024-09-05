import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AdminRoutes,
  ElementRoutes,
  ProjectRoutes,
  SettingRoutes,
} from './admin.routes';
import { AdminPageNotFoundComponent } from './views/admin-page-not-found/admin-page-not-found.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AdminAlertComponent } from './views/elements/alert/admin-alert.component';
import { ButtonsComponent } from './views/elements/buttons/buttons.component';
import { AdminDataTableComponent } from './views/elements/data-table/data-table.component';
import { FormsComponent } from './views/elements/forms/forms.component';
import { AdminModalComponent } from './views/elements/modal/admin-modal.component';
import { AdminTabComponent } from './views/elements/tab/admin-tab.component';
import { EventsComponent } from './views/events/events.component';
import { TestComponent } from './views/events/test/test.component';
import { ProfileComponent } from './views/settings/profile/profile.component';
import { UsersComponent } from './views/settings/users/users.component';
import { ProjectsContainerComponent } from './views/projects/all-projects/layout/projects/projects.component';
import { AllProjectsComponent } from './views/projects/all-projects/all-projects.component';
import { ProjectAddComponent } from './views/projects/all-projects/project-add/project-add.component';
import { ProjectTypesAddComponent } from './views/projects/all-projects/project-types-add/project-types-add.component';
import { ProjectEditComponent } from './views/projects/all-projects/project-edit/project-edit.component';
import { ProjectViewComponent } from './views/projects/all-projects/project-view/project-view.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: AdminRoutes.Dashboard,
    pathMatch: 'full',
  },
  {
    title: 'Dashboard',
    path: AdminRoutes.Dashboard,
    component: DashboardComponent,
  },
  {
    title: 'Projects',
    path: AdminRoutes.Projects,
    component: ProjectsContainerComponent,
    children: [
      {
        title: 'projects',
        path: '',
        component: AllProjectsComponent,
      },
      {
        title: 'Add Project',
        path: ProjectRoutes.Add,
        component: ProjectAddComponent,
      },
      {
        title: 'Add Project Type',
        path: ProjectRoutes.AddType,
        component: ProjectTypesAddComponent,
      },
      {
        title: 'Edit Project',
        path: ProjectRoutes.Edit,
        component: ProjectEditComponent,
      },
      {
        title: 'View Project',
        path: ProjectRoutes.View,
        component: ProjectViewComponent,
      },
    ],
  },
  {
    title: 'Events',
    path: AdminRoutes.Events,
    component: EventsComponent,
    children: [
      {
        path: 'testing',
        component: TestComponent,
        outlet: 'test',
      },
    ],
  },
  {
    title: 'Elements',
    path: AdminRoutes.Elements,
    children: [
      {
        title: 'Alert',
        path: ElementRoutes.Alert,
        component: AdminAlertComponent,
      },
      {
        path: 'tabs',
        component: AdminTabComponent,
      },
      {
        title: 'Modal',
        path: ElementRoutes.Modal,
        component: AdminModalComponent,
      },
      {
        title: 'Buttons',
        path: ElementRoutes.Buttons,
        component: ButtonsComponent,
      },
      {
        title: 'Data Table',
        path: ElementRoutes.DataTable,
        component: AdminDataTableComponent,
      },
      {
        title: 'Forms',
        path: ElementRoutes.Forms,
        component: FormsComponent,
      },
    ],
  },
  {
    path: AdminRoutes.Settings,
    children: [
      {
        title: 'Settings',
        path: SettingRoutes.Profile,
        component: ProfileComponent,
      },
      {
        title: 'Users',
        path: SettingRoutes.Users,
        component: UsersComponent,
      },
    ],
  },
  { path: '**', component: AdminPageNotFoundComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
