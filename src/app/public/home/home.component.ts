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
      transition('void => *', [animate('1s ease-in')])
    ]),
    trigger('slideInUp', [
      state('void', style({ transform: 'translateY(50px)', opacity: 0 })),
      transition('void => *', [animate('0.8s ease-out')])
    ])
  ]
})
export class HomeComponent {
  readonly publicRoutes = PublicRoutes;
  
  causes = [
    {
      icon: '📚',
      title: 'Children education',
      description: 'Donate for',
      details: 'More details...',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      icon: '💧',
      title: 'Clean mineral water',
      description: 'Donate for',
      details: 'More details...',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    },
    {
      icon: '🏥',
      title: 'Surgery & treatment',
      description: 'Donate for',
      details: 'More details...',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      icon: '🍎',
      title: 'Healthy & good food',
      description: 'Donate for',
      details: 'More details...',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    }
  ];

  upcomingEvents = [
    {
      title: 'Aid for the street children',
      date: 'Dec 25, 2024',
      image: '../../../assets/images/homepage/Cans.jpeg'
    },
    {
      title: 'Education for all children',
      date: 'Jan 15, 2025',
      image: '../../../assets/images/homepage/Essen.jpeg'
    },
    {
      title: 'Healthy food and nutritious awareness campaign volunteer',
      date: 'Feb 10, 2025',
      image: '../../../assets/images/homepage/Cans.jpeg'
    }
  ];

  newsUpdates = [
    {
      title: 'Weekly food and nutrition among street children',
      date: 'Dec 20, 2024',
      image: '../../../assets/images/homepage/Essen.jpeg'
    },
    {
      title: 'Monthly children learning and development program',
      date: 'Dec 18, 2024',
      image: '../../../assets/images/homepage/Cans.jpeg'
    },
    {
      title: 'Emergency aid program among street children',
      date: 'Dec 15, 2024',
      image: '../../../assets/images/homepage/Essen.jpeg'
    }
  ];

  constructor(public readonly commonService: CommonService) {}

  protected readonly AppRoutes = AppRoutes;
  protected readonly AdminRoutes = AdminRoutes;
}