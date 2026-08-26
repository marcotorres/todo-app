import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface LegalDialogData {
  title: string;
  type: 'terms' | 'privacy';
}

@Component({
  selector: 'app-legal-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="legal-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <button mat-icon-button (click)="close()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content>
        @if (data.type === 'terms') {
          <div class="legal-content">
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using Todo App, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>

            <h3>2. Description of Service</h3>
            <p>Todo App provides a task management platform that allows users to create, organize, and track their tasks and activities. The service is provided "as is" and we reserve the right to modify or discontinue the service at any time.</p>

            <h3>3. User Account</h3>
            <p>To use certain features of the service, you must register for an account. You agree to:</p>
            <ul>
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h3>4. User Conduct</h3>
            <p>You agree not to use the service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful, threatening, or offensive content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the service</li>
            </ul>

            <h3>5. Intellectual Property</h3>
            <p>All content, features, and functionality of the service are owned by Todo App and are protected by international copyright, trademark, and other intellectual property laws.</p>

            <h3>6. Limitation of Liability</h3>
            <p>Todo App shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>

            <h3>7. Changes to Terms</h3>
            <p>We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the service after such modifications constitutes your acceptance of the updated terms.</p>

            <h3>8. Contact Information</h3>
            <p>If you have any questions about these Terms and Conditions, please contact us at support&#64;todoapp.com.</p>

            <p class="last-updated"><strong>Last updated:</strong> February 2026</p>
          </div>
        }

        @if (data.type === 'privacy') {
          <div class="legal-content">
            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and optional profile details</li>
              <li><strong>Task Data:</strong> Tasks, lists, and related content you create</li>
              <li><strong>Usage Information:</strong> How you interact with our service</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>

            <h3>3. Information Sharing</h3>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
            <ul>
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations</li>
            </ul>

            <h3>4. Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage practices</li>
            </ul>

            <h3>5. Data Retention</h3>
            <p>We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting us.</p>

            <h3>6. Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data in a portable format</li>
            </ul>

            <h3>7. Cookies and Tracking</h3>
            <p>We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts. You can control cookie preferences through your browser settings.</p>

            <h3>8. Children's Privacy</h3>
            <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>

            <h3>9. Changes to This Policy</h3>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>

            <h3>10. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy&#64;todoapp.com.</p>

            <p class="last-updated"><strong>Last updated:</strong> February 2026</p>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-flat-button color="primary" (click)="close()">
          I Understand
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .legal-dialog {
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 8px;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #f9fafb;
      }

      button {
        color: #9ca3af;
      }
    }

    .legal-content {
      font-size: 0.9rem;
      line-height: 1.6;
      color: #d1d5db;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #f9fafb;
        margin: 1.5rem 0 0.5rem;

        &:first-child {
          margin-top: 0;
        }
      }

      p {
        margin: 0.5rem 0;
        color: #d1d5db;
      }

      ul {
        margin: 0.5rem 0;
        padding-left: 1.5rem;

        li {
          margin: 0.25rem 0;
          color: #d1d5db;
        }
      }

      .last-updated {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #374151;
        font-size: 0.85rem;
        color: #9ca3af;
      }
    }

    mat-dialog-content {
      max-height: 60vh;
      padding: 0 24px !important;
    }

    mat-dialog-actions {
      padding: 16px 24px !important;
      margin: 0 !important;
    }

  `],
  host: {
    'class': 'legal-dialog-host'
  }
})
export class LegalDialogComponent {
  readonly data = inject<LegalDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<LegalDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
