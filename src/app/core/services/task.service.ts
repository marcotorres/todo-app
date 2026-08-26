import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Task, CreateTaskDto, UpdateTaskDto } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  private readonly tasksSignal = signal<Task[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly searchQuerySignal = signal<string>('');

  readonly tasks = this.tasksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly searchQuery = this.searchQuerySignal.asReadonly();

  readonly sortedTasks = computed(() =>
    [...this.tasksSignal()].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );

  readonly filteredTasks = computed(() => {
    const query = this.searchQuerySignal().toLowerCase().trim();
    if (!query) {
      return this.sortedTasks();
    }
    return this.sortedTasks().filter(task =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  });

  readonly pendingTasks = computed(() =>
    this.filteredTasks().filter(task => !task.completed)
  );

  readonly completedTasks = computed(() =>
    this.filteredTasks().filter(task => task.completed)
  );

  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  clearSearch(): void {
    this.searchQuerySignal.set('');
  }

  loadTasks(): Observable<Task[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        const rawTasks = Array.isArray(response) ? response : (response?.data || []);
        return rawTasks.map((t: any) => this.mapTask(t));
      }),
      tap(tasks => this.tasksSignal.set(tasks)),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<any>(this.apiUrl, dto).pipe(
      map(response => this.mapTask(response?.data || response)),
      tap(task => this.tasksSignal.update(tasks => [task, ...tasks])),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.patch<any>(`${this.apiUrl}/${id}`, dto).pipe(
      map(response => this.mapTask(response?.data || response)),
      tap(updatedTask => {
        this.tasksSignal.update(tasks =>
          tasks.map(task => task.id === id ? updatedTask : task)
        );
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  toggleTaskStatus(id: string): Observable<Task> {
    const task = this.tasksSignal().find(t => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    return this.updateTask(id, { completed: !task.completed });
  }

  private mapTask(data: any): Task {
    return {
      id: data.id || data._id || data.uuid,
      title: data.title,
      description: data.description || '',
      completed: data.completed ?? (data.status === 'completed'),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt || data.createdAt),
      userId: data.userId || data.user_id || ''
    };
  }

  deleteTask(id: string): Observable<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.tasksSignal.update(tasks => tasks.filter(task => task.id !== id));
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  clearTasks(): void {
    this.tasksSignal.set([]);
    this.errorSignal.set(null);
  }

  trackByTaskId(_index: number, task: Task): string {
    return task.id;
  }
}
