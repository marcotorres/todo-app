import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, TaskService, NotificationService, AbilityService } from '@core/services';
import { Task } from '@core/models';
import { LoadingSpinnerComponent, ConfirmDialogComponent, ConfirmDialogData } from '@shared/components';
import { RelativeTimePipe } from '@shared/pipes';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskEditDialogComponent } from '../task-edit-dialog/task-edit-dialog.component';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    LoadingSpinnerComponent,
    RelativeTimePipe,
    TaskFormComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly taskService = inject(TaskService);
  private readonly notificationService = inject(NotificationService);
  private readonly abilityService = inject(AbilityService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly currentUser = this.authService.currentUser;
  readonly tasks = this.taskService.filteredTasks;
  readonly loading = this.taskService.loading;
  readonly searchQuery = this.taskService.searchQuery;
  readonly notifications = this.notificationService.recentNotifications;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly canCreateTask = this.abilityService.canCreateTask;
  readonly canUpdateTask = this.abilityService.canUpdateTask;
  readonly canDeleteTask = this.abilityService.canDeleteTask;
  readonly canCompleteTask = this.abilityService.canCompleteTask;
  readonly canUpdateUser = this.abilityService.canUpdateUser;
  readonly showForm = signal(false);
  readonly sidebarCollapsed = signal(false);

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.loadTasks().subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to load tasks', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  toggleForm(): void {
    this.showForm.update(value => !value);
  }

  onTaskCreated(): void {
    this.showForm.set(false);
  }

  toggleTaskStatus(task: Task): void {
    this.taskService.toggleTaskStatus(task.id).subscribe({
      next: (updatedTask) => {
        const status = updatedTask.completed ? 'completed' : 'pending';
        this.snackBar.open(`Task marked as ${status}`, 'Close', {
          duration: 2000
        });
        if (updatedTask.completed) {
          this.notificationService.notifyTaskCompleted(updatedTask);
        }
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Failed to update task', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  editTask(task: Task): void {
    const dialogRef = this.dialog.open(TaskEditDialogComponent, {
      data: task,
      width: '500px',
      maxWidth: '95vw',
      ariaLabel: 'Edit task dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Task updated successfully', 'Close', {
          duration: 2000
        });
      }
    });
  }

  deleteTask(task: Task): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px',
      ariaLabel: 'Delete task confirmation dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 2000
            });
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to delete task', 'Close', {
              duration: 5000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.taskService.clearTasks();
    this.router.navigate(['/login']);
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';
    const first = user.name?.charAt(0) || '';
    const last = user.lastname?.charAt(0) || '';
    return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
  }

  getPendingCount(): number {
    return this.tasks().filter(t => !t.completed).length;
  }

  getCompletedCount(): number {
    return this.tasks().filter(t => t.completed).length;
  }

  getCompletionRate(): number {
    const total = this.tasks().length;
    if (total === 0) return 0;
    return Math.round((this.getCompletedCount() / total) * 100);
  }

  openProfileDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: this.currentUser()
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.taskService.setSearchQuery(query);
  }

  clearSearch(): void {
    this.taskService.clearSearch();
  }

  markNotificationAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'task_created': return 'add_task';
      case 'task_completed': return 'check_circle';
      case 'task_updated': return 'edit';
      case 'welcome': return 'waving_hand';
      case 'reminder': return 'notifications';
      default: return 'info';
    }
  }
}
