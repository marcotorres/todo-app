import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/services';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'setPendingEmail']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form initially', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalse();
  });

  it('should require email', () => {
    const emailControl = component.loginForm.get('email');
    
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTrue();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call login on valid submit', fakeAsync(() => {
    const email = 'test@example.com';
    component.loginForm.get('email')?.setValue(email);
    authService.login.and.returnValue(of({
      user: { id: '1', email, createdAt: new Date() },
      token: 'token'
    }));

    component.onSubmit();
    tick();

    expect(authService.login).toHaveBeenCalledWith({ email });
  }));

  it('should navigate to tasks on successful login', fakeAsync(() => {
    const email = 'test@example.com';
    component.loginForm.get('email')?.setValue(email);
    authService.login.and.returnValue(of({
      user: { id: '1', email, createdAt: new Date() },
      token: 'token'
    }));

    component.onSubmit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  }));

  it('should redirect to register if user not found (404)', fakeAsync(() => {
    const email = 'new@example.com';
    component.loginForm.get('email')?.setValue(email);
    authService.login.and.returnValue(throwError(() => ({ status: 404, message: 'User not found' })));

    component.onSubmit();
    tick();

    expect(authService.setPendingEmail).toHaveBeenCalledWith(email);
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  }));

  it('should handle login failure (non-404)', () => {
    const email = 'test@example.com';
    component.loginForm.get('email')?.setValue(email);
    authService.login.and.returnValue(throwError(() => ({ status: 500, message: 'Server error' })));

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({ email });
    expect(router.navigate).not.toHaveBeenCalledWith(['/tasks']);
  });
});
