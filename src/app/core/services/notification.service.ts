import { Injectable, inject, signal, computed } from '@angular/core';
import { Task } from '@core/models';

export interface Notification {
  id: string;
  type: 'task_created' | 'task_completed' | 'task_updated' | 'welcome' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  taskId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSignal = signal<Notification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();

  readonly unreadCount = computed(() =>
    this.notificationsSignal().filter(n => !n.read).length
  );

  readonly recentNotifications = computed(() =>
    [...this.notificationsSignal()]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  );

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.notificationsSignal.set(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch {
        this.notificationsSignal.set([]);
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notificationsSignal()));
  }

  notifyWelcome(userName?: string): void {
    this.addNotification({
      type: 'welcome',
      title: 'Welcome to TaskFlow! 👋',
      message: userName
        ? `Hi ${userName}! Start creating tasks to stay organized.`
        : 'Start creating tasks to stay organized and productive.'
    });
  }

  addNotification(data: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const notification: Notification = {
      ...data,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    this.notificationsSignal.update(notifications => [notification, ...notifications]);
    this.saveToStorage();
  }

  notifyTaskCreated(task: Task): void {
    this.addNotification({
      type: 'task_created',
      title: 'Task Created',
      message: `"${task.title}" has been added to your list.`,
      taskId: task.id
    });
  }

  notifyTaskCompleted(task: Task): void {
    this.addNotification({
      type: 'task_completed',
      title: 'Task Completed! 🎉',
      message: `Great job! "${task.title}" is done.`,
      taskId: task.id
    });
  }

  notifyTaskUpdated(task: Task): void {
    this.addNotification({
      type: 'task_updated',
      title: 'Task Updated',
      message: `"${task.title}" has been modified.`,
      taskId: task.id
    });
  }

  markAsRead(id: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
    this.saveToStorage();
  }

  markAllAsRead(): void {
    this.notificationsSignal.set([]);
    this.saveToStorage();
  }

  removeNotification(id: string): void {
    this.notificationsSignal.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
    this.saveToStorage();
  }

  clearAll(): void {
    this.notificationsSignal.set([]);
    this.saveToStorage();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
