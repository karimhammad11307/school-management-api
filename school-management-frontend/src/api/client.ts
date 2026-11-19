import {
  ApiErrorResponse,
  AuthResponse,
  ClassItem,
  FullImportReport,
  Student,
  Teacher,
  UploadImportResponse,
  User,
} from '../types';

export class ApiError extends Error {
  statusCode: number;
  errorName: string;
  messages: string[];
  path?: string;
  timestamp?: string;

  constructor(res: ApiErrorResponse) {
    const msgArray = Array.isArray(res.message) ? res.message : [res.message || 'An error occurred'];
    super(msgArray.join('\n'));
    this.name = 'ApiError';
    this.statusCode = res.statusCode || 500;
    this.errorName = res.error || 'Error';
    this.messages = msgArray;
    this.path = res.path;
    this.timestamp = res.timestamp;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorizedCallback = cb;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        statusCode: response.status,
        error: response.statusText,
        message: 'Network request failed',
        path: endpoint,
        timestamp: new Date().toISOString(),
      };
    }
    throw new ApiError(errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request<User>('/auth/me', { method: 'GET' }),
  },
  teachers: {
    list: () => request<Teacher[]>('/teachers', { method: 'GET' }),
    get: (id: string) => request<Teacher>(`/teachers/${id}`, { method: 'GET' }),
    create: (data: { name: string; email: string }) =>
      request<Teacher>('/teachers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name?: string; email?: string }) =>
      request<Teacher>(`/teachers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/teachers/${id}`, {
        method: 'DELETE',
      }),
  },
  classes: {
    list: () => request<ClassItem[]>('/classes', { method: 'GET' }),
    get: (id: string) => request<ClassItem>(`/classes/${id}`, { method: 'GET' }),
    create: (data: { name: string; capacity: number; teacherId: string }) =>
      request<ClassItem>('/classes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name?: string; capacity?: number; teacherId?: string }) =>
      request<ClassItem>(`/classes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/classes/${id}`, {
        method: 'DELETE',
      }),
  },
  students: {
    list: () => request<Student[]>('/students', { method: 'GET' }),
    get: (id: string) => request<Student>(`/students/${id}`, { method: 'GET' }),
    create: (data: { name: string; email: string; classId: string }) =>
      request<Student>('/students', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { name?: string; email?: string; classId?: string }) =>
      request<Student>(`/students/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/students/${id}`, {
        method: 'DELETE',
      }),
  },
  imports: {
    run: (data: { sourceDir?: string; reportName?: string }) =>
      request<FullImportReport>('/imports/run', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    upload: (files: File[]) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files', file);
      }
      return request<UploadImportResponse>('/imports/upload', {
        method: 'POST',
        body: formData,
      });
    },
  },
};
