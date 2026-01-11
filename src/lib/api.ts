import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  Department,
  Semester,
  Course,
  CourseClass,
  AvailableClass,
  EnrollmentRequest,
  EnrollmentResponse,
  MyEnrollment,
  TransferRequest,
  CreateTransferRequest,
  TranscriptResponse,
  AIAdviceResponse,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com/api';

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

    // Response interceptor - handle 401/403
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    const response = await this.client.get<Department[]>('/department');
    return response.data;
  }

  // Semesters
  async getSemesters(): Promise<Semester[]> {
    const response = await this.client.get<Semester[]>('/semester');
    return response.data;
  }

  async getActiveSemester(): Promise<Semester | undefined> {
    const semesters = await this.getSemesters();
    return semesters.find((s) => s.isActive);
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    const response = await this.client.get<Course[]>('/course');
    return response.data;
  }

  // Course Classes
  async getCourseClasses(semesterId: number): Promise<CourseClass[]> {
    const response = await this.client.get<CourseClass[]>('/courseclass', {
      params: { semesterId },
    });
    return response.data;
  }

  // Enrollment
  async getAvailableClasses(semesterId: number): Promise<AvailableClass[]> {
    const response = await this.client.get<AvailableClass[]>('/enrollment/available-classes', {
      params: { semesterId },
    });
    return response.data;
  }

  async enroll(data: EnrollmentRequest): Promise<EnrollmentResponse> {
    const response = await this.client.post<EnrollmentResponse>('/enrollment/enroll', data);
    return response.data;
  }

  async getMyEnrollments(): Promise<MyEnrollment[]> {
    const response = await this.client.get<MyEnrollment[]>('/enrollment/my-enrollments');
    return response.data;
  }

  // Transfer Requests
  async getTransferRequests(): Promise<TransferRequest[]> {
    const response = await this.client.get<TransferRequest[]>('/transferrequest');
    return response.data;
  }

  async createTransferRequest(data: CreateTransferRequest): Promise<TransferRequest> {
    const response = await this.client.post<TransferRequest>('/transferrequest', data);
    return response.data;
  }

  // Grades
  async getMyGrades(): Promise<TranscriptResponse> {
    const response = await this.client.get<TranscriptResponse>('/grade/my-grades');
    return response.data;
  }

  // AI Advisor
  async getAIAdvice(): Promise<AIAdviceResponse> {
    const response = await this.client.get<AIAdviceResponse>('/aiadvisor/get-advice');
    return response.data;
  }
}

export const apiClient = new ApiClient();
