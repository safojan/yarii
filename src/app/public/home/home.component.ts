import { Component } from '@angular/core';
import { PublicRoutes } from "../public.routes";
import { CommonService } from "../../_core/services/common.service";
import { AppRoutes } from "../../app.routes";
import { AdminRoutes } from "../../admin/admin.routes";
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition('void => *', [
        animate('1s ease-in')
      ])
    ])
  ]
})
export class HomeComponent {
  readonly publicRoutes = PublicRoutes;

  constructor(public readonly commonService: CommonService) {
  }

  protected readonly AppRoutes = AppRoutes;
  protected readonly AdminRoutes = AdminRoutes;
}
