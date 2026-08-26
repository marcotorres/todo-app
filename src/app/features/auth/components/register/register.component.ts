import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService, NotificationService } from '@core/services';
import { UserRegistration, SecurityMetadata, NotificationPreferences } from '@core/models';
import { environment } from '@environments/environment';
import { finalize } from 'rxjs';
import { LegalDialogComponent, LegalDialogData } from '../legal-dialog/legal-dialog.component';

declare const grecaptcha: any;

interface Country {
  code: string;
  name: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatDialogModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly registerForm: FormGroup;
  readonly maxDate = new Date();
  readonly minDate = new Date(1900, 0, 1);
  private recaptchaLoaded = false;

  readonly genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  readonly countries: Country[] = [
    { code: 'AR', name: 'Argentina' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CU', name: 'Cuba' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'HN', name: 'Honduras' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'PA', name: 'Panama' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'PE', name: 'Peru' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'ES', name: 'Spain' },
    { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VE', name: 'Venezuela' }
  ];

  constructor() {
    const pendingEmail = this.authService.getPendingEmail() || '';

    this.maxDate.setFullYear(this.maxDate.getFullYear() - 13);

    this.registerForm = this.fb.group({
      email: [{ value: pendingEmail, disabled: true }, [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{6,14}$/)]],
      birthDate: [null],
      gender: [''],
      country: [''],
      termsAccepted: [false, [Validators.requiredTrue]],
      privacyPolicyAccepted: [false, [Validators.requiredTrue]],
      notificationEmail: [true],
      notificationSms: [false],
      notificationPush: [true]
    });
  }

  ngOnInit(): void {
    if (!this.authService.getPendingEmail()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadRecaptcha();
  }

  ngOnDestroy(): void {
    this.removeRecaptcha();
  }

  private loadRecaptcha(): void {
    if (typeof grecaptcha !== 'undefined') {
      this.recaptchaLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptchaSiteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.recaptchaLoaded = true;
    };
    document.head.appendChild(script);
  }

  private removeRecaptcha(): void {
    const badge = document.querySelector('.grecaptcha-badge');
    if (badge) {
      badge.remove();
    }
  }

  get emailControl() { return this.registerForm.get('email'); }
  get nameControl() { return this.registerForm.get('name'); }
  get lastnameControl() { return this.registerForm.get('lastname'); }
  get phoneControl() { return this.registerForm.get('phone'); }
  get birthDateControl() { return this.registerForm.get('birthDate'); }
  get termsControl() { return this.registerForm.get('termsAccepted'); }
  get privacyControl() { return this.registerForm.get('privacyPolicyAccepted'); }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showValidationErrors();
      return;
    }

    this.loading.set(true);

    try {
      const captchaToken = await this.getCaptchaToken();
      const securityMetadata = this.buildSecurityMetadata(captchaToken);
      const notificationPreferences = this.buildNotificationPreferences();
      const userData = this.buildUserData(securityMetadata, notificationPreferences);

      this.authService.register(userData).pipe(
        finalize(() => this.loading.set(false))
      ).subscribe({
        next: (response) => {
          this.notificationService.notifyWelcome(response.user.name);
          this.snackBar.open('Account created successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Registration failed. Please try again.', 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    } catch (error) {
      this.loading.set(false);
      this.snackBar.open('Security verification failed. Please try again.', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  private async getCaptchaToken(): Promise<string> {
    if (!this.recaptchaLoaded || typeof grecaptcha === 'undefined') {
      return 'captcha-not-loaded';
    }

    return new Promise((resolve) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recaptchaSiteKey, { action: 'register' })
          .then((token: string) => resolve(token))
          .catch(() => resolve('captcha-error'));
      });
    });
  }

  private buildSecurityMetadata(captchaToken: string): SecurityMetadata {
    return {
      csrfToken: '',
      captchaToken,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
  }

  private buildNotificationPreferences(): NotificationPreferences {
    return {
      email: this.registerForm.get('notificationEmail')?.value ?? true,
      sms: this.registerForm.get('notificationSms')?.value ?? false,
      push: this.registerForm.get('notificationPush')?.value ?? true
    };
  }

  private buildUserData(securityMetadata: SecurityMetadata, notificationPreferences: NotificationPreferences): UserRegistration {
    const formValue = this.registerForm.getRawValue();

    return {
      email: formValue.email,
      name: formValue.name.trim(),
      lastname: formValue.lastname.trim(),
      phone: formValue.phone?.trim() || undefined,
      birthDate: formValue.birthDate ? new Date(formValue.birthDate).toISOString().split('T')[0] : undefined,
      gender: formValue.gender || undefined,
      country: formValue.country || undefined,
      termsAccepted: formValue.termsAccepted,
      privacyPolicyAccepted: formValue.privacyPolicyAccepted,
      notificationPreferences,
      securityMetadata
    };
  }

  private showValidationErrors(): void {
    const errors: string[] = [];

    if (this.nameControl?.hasError('required')) {
      errors.push('Name is required');
    }
    if (this.lastnameControl?.hasError('required')) {
      errors.push('Last name is required');
    }
    if (this.termsControl?.hasError('required')) {
      errors.push('You must accept the terms and conditions');
    }
    if (this.privacyControl?.hasError('required')) {
      errors.push('You must accept the privacy policy');
    }

    if (errors.length > 0) {
      this.snackBar.open(errors[0], 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
  }

  goBack(): void {
    this.authService.clearPendingEmail();
    this.router.navigate(['/login']);
  }

  openTermsDialog(event: Event): void {
    event.preventDefault();
    this.dialog.open(LegalDialogComponent, {
      data: {
        title: 'Terms and Conditions',
        type: 'terms'
      } as LegalDialogData,
      width: '600px',
      maxHeight: '80vh',
      panelClass: 'legal-dialog-panel'
    });
  }

  openPrivacyDialog(event: Event): void {
    event.preventDefault();
    this.dialog.open(LegalDialogComponent, {
      data: {
        title: 'Privacy Policy',
        type: 'privacy'
      } as LegalDialogData,
      width: '600px',
      maxHeight: '80vh',
      panelClass: 'legal-dialog-panel'
    });
  }
}
