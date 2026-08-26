import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '@environments/environment';
import { Task, CreateTaskDto, UpdateTaskDto } from '@core/models';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      userId: 'user1'
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      userId: 'user1'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTasks', () => {
    it('should load tasks and update signal', () => {
      service.loadTasks().subscribe(tasks => {
        expect(tasks).toEqual(mockTasks);
        expect(service.tasks()).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });

    it('should set loading to true while loading', () => {
      expect(service.loading()).toBeFalse();

      service.loadTasks().subscribe();

      expect(service.loading()).toBeTrue();

      const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
      req.flush(mockTasks);

      expect(service.loading()).toBeFalse();
    });
  });

  describe('createTask', () => {
    it('should create task and add to list', () => {
      const newTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description'
      };

      const createdTask: Task = {
        id: '3',
        ...newTaskDto,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      service.createTask(newTaskDto).subscribe(task => {
        expect(task).toEqual(createdTask);
        expect(service.tasks()).toContain(createdTask);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTaskDto);
      req.flush(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update task in list', () => {
      service.loadTasks().subscribe();
      httpMock.expectOne(`${environment.apiUrl}/tasks`).flush(mockTasks);

      const updateDto: UpdateTaskDto = { title: 'Updated Title' };
      const updatedTask: Task = { ...mockTasks[0], title: 'Updated Title' };

      service.updateTask('1', updateDto).subscribe(task => {
        expect(task.title).toBe('Updated Title');
        const found = service.tasks().find(t => t.id === '1');
        expect(found?.title).toBe('Updated Title');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should remove task from list', () => {
      service.loadTasks().subscribe();
      httpMock.expectOne(`${environment.apiUrl}/tasks`).flush(mockTasks);

      expect(service.tasks().length).toBe(2);

      service.deleteTask('1').subscribe(() => {
        expect(service.tasks().length).toBe(1);
        expect(service.tasks().find(t => t.id === '1')).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      service.loadTasks().subscribe();
      httpMock.expectOne(`${environment.apiUrl}/tasks`).flush(mockTasks);
    });

    it('should return sorted tasks by creation date (newest first)', () => {
      const sorted = service.sortedTasks();
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });

    it('should return pending tasks', () => {
      const pending = service.pendingTasks();
      expect(pending.length).toBe(1);
      expect(pending[0].completed).toBeFalse();
    });

    it('should return completed tasks', () => {
      const completed = service.completedTasks();
      expect(completed.length).toBe(1);
      expect(completed[0].completed).toBeTrue();
    });
  });

  describe('clearTasks', () => {
    it('should clear all tasks', () => {
      service.loadTasks().subscribe();
      httpMock.expectOne(`${environment.apiUrl}/tasks`).flush(mockTasks);

      expect(service.tasks().length).toBe(2);

      service.clearTasks();

      expect(service.tasks().length).toBe(0);
    });
  });

  describe('trackByTaskId', () => {
    it('should return task id', () => {
      const result = service.trackByTaskId(0, mockTasks[0]);
      expect(result).toBe('1');
    });
  });
});
