import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '@core/services';
import { Task } from '@core/models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './task-edit-dialog.component.html',
  styleUrl: './task-edit-dialog.component.scss'
})
export class TaskEditDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskEditDialogComponent>);
  private readonly task = inject<Task>(MAT_DIALOG_DATA);
  private readonly taskService = inject(TaskService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly editForm: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      title: [this.task.title, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [this.task.description, [Validators.maxLength(500)]]
    });
  }

  get titleControl() {
    return this.editForm.get('title');
  }

  get descriptionControl() {
    return this.editForm.get('description');
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSave(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const { title, description } = this.editForm.value;
    this.loading.set(true);

    this.taskService.updateTask(this.task.id, {
      title: title.trim(),
      description: description?.trim() || ''
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to update task', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
}
