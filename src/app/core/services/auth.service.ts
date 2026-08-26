import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, of, map, throwError } from 'rxjs';
import { environment } from '@environments/environment';
import { User, UserCredentials, AuthResponse, UserRegistration, LoginResponse, ApiResponse, LoginApiData, Ability } from '@core/models';
import { StorageService } from './storage.service';
import { AbilityService } from './ability.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly abilityService = inject(AbilityService);
  private readonly apiUrl = environment.apiUrl;

  private readonly currentUserSignal = signal<User | null>(this.storage.getUser<User>());
  private pendingEmail = signal<string | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  setPendingEmail(email: string): void {
    this.pendingEmail.set(email);
    sessionStorage.setItem('pending_registration_email', email);
  }

  getPendingEmail(): string | null {
    return this.pendingEmail() || sessionStorage.getItem('pending_registration_email');
  }

  clearPendingEmail(): void {
    this.pendingEmail.set(null);
    sessionStorage.removeItem('pending_registration_email');
  }

  login(credentials: UserCredentials): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginApiData>>(`${this.apiUrl}/users/login`, credentials).pipe(
      map(response => {
        const data = response.data;
        const user: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          lastname: data.lastname,
          role: data.role,
          abilities: data.abilities,
          createdAt: new Date(data.createdAt)
        };
        return { user, token: data.token, refreshToken: data.refreshToken, abilities: data.abilities };
      }),
      tap(response => this.handleLoginSuccess(response)),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return throwError(() => ({ status: 404, message: 'User not found' }));
        }
        return throwError(() => ({ status: error.status, message: error.error?.message || 'Login failed' }));
      })
    );
  }

  register(userData: UserRegistration): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginApiData>>(`${this.apiUrl}/users`, userData).pipe(
      map(response => {
        const data = response.data;
        const user: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          lastname: data.lastname,
          role: data.role,
          abilities: data.abilities,
          createdAt: new Date(data.createdAt)
        };
        return { user, token: data.token, refreshToken: data.refreshToken, abilities: data.abilities };
      }),
      tap(response => this.handleLoginSuccess(response))
    );
  }

  logout(): void {
    this.storage.clear();
    this.currentUserSignal.set(null);
    this.abilityService.clearAbilities();
    this.clearPendingEmail();
  }

  updateProfile(data: { name?: string; lastname?: string; phone?: string }): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}/users`, data).pipe(
      map(response => response.data),
      tap(updatedUser => {
        const currentUser = this.currentUserSignal();
        if (currentUser) {
          const mergedUser = { ...currentUser, ...updatedUser };
          this.storage.setUser(mergedUser);
          this.currentUserSignal.set(mergedUser);
        }
      })
    );
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return of(false);
    }

    return this.http.post<ApiResponse<{ token: string; refreshToken: string }>>(`${this.apiUrl}/users/refresh`, { refreshToken }).pipe(
      tap(response => {
        this.storage.setToken(response.data.token);
        this.storage.setRefreshToken(response.data.refreshToken);
      }),
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  private handleLoginSuccess(response: LoginResponse): void {
    this.storage.setToken(response.token);
    if (response.refreshToken) {
      this.storage.setRefreshToken(response.refreshToken);
    }
    this.storage.setUser(response.user);
    this.currentUserSignal.set(response.user);
    if (response.abilities) {
      this.abilityService.updateAbilities(response.abilities);
    }
    this.clearPendingEmail();
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.storage.setToken(response.token);
    this.storage.setUser(response.user);
    this.currentUserSignal.set(response.user);
  }
}
