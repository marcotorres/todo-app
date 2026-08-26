import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService, NotificationService } from '@core/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);

  @Output() taskCreated = new EventEmitter<void>();

  readonly loading = signal(false);
  readonly taskForm: FormGroup;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  get titleControl() {
    return this.taskForm.get('title');
  }

  get descriptionControl() {
    return this.taskForm.get('description');
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const { title, description } = this.taskForm.value;
    this.loading.set(true);

    this.taskService.createTask({
      title: title.trim(),
      description: description?.trim() || ''
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (task) => {
        this.snackBar.open('Task created successfully', 'Close', {
          duration: 2000
        });
        this.notificationService.notifyTaskCreated(task);
        this.taskForm.reset();
        this.taskCreated.emit();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to create task', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
}
