import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="icon-wrapper">
          <mat-icon>lock</mat-icon>
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p class="subtitle">Please contact your administrator if you believe this is an error.</p>
        <div class="actions">
          <button mat-flat-button class="back-btn" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
          <button mat-flat-button class="home-btn" (click)="goHome()">
            <mat-icon>home</mat-icon>
            Go Home
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 1rem;
    }

    .unauthorized-card {
      text-align: center;
      padding: 3rem;
      background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
      border-radius: 24px;
      border: 1px solid #334155;
      max-width: 480px;
      width: 100%;
    }

    .icon-wrapper {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ef4444;
      }
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.5rem;
    }

    p {
      color: #94a3b8;
      font-size: 1rem;
      margin: 0 0 0.5rem;
    }

    .subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .back-btn, .home-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 500;
    }

    .back-btn {
      background: #334155 !important;
      color: #f1f5f9 !important;

      &:hover {
        background: #475569 !important;
      }
    }

    .home-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;

      &:hover {
        opacity: 0.9;
      }
    }
  `]
})
export class UnauthorizedComponent {
  private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/login']);
  }

  goHome(): void {
    this.router.navigate(['/login']);
  }
}
