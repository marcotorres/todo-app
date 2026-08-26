import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, noAuthGuard } from './auth.guard';
import { AuthService } from '@core/services';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('Auth Guards', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy('isAuthenticated')
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;
  });

  describe('authGuard', () => {
    it('should allow access when authenticated', () => {
      (Object.getOwnPropertyDescriptor(authService, 'isAuthenticated')?.get as jasmine.Spy).and.returnValue(() => true);
      
      TestBed.runInInjectionContext(() => {
        const result = authGuard(mockRoute, mockState);
        expect(result).toBeTrue();
      });
    });

    it('should redirect to login when not authenticated', () => {
      (Object.getOwnPropertyDescriptor(authService, 'isAuthenticated')?.get as jasmine.Spy).and.returnValue(() => false);
      
      TestBed.runInInjectionContext(() => {
        const result = authGuard(mockRoute, mockState);
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      });
    });
  });

  describe('noAuthGuard', () => {
    it('should allow access when not authenticated', () => {
      (Object.getOwnPropertyDescriptor(authService, 'isAuthenticated')?.get as jasmine.Spy).and.returnValue(() => false);
      
      TestBed.runInInjectionContext(() => {
        const result = noAuthGuard(mockRoute, mockState);
        expect(result).toBeTrue();
      });
    });

    it('should redirect to tasks when authenticated', () => {
      (Object.getOwnPropertyDescriptor(authService, 'isAuthenticated')?.get as jasmine.Spy).and.returnValue(() => true);
      
      TestBed.runInInjectionContext(() => {
        const result = noAuthGuard(mockRoute, mockState);
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
      });
    });
  });
});
