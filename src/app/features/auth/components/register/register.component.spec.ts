import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '@core/services';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'getPendingEmail',
      'clearPendingEmail',
      'register'
    ]);
    authSpy.getPendingEmail.and.returnValue('test@example.com');

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have email pre-filled from pending email', () => {
    expect(component.registerForm.get('email')?.value).toBe('test@example.com');
  });

  it('should have email field disabled', () => {
    expect(component.registerForm.get('email')?.disabled).toBeTrue();
  });

  it('should have an invalid form initially', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should require name', () => {
    const nameControl = component.registerForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBeTrue();
  });

  it('should require lastname', () => {
    const lastnameControl = component.registerForm.get('lastname');
    lastnameControl?.setValue('');
    expect(lastnameControl?.hasError('required')).toBeTrue();
  });

  it('should require terms acceptance', () => {
    const termsControl = component.registerForm.get('termsAccepted');
    termsControl?.setValue(false);
    expect(termsControl?.hasError('required')).toBeTrue();
  });

  it('should require privacy policy acceptance', () => {
    const privacyControl = component.registerForm.get('privacyPolicyAccepted');
    privacyControl?.setValue(false);
    expect(privacyControl?.hasError('required')).toBeTrue();
  });

  it('should validate phone format', () => {
    const phoneControl = component.registerForm.get('phone');
    
    phoneControl?.setValue('invalid');
    expect(phoneControl?.hasError('pattern')).toBeTrue();
    
    phoneControl?.setValue('+1234567890');
    expect(phoneControl?.hasError('pattern')).toBeFalse();
  });

  it('should validate name minimum length', () => {
    const nameControl = component.registerForm.get('name');
    nameControl?.setValue('A');
    expect(nameControl?.hasError('minlength')).toBeTrue();
  });

  it('should not submit if form is invalid', async () => {
    await component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should have loading signal initially false', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should have countries list available', () => {
    expect(component.countries.length).toBeGreaterThan(0);
  });

  it('should have valid form when all required fields are filled', () => {
    component.registerForm.patchValue({
      name: 'John',
      lastname: 'Doe',
      termsAccepted: true,
      privacyPolicyAccepted: true
    });

    expect(component.registerForm.valid).toBeTrue();
  });

  it('should redirect to login if no pending email', () => {
    authService.getPendingEmail.and.returnValue(null);
    
    component.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should clear pending email and navigate to login on goBack', () => {
    component.goBack();
    
    expect(authService.clearPendingEmail).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should have gender options available', () => {
    expect(component.genderOptions.length).toBe(4);
    expect(component.genderOptions.find(o => o.value === 'prefer_not_to_say')).toBeTruthy();
  });

  it('should have countries list available', () => {
    expect(component.countries.length).toBeGreaterThan(0);
  });
});
