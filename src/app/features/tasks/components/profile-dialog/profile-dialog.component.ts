import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '@core/models';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-dialog">
      <div class="dialog-header">
        <div class="header-title">
          <mat-icon>person</mat-icon>
          <h2>My Profile</h2>
        </div>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="avatar-section">
          <div class="avatar-container">
            <div class="avatar-large">
              {{ getInitials() }}
            </div>
            <div class="avatar-badge">
              <mat-icon>verified</mat-icon>
            </div>
          </div>
          <div class="avatar-info">
            <h3>{{ data.name }} {{ data.lastname }}</h3>
            <p>{{ data.email }}</p>
            <span class="status-badge">Active</span>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">
            <mat-icon>badge</mat-icon>
            Personal Information
          </h4>
          
          <form [formGroup]="profileForm" class="profile-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>First Name</mat-label>
                <mat-icon matPrefix>person_outline</mat-icon>
                <input matInput formControlName="name" placeholder="Enter your first name" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Last Name</mat-label>
                <mat-icon matPrefix>person_outline</mat-icon>
                <input matInput formControlName="lastname" placeholder="Enter your last name" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email" readonly />
              <mat-icon matSuffix class="lock-icon">lock</mat-icon>
              <mat-hint>Email cannot be changed</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number</mat-label>
              <mat-icon matPrefix>phone</mat-icon>
              <input matInput formControlName="phone" placeholder="+1 (555) 000-0000" />
            </mat-form-field>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button class="cancel-btn" (click)="close()" [disabled]="saving()">Cancel</button>
        <button mat-flat-button class="save-btn" (click)="save()" [disabled]="profileForm.invalid || saving()">
          @if (saving()) {
            <ng-container>
              <mat-spinner diameter="18" strokeWidth="2"></mat-spinner>
              <span>Saving...</span>
            </ng-container>
          } @else {
            <ng-container>
              <mat-icon>save</mat-icon>
              <span>Save Changes</span>
            </ng-container>
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .profile-dialog {
      min-width: 480px;
      max-width: 520px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 1px solid #334155;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      mat-icon {
        color: #667eea;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #f8fafc;
      }
    }

    .close-btn {
      color: #64748b !important;
      transition: all 0.2s ease;

      &:hover {
        color: #f1f5f9 !important;
        background: rgba(255, 255, 255, 0.1) !important;
      }
    }

    mat-dialog-content {
      padding: 1.5rem !important;
      background: #0f172a;
      max-height: 70vh;
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
      border-radius: 16px;
      border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .avatar-container {
      position: relative;
    }

    .avatar-large {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .avatar-badge {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 24px;
      height: 24px;
      background: #22c55e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #0f172a;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: white;
      }
    }

    .avatar-info {
      flex: 1;

      h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #f8fafc;
      }

      p {
        margin: 0.25rem 0 0.5rem;
        font-size: 0.875rem;
        color: #94a3b8;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.75rem;
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        font-size: 0.75rem;
        font-weight: 500;
        border-radius: 20px;
      }
    }

    .form-section {
      background: #1e293b;
      border-radius: 12px;
      padding: 1.25rem;
      border: 1px solid #334155;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #94a3b8;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #667eea;
      }
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    ::ng-deep {
      .mat-mdc-form-field {
        .mat-mdc-text-field-wrapper {
          background-color: rgba(15, 23, 42, 0.5) !important;
          border-radius: 10px;

          .mat-mdc-form-field-flex {
            background-color: transparent !important;
          }

          &.mdc-text-field--outlined {
            .mdc-notched-outline {
              .mdc-notched-outline__leading {
                border-color: #334155 !important;
                border-radius: 10px 0 0 10px !important;
                background-color: transparent !important;
              }

              .mdc-notched-outline__trailing {
                border-color: #334155 !important;
                border-radius: 0 10px 10px 0 !important;
                background-color: transparent !important;
              }

              .mdc-notched-outline__notch {
                border-color: #334155 !important;
                background-color: transparent !important;
                border-left: none !important;
                border-right: none !important;
              }
            }
          }

          &.mdc-text-field--outlined:hover:not(.mdc-text-field--focused):not(.mdc-text-field--disabled) {
            .mdc-notched-outline {
              .mdc-notched-outline__leading,
              .mdc-notched-outline__trailing,
              .mdc-notched-outline__notch {
                border-color: #475569 !important;
              }
            }
          }

          &.mdc-text-field--outlined.mdc-text-field--focused {
            .mdc-notched-outline {
              .mdc-notched-outline__leading,
              .mdc-notched-outline__trailing,
              .mdc-notched-outline__notch {
                border-color: #667eea !important;
                border-width: 2px !important;
              }
            }
          }
        }

        .mat-mdc-form-field-focus-overlay {
          background-color: transparent !important;
        }

        .mat-mdc-form-field-icon-prefix {
          padding: 0 12px 0 0 !important;
          border-right: none !important;

          mat-icon {
            color: #64748b;
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .mat-mdc-form-field-icon-suffix {
          border-left: none !important;
        }

        .mdc-text-field--outlined .mdc-notched-outline .mdc-notched-outline__leading {
          border-right: none !important;
        }

        input.mat-mdc-input-element {
          color: #f1f5f9 !important;
          caret-color: #667eea !important;
          background-color: transparent !important;
          font-size: 0.95rem;

          &::placeholder {
            color: #64748b !important;
          }
        }

        .mat-mdc-floating-label {
          color: #94a3b8 !important;
        }

        .mat-mdc-form-field-hint {
          color: #64748b !important;
          font-size: 0.7rem;
        }

        .mat-mdc-form-field-error {
          color: #f87171 !important;
        }

        .lock-icon {
          color: #475569 !important;
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem !important;
      margin: 0 !important;
      background: #1e293b;
      border-top: 1px solid #334155;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .cancel-btn {
      color: #94a3b8 !important;
      border-radius: 8px !important;

      &:hover {
        background: rgba(148, 163, 184, 0.1) !important;
      }
    }

    .save-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border-radius: 10px !important;
      padding: 0 1.25rem !important;
      height: 40px !important;
      font-weight: 500 !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
      transition: all 0.2s ease !important;

      .mdc-button__label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
      }

      &:disabled {
        opacity: 0.6;
      }
    }

    @media (max-width: 520px) {
      .profile-dialog {
        min-width: auto;
        max-width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 0.75rem;
      }

      .avatar-section {
        flex-direction: column;
        text-align: center;
      }

      mat-dialog-actions {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class ProfileDialogComponent {
  readonly data = inject<User>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ProfileDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);

  readonly profileForm: FormGroup;
  readonly saving = signal(false);

  constructor() {
    this.profileForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      lastname: [this.data?.lastname || '', Validators.required],
      email: [this.data?.email || ''],
      phone: [this.data?.phone || '']
    });
  }

  getInitials(): string {
    const first = this.data?.name?.charAt(0) || '';
    const last = this.data?.lastname?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.profileForm.valid && !this.saving()) {
      this.saving.set(true);
      
      const updateData = {
        name: this.profileForm.value.name,
        lastname: this.profileForm.value.lastname,
        phone: this.profileForm.value.phone
      };

      this.authService.updateProfile(updateData).subscribe({
        next: (updatedUser) => {
          this.saving.set(false);
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000
          });
          this.dialogRef.close(updatedUser);
        },
        error: (error) => {
          this.saving.set(false);
          this.snackBar.open(error?.message || 'Failed to update profile', 'Close', {
            duration: 5000
          });
        }
      });
    }
  }
}
