import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token management', () => {
    it('should set and get token', () => {
      const token = 'test-token-123';
      service.setToken(token);
      expect(service.getToken()).toBe(token);
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should remove token', () => {
      service.setToken('test-token');
      service.removeToken();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('User management', () => {
    const testUser = { id: '1', email: 'test@example.com' };

    it('should set and get user', () => {
      service.setUser(testUser);
      expect(service.getUser()).toEqual(testUser);
    });

    it('should return null when no user exists', () => {
      expect(service.getUser()).toBeNull();
    });

    it('should remove user', () => {
      service.setUser(testUser);
      service.removeUser();
      expect(service.getUser()).toBeNull();
    });
  });

  describe('Clear', () => {
    it('should clear both token and user', () => {
      service.setToken('test-token');
      service.setUser({ id: '1', email: 'test@example.com' });
      
      service.clear();
      
      expect(service.getToken()).toBeNull();
      expect(service.getUser()).toBeNull();
    });
  });
});
