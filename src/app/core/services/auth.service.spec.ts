import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { AbilityService } from './ability.service';
import { environment } from '@environments/environment';
import { User, LoginResponse, Ability } from '@core/models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storageService: jasmine.SpyObj<StorageService>;
  let abilityService: jasmine.SpyObj<AbilityService>;

  const mockAbilities: Ability[] = [
    { action: 'read', subject: 'Task' },
    { action: 'create', subject: 'Task' }
  ];

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test',
    lastname: 'User',
    role: 'user',
    abilities: mockAbilities,
    createdAt: new Date()
  };

  const mockLoginApiResponse = {
    success: true,
    data: {
      id: '1',
      uuid: 'uuid-123',
      email: 'test@example.com',
      name: 'Test',
      lastname: 'User',
      termsAccepted: true,
      privacyPolicyAccepted: true,
      notificationPreferences: { email: true, sms: false, push: true },
      status: 'active',
      role: 'user',
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      abilities: mockAbilities,
      token: 'test-token-123',
      refreshToken: 'refresh-token-123'
    }
  };

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'setToken', 'getToken', 'removeToken',
      'setUser', 'getUser', 'removeUser', 'clear',
      'setRefreshToken'
    ]);
    storageSpy.getUser.and.returnValue(null);

    const abilitySpy = jasmine.createSpyObj('AbilityService', [
      'updateAbilities', 'clearAbilities', 'loadFromStorage'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: StorageService, useValue: storageSpy },
        { provide: AbilityService, useValue: abilitySpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    abilityService = TestBed.inject(AbilityService) as jasmine.SpyObj<AbilityService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login and store credentials', () => {
      const credentials = { email: 'test@example.com' };

      service.login(credentials).subscribe((response: LoginResponse) => {
        expect(response.user.email).toBe('test@example.com');
        expect(response.token).toBe('test-token-123');
        expect(storageService.setToken).toHaveBeenCalledWith('test-token-123');
        expect(storageService.setUser).toHaveBeenCalled();
        expect(abilityService.updateAbilities).toHaveBeenCalledWith(mockAbilities);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockLoginApiResponse);
    });
  });

  describe('logout', () => {
    it('should clear storage and reset user', () => {
      service.logout();

      expect(storageService.clear).toHaveBeenCalled();
      expect(abilityService.clearAbilities).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
