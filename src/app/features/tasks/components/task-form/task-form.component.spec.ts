import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { TaskFormComponent } from './task-form.component';
import { TaskService } from '@core/services';
import { Task } from '@core/models';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockTask: Task = {
    id: '1',
    title: 'New Task',
    description: 'Description',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1'
  };

  beforeEach(async () => {
    const taskSpy = jasmine.createSpyObj('TaskService', ['createTask']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        TaskFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: TaskService, useValue: taskSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form initially', () => {
    expect(component.taskForm.valid).toBeFalse();
  });

  it('should require title', () => {
    const titleControl = component.taskForm.get('title');
    titleControl?.setValue('');
    expect(titleControl?.hasError('required')).toBeTrue();
  });

  it('should validate title minimum length', () => {
    const titleControl = component.taskForm.get('title');
    titleControl?.setValue('ab');
    expect(titleControl?.hasError('minlength')).toBeTrue();
    
    titleControl?.setValue('abc');
    expect(titleControl?.hasError('minlength')).toBeFalse();
  });

  it('should validate title maximum length', () => {
    const titleControl = component.taskForm.get('title');
    titleControl?.setValue('a'.repeat(101));
    expect(titleControl?.hasError('maxlength')).toBeTrue();
    
    titleControl?.setValue('a'.repeat(100));
    expect(titleControl?.hasError('maxlength')).toBeFalse();
  });

  it('should validate description maximum length', () => {
    const descControl = component.taskForm.get('description');
    descControl?.setValue('a'.repeat(501));
    expect(descControl?.hasError('maxlength')).toBeTrue();
    
    descControl?.setValue('a'.repeat(500));
    expect(descControl?.hasError('maxlength')).toBeFalse();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it('should create task on valid submit', () => {
    component.taskForm.get('title')?.setValue('Test Task');
    component.taskForm.get('description')?.setValue('Test Description');
    taskService.createTask.and.returnValue(of(mockTask));

    component.onSubmit();

    expect(taskService.createTask).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description'
    });
  });

  it('should handle create failure', () => {
    component.taskForm.get('title')?.setValue('Test Task');
    taskService.createTask.and.returnValue(throwError(() => new Error('Failed')));

    component.onSubmit();

    expect(taskService.createTask).toHaveBeenCalled();
  });

  it('should trim whitespace from title and description', fakeAsync(() => {
    component.taskForm.get('title')?.setValue('  Test Task  ');
    component.taskForm.get('description')?.setValue('  Description  ');
    taskService.createTask.and.returnValue(of(mockTask));

    component.onSubmit();
    tick();

    expect(taskService.createTask).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Description'
    });
  }));
});
