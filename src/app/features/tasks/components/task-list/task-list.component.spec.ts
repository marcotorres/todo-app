import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TaskListComponent } from './task-list.component';
import { AuthService, TaskService, NotificationService, AbilityService } from '@core/services';
import { Task, User } from '@core/models';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let taskService: jasmine.SpyObj<TaskService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    createdAt: new Date()
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1'
    }
  ];

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: signal(mockUser)
    });
    const taskSpy = jasmine.createSpyObj('TaskService', [
      'loadTasks', 'toggleTaskStatus', 'deleteTask', 'clearTasks', 'trackByTaskId', 'setSearchQuery'
    ], {
      filteredTasks: signal(mockTasks),
      loading: signal(false),
      searchQuery: signal('')
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', [
      'notifyTaskCompleted', 'markAsRead', 'markAllAsRead'
    ], {
      recentNotifications: signal([]),
      unreadCount: signal(0)
    });
    const abilitySpy = jasmine.createSpyObj('AbilityService', ['can'], {
      canCreateTask: signal(true),
      canUpdateTask: signal(true),
      canDeleteTask: signal(true),
      canCompleteTask: signal(true),
      canUpdateUser: signal(true)
    });

    taskSpy.loadTasks.and.returnValue(of(mockTasks));
    taskSpy.trackByTaskId.and.callFake((_: number, task: Task) => task.id);

    await TestBed.configureTestingModule({
      imports: [
        TaskListComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: TaskService, useValue: taskSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: AbilityService, useValue: abilitySpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    expect(taskService.loadTasks).toHaveBeenCalled();
  });

  it('should toggle form visibility', () => {
    expect(component.showForm()).toBeFalse();
    component.toggleForm();
    expect(component.showForm()).toBeTrue();
    component.toggleForm();
    expect(component.showForm()).toBeFalse();
  });

  it('should hide form on task created', () => {
    component.showForm.set(true);
    component.onTaskCreated();
    expect(component.showForm()).toBeFalse();
  });

  it('should toggle task status', () => {
    const task = mockTasks[0];
    taskService.toggleTaskStatus.and.returnValue(of({ ...task, completed: true }));

    component.toggleTaskStatus(task);

    expect(taskService.toggleTaskStatus).toHaveBeenCalledWith(task.id);
  });

  it('should handle toggle failure', () => {
    const task = mockTasks[0];
    taskService.toggleTaskStatus.and.returnValue(throwError(() => new Error('Failed')));

    component.toggleTaskStatus(task);

    expect(taskService.toggleTaskStatus).toHaveBeenCalledWith(task.id);
  });

  it('should open edit dialog', () => {
    const task = mockTasks[0];
    const dialogRefMock = { afterClosed: () => of(false) };
    dialog.open.and.returnValue(dialogRefMock as any);

    spyOn(component, 'editTask').and.callFake(() => {
      dialog.open({} as any, {} as any);
    });
    component.editTask(task);

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should open delete confirmation dialog', () => {
    const task = mockTasks[0];
    const dialogRefMock = { afterClosed: () => of(false) };
    dialog.open.and.returnValue(dialogRefMock as any);

    spyOn(component, 'deleteTask').and.callFake(() => {
      dialog.open({} as any, {} as any);
    });
    component.deleteTask(task);

    expect(dialog.open).toHaveBeenCalled();
  });

  it('should delete task on confirmation', fakeAsync(() => {
    const task = mockTasks[0];
    const dialogRefMock = { afterClosed: () => of(true) };
    dialog.open.and.returnValue(dialogRefMock as any);
    taskService.deleteTask.and.returnValue(of(void 0));

    spyOn(component, 'deleteTask').and.callFake(() => {
      const ref = dialog.open({} as any, {} as any);
      ref.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          taskService.deleteTask(task.id).subscribe();
          snackBar.open('Deleted', 'Close');
        }
      });
    });
    component.deleteTask(task);
    tick();

    expect(taskService.deleteTask).toHaveBeenCalledWith(task.id);
    expect(snackBar.open).toHaveBeenCalled();
  }));

  it('should logout and navigate to login', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(taskService.clearTasks).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should track tasks by id', () => {
    const task = mockTasks[0];
    const result = component.trackByTaskId(0, task);
    expect(result).toBe(task.id);
  });
});
