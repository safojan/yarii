// loader.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <div class="loader" [ngStyle]="loaderStyle">
        <div class="loader-inner">
          <div 
            *ngFor="let block of blocksArray; let i = index"
            class="loader-block"
            [style.width.px]="blockSize"
            [style.height.px]="blockSize"
            [style.margin.px]="blockMargin"
            [style.background-color]="blockColor"
            [style.box-shadow]="getBoxShadow()"
            [style.animation-delay]="getAnimationDelay(i)"
            [style.border-radius.px]="2">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loader {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .loader-inner {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      gap: 0;
    }

    .loader-block {
      display: inline-block;
      transform-origin: center center;
      animation-name: loaderPulse;
      animation-duration: 1.2s;
      animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
      animation-iteration-count: infinite;
      animation-fill-mode: both;
    }

    @keyframes loaderPulse {
      0%, 40%, 100% {
        transform: scaleY(0.4);
        opacity: 0.5;
      }
      20% {
        transform: scaleY(1.0);
        opacity: 1;
      }
    }

    /* Alternative wave animation */
    @keyframes loaderWave {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      
      20% {
        transform: scaleY(1.0);
      }
    }

    /* Fallback for older browsers */
    .loader-block {
      -webkit-animation-name: loaderPulse;
      -webkit-animation-duration: 1.2s;
      -webkit-animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
      -webkit-animation-iteration-count: infinite;
      -webkit-animation-fill-mode: both;
    }

    @-webkit-keyframes loaderPulse {
      0%, 40%, 100% {
        -webkit-transform: scaleY(0.4);
        transform: scaleY(0.4);
        opacity: 0.5;
      }
      20% {
        -webkit-transform: scaleY(1.0);
        transform: scaleY(1.0);
        opacity: 1;
      }
    }
  `]
})
export class LoaderComponent implements OnInit {
  // Container styling options
  @Input() containerClass: string = 'flex justify-center my-8';
  @Input() mx: string = '';
  @Input() my: string = '8';
  @Input() mt: string = '';
  @Input() mb: string = '';
  @Input() ml: string = '';
  @Input() mr: string = '';
  @Input() p: string = '';
  @Input() px: string = '';
  @Input() py: string = '';
  @Input() pt: string = '';
  @Input() pb: string = '';
  @Input() pl: string = '';
  @Input() pr: string = '';

  // Loader size and appearance options
  @Input() size: number = 80;
  @Input() blockCount: number = 8;
  @Input() blockSize: number = 6;
  @Input() blockMargin: number = 1;
  @Input() blockColor: string = '#3498db';
  @Input() shadowColor: string = 'rgba(52, 152, 219, 0.3)';
  @Input() animationDuration: number = 1.2;
  @Input() animationDelay: number = 0.15;

  // Additional styling options
  @Input() borderRadius: string = '50%';
  @Input() customClass: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // Force a slight delay to ensure DOM is ready
    setTimeout(() => {
      this.triggerAnimation();
    }, 100);
  }

  private triggerAnimation() {
    // This method can be used to restart animation if needed
    const blocks = document.querySelectorAll('.loader-block');
    blocks.forEach((block, index) => {
      const element = block as HTMLElement;
      element.style.animationDelay = `${index * this.animationDelay}s`;
      element.style.animationDuration = `${this.animationDuration}s`;
    });
  }

  get containerClasses(): string {
    let classes = ['flex', 'justify-center'];
    
    // Handle margin classes
    if (this.mx) classes.push(`mx-${this.mx}`);
    if (this.my && !this.mt && !this.mb) classes.push(`my-${this.my}`);
    if (this.mt) classes.push(`mt-${this.mt}`);
    if (this.mb) classes.push(`mb-${this.mb}`);
    if (this.ml) classes.push(`ml-${this.ml}`);
    if (this.mr) classes.push(`mr-${this.mr}`);
    
    // Handle padding classes
    if (this.p) classes.push(`p-${this.p}`);
    if (this.px) classes.push(`px-${this.px}`);
    if (this.py) classes.push(`py-${this.py}`);
    if (this.pt) classes.push(`pt-${this.pt}`);
    if (this.pb) classes.push(`pb-${this.pb}`);
    if (this.pl) classes.push(`pl-${this.pl}`);
    if (this.pr) classes.push(`pr-${this.pr}`);
    
    // Add custom classes
    if (this.customClass) classes.push(this.customClass);
    
    return classes.join(' ');
  }

  get loaderStyle(): { [key: string]: any } {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }

  getBoxShadow(): string {
    return `0 0 10px ${this.shadowColor}`;
  }

  getAnimationDelay(index: number): string {
    return `${index * this.animationDelay}s`;
  }

  get blocksArray(): number[] {
    return Array.from({ length: this.blockCount }, (_, i) => i);
  }
}