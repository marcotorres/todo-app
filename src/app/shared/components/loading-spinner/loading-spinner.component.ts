import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="flex items-center justify-center p-4" [attr.aria-label]="'Loading'" role="status">
      <mat-spinner [diameter]="diameter" [strokeWidth]="strokeWidth"></mat-spinner>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter = 40;
  @Input() strokeWidth = 4;
}
