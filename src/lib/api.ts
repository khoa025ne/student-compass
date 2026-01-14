import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  GoogleLoginRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  AuthMeResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseClass,
  CreateClassRequest,
  UpdateClassRequest,
  Semester,
  AvailableClass,
  EnrollmentRequest,
  EnrollmentResponse,
  MyEnrollment,
  TransferRequest,
  CreateTransferRequest,
  TranscriptResponse,
  CreateGradeRequest,
  UpdateGradeRequest,
  Notification,
  CreateNotificationRequest,
  AIAdviceResponse,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7280/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - attach JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401/403 and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };
        
        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('auth_token', response.token);
              localStorage.setItem('refresh_token', response.refreshToken);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.token}`;
              }
              return this.client(originalRequest);
            } catch {
              // Refresh failed, clear auth and redirect
              this.clearAuthData();
              window.location.href = '/login';
            }
          } else {
            this.clearAuthData();
            window.location.href = '/login';
          }
        }
        
        if (error.response?.status === 403) {
          // Forbidden - user doesn't have permission
          console.error('Permission denied');
        }
        
        return Promise.reject(error);
      }
    );
  }

  private clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
  }

  // ============ AUTH APIs ============
  
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.client.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  async googleLogin(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/google-login', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await this.client.post<ChangePasswordResponse>('/auth/change-password', data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/refresh-token', refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearAuthData();
  }

  async getMe(): Promise<AuthMeResponse> {
    const response = await this.client.get<AuthMeResponse>('/auth/me');
    return response.data;
  }

  // ============ USERS APIs (Admin Only) ============

  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/users');
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async getUsersByRole(roleId: number): Promise<User[]> {
    const response = await this.client.get<User[]>(`/users/by-role/${roleId}`);
    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.client.post<User>('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await this.client.put<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<{ message: string; success: boolean }> {
    const response = await this.client.delete<{ message: string; success: boolean }>(`/users/${id}`);
    return response.data;
  }

  async updateUserRole(id: number, data: UpdateUserRoleRequest): Promise<{ message: string; success: boolean }> {
    const response = await this.client.put<{ message: string; success: boolean }>(`/users/${id}/role`, data);
    return response.data;
  }

  // ============ STUDENTS APIs ============

  async getStudents(): Promise<Student[]> {
    const response = await this.client.get<Student[]>('/students');
    return response.data;
  }

  async getStudentById(id: number): Promise<Student> {
    const response = await this.client.get<Student>(`/students/${id}`);
    return response.data;
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    const response = await this.client.post<Student>('/students', data);
    return response.data;
  }

  async updateStudent(id: number, data: UpdateStudentRequest): Promise<Student> {
    const response = await this.client.put<Student>(`/students/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: number): Promise<void> {
    await this.client.delete(`/students/${id}`);
  }

  // ============ COURSES APIs ============

  async getCourses(): Promise<Course[]> {
    const response = await this.client.get<Course[]>('/courses');
    return response.data;
  }

  async getCourseById(id: number): Promise<Course> {
    const response = await this.client.get<Course>(`/courses/${id}`);
    return response.data;
  }

  async createCourse(data: CreateCourseRequest): Promise<Course> {
    const response = await this.client.post<Course>('/courses', data);
    return response.data;
  }

  async updateCourse(id: number, data: UpdateCourseRequest): Promise<Course> {
    const response = await this.client.put<Course>(`/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await this.client.delete(`/courses/${id}`);
  }

  // ============ CLASSES APIs ============

  async getClasses(): Promise<CourseClass[]> {
    const response = await this.client.get<CourseClass[]>('/classes');
    return response.data;
  }

  async getClassById(id: number): Promise<CourseClass> {
    const response = await this.client.get<CourseClass>(`/classes/${id}`);
    return response.data;
  }

  async createClass(data: CreateClassRequest): Promise<CourseClass> {
    const response = await this.client.post<CourseClass>('/classes', data);
    return response.data;
  }

  async updateClass(id: number, data: UpdateClassRequest): Promise<CourseClass> {
    const response = await this.client.put<CourseClass>(`/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: number): Promise<void> {
    await this.client.delete(`/classes/${id}`);
  }

  // ============ ENROLLMENTS APIs ============

  async enroll(data: EnrollmentRequest): Promise<EnrollmentResponse> {
    const response = await this.client.post<EnrollmentResponse>('/enrollments', data);
    return response.data;
  }

  async getEnrollments(): Promise<MyEnrollment[]> {
    const response = await this.client.get<MyEnrollment[]>('/enrollments');
    return response.data;
  }

  async cancelEnrollment(id: number): Promise<void> {
    await this.client.delete(`/enrollments/${id}`);
  }

  // ============ GRADES APIs ============

  async createGrade(data: CreateGradeRequest): Promise<void> {
    await this.client.post('/grades', data);
  }

  async getGradesByStudentId(studentId: number): Promise<TranscriptResponse> {
    const response = await this.client.get<TranscriptResponse>(`/grades/student/${studentId}`);
    return response.data;
  }

  async updateGrade(id: number, data: UpdateGradeRequest): Promise<void> {
    await this.client.put(`/grades/${id}`, data);
  }

  // ============ SEMESTERS APIs ============

  async getSemesters(): Promise<Semester[]> {
    const response = await this.client.get<Semester[]>('/semesters');
    return response.data;
  }

  async getCurrentSemester(): Promise<Semester> {
    const response = await this.client.get<Semester>('/semesters/current');
    return response.data;
  }

  // ============ NOTIFICATIONS APIs ============

  async sendNotification(data: CreateNotificationRequest): Promise<void> {
    await this.client.post('/notifications', data);
  }

  async getNotifications(): Promise<Notification[]> {
    const response = await this.client.get<Notification[]>('/notifications');
    return response.data;
  }

  // ============ TRANSFER REQUESTS APIs ============

  async getTransferRequests(): Promise<TransferRequest[]> {
    const response = await this.client.get<TransferRequest[]>('/transferrequest');
    return response.data;
  }

  async createTransferRequest(data: CreateTransferRequest): Promise<TransferRequest> {
    const response = await this.client.post<TransferRequest>('/transferrequest', data);
    return response.data;
  }

  // ============ AI ADVISOR APIs ============

  async getAIAdvice(): Promise<AIAdviceResponse> {
    const response = await this.client.get<AIAdviceResponse>('/aiadvisor/get-advice');
    return response.data;
  }

  // ============ LEGACY/COMPATIBILITY APIs ============
  // These may need adjustment based on actual backend implementation

  async getAvailableClasses(semesterId?: number): Promise<AvailableClass[]> {
    const response = await this.client.get<AvailableClass[]>('/enrollment/available-classes', {
      params: semesterId ? { semesterId } : undefined,
    });
    return response.data;
  }

  async getMyEnrollments(): Promise<MyEnrollment[]> {
    const response = await this.client.get<MyEnrollment[]>('/enrollment/my-enrollments');
    return response.data;
  }

  async getMyGrades(): Promise<TranscriptResponse> {
    const response = await this.client.get<TranscriptResponse>('/grade/my-grades');
    return response.data;
  }
}

export const apiClient = new ApiClient();
