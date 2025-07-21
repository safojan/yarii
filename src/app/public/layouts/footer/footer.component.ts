import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimeHelper } from 'src/app/_core/helpers/datetime.helper';
import { Images } from 'src/assets/data/images';

@Component({
  selector: 'public-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class PublicFooterComponent {
  public readonly currentYear: number = DatetimeHelper.currentYear;
  public mainLogo: string = Images.mainLogo;

  public quickLinks = [
    { name: 'About Us', href: '#' },
    { name: 'Our Causes', href: '#' },
    { name: 'How We Work', href: '#' },
    { name: 'Success Stories', href: '#' }
  ];

  public supportLinks = [
    { name: 'Donate Now', href: '#' },
    { name: 'Volunteer', href: '#' },
    { name: 'Partner With Us', href: '#' },
    { name: 'Fundraise', href: '#' }
  ];

  public legalLinks = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
    { name: 'Contact Us', href: '#' }
  ];

  public socialLinks = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' }
  ];

  public contactInfo = {
    address: '123 Charity Street, Gilgit Baltistan',
    phone: '+92 123 456 7890',
    email: 'info@jagowelfare.org'
  };
}