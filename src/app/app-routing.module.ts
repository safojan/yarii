import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { employeeComponent } from './employee/employee.component';

import { AppRoutes } from './app.routes';
import { PageNotFoundComponent } from './public/page-not-found/page-not-found.component';
import { PublicComponent } from './public/public.component';
import { AuthGuard } from './_core/gaurds/auth.guard';
import { IsAdminGuard } from './_core/gaurds/isAdmin.guard';
const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    loadChildren: () =>
      import('./public/public.module').then((m) => m.PublicModule),
  },
  {
    path: AppRoutes.Admin,
    component: AdminComponent,
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    canActivate: [AuthGuard, IsAdminGuard],
  },
  {
    path: AppRoutes.Employee,
    component: employeeComponent,
    loadChildren: () =>
      import('./employee/employee.module').then((m) => m.AdminModule),
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // enableTracing: true, //uncomment for debugging only
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
