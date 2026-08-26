export type Actions = 'create' | 'read' | 'update' | 'delete' | 'complete' | 'manage';
export type Subjects = 'Task' | 'User' | 'all';

export interface Ability {
  action: Actions;
  subject: Subjects;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  lastname?: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  country?: string;
  role?: string;
  abilities?: Ability[];
  createdAt: Date;
}

export interface UserCredentials {
  email: string;
}

export interface UserRegistration {
  email: string;
  name: string;
  lastname: string;
  phone?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  country?: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  notificationPreferences: NotificationPreferences;
  securityMetadata: SecurityMetadata;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface SecurityMetadata {
  csrfToken: string;
  captchaToken: string;
  timestamp: string;
  ipAddress?: string;
  userAgent: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  isNewUser: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  abilities?: Ability[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginApiData {
  id: string;
  uuid: string;
  email: string;
  name: string;
  lastname: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  notificationPreferences: NotificationPreferences;
  status: string;
  role: string;
  lastActivity: string;
  createdAt: string;
  abilities: Ability[];
  token: string;
  refreshToken?: string;
}
