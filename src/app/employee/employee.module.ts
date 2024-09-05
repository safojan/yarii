import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { employeeRoutingModule } from './employee-routing.module';
import { LayoutsModule } from './layouts/layouts.module';

import { employeeComponent } from './employee.component';
import { AdminPageNotFoundComponent } from './views/admin-page-not-found/admin-page-not-found.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { EventsComponent } from './views/events/events.component';
import { SettingsModule } from './views/settings/settings.module';
import { ElementsModule } from './views/elements/elements.module';

@NgModule({
  declarations: [
    employeeComponent,
    DashboardComponent,
    AdminPageNotFoundComponent,
    EventsComponent,
  ],
  imports: [
    CommonModule,
    employeeRoutingModule,
    LayoutsModule,
    SettingsModule,
    ElementsModule,
  ],
})
export class AdminModule {}
