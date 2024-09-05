import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/_core/services/common.service';
import { AppRoutes } from 'src/app/app.routes';
import { AdminRoutes } from 'src/app/admin/admin.routes';
import { pageTransition } from 'src/app/shared/utils/animations';

@Component({
  selector: 'app-all-projects',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './all-projects.component.html',
  styleUrls: ['./all-projects.component.css'],
  animations: [pageTransition],
})
export class AllProjectsComponent {
  constructor(private router: Router, private commonService: CommonService) {}

  toggleDropdown(event: any) {
    event.preventDefault();
    const dropdown = event.target
      .closest('.relative')
      .querySelector('.dropdown-menu');
    dropdown.classList.toggle('hidden');
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

  navigateToEditProject(id: string) {
    this.router.navigate([
      this.commonService.prepareRoute(
        AppRoutes.Admin,
        AdminRoutes.Projects,
        'edit',
        id
      ),
    ]);
  }
}
