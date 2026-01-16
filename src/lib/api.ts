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
  CourseClass,
  CreateClassRequest,
  Semester,
  CreateSemesterRequest,
  AvailableClass,
  RegisterCourseRequest,
  ChangeClassRequest,
  EnrollmentResponse,
  MyEnrollment,
  ScheduleItem,
  TranscriptResponse,
  UpdateGradeRequest,
  Notification,
  AIAdviceResponse,
  TransferRequest,
  CreateTransferRequest,
  LearningPathRecommendation,
  AcademicWarning,
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

  async changePasswordByEmail(data: { email: string; oldPassword: string; newPassword: string; confirmPassword: string }): Promise<ChangePasswordResponse> {
    const response = await this.client.post<ChangePasswordResponse>('/auth/change-password-by-email', data);
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

  async uploadAvatar(file: File): Promise<{ message: string; avatarUrl: string; user: User }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post<{ message: string; avatarUrl: string; user: User }>(
      '/auth/upload-avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
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

  async getStudents(filters?: { major?: string; termNo?: number }): Promise<Student[]> {
    const response = await this.client.get<Student[]>('/students', { params: filters });
    return response.data;
  }

  async getStudentById(id: number): Promise<Student> {
    const response = await this.client.get<Student>(`/students/${id}`);
    return response.data;
  }

  async getStudentByCode(studentCode: string): Promise<Student> {
    const response = await this.client.get<Student>(`/students/by-code/${studentCode}`);
    return response.data;
  }

  async getStudentsByMajor(major: string): Promise<Student[]> {
    const response = await this.client.get<Student[]>(`/students/by-major/${major}`);
    return response.data;
  }

  async getStudentsByTerm(termNo: number): Promise<Student[]> {
    const response = await this.client.get<Student[]>(`/students/by-term/${termNo}`);
    return response.data;
  }

  async getStudentsByClass(classCode: string): Promise<Student[]> {
    const response = await this.client.get<Student[]>(`/students/by-class/${classCode}`);
    return response.data;
  }

  async createStudent(data: CreateStudentRequest): Promise<{ message: string; studentCode: string; defaultPassword: string }> {
    const response = await this.client.post<{ message: string; studentCode: string; defaultPassword: string }>('/students', data);
    return response.data;
  }

  async updateStudent(id: number, data: UpdateStudentRequest): Promise<Student> {
    const response = await this.client.put<Student>(`/students/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: number): Promise<void> {
    await this.client.delete(`/students/${id}`);
  }

  async uploadStudentAvatar(studentId: number, file: File): Promise<{ url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post<{ url: string; message: string }>(
      `/students/upload-avatar/${studentId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  async getStudentSchedule(studentId: number, semesterId?: number): Promise<ScheduleItem[]> {
    const response = await this.client.get<ScheduleItem[]>(`/students/${studentId}/schedule`, {
      params: semesterId ? { semesterId } : undefined,
    });
    return response.data;
  }

  async getStudentTranscript(studentId: number): Promise<TranscriptResponse> {
    const response = await this.client.get<TranscriptResponse>(`/students/${studentId}/transcript`);
    return response.data;
  }

  async getStudentAIAnalysis(studentId: number): Promise<AIAdviceResponse> {
    const response = await this.client.get<AIAdviceResponse>(`/students/${studentId}/ai-analysis`);
    return response.data;
  }

  // ============ COURSES APIs ============

  async getCourses(major?: string): Promise<Course[]> {
    const response = await this.client.get<Course[]>('/courses', { params: major ? { major } : undefined });
    return response.data;
  }

  async getCourseById(id: number): Promise<Course> {
    const response = await this.client.get<Course>(`/courses/${id}`);
    return response.data;
  }

  async getCourseByCode(courseCode: string): Promise<Course> {
    const response = await this.client.get<Course>(`/courses/by-code/${courseCode}`);
    return response.data;
  }

  async getCoursesByMajor(major: string): Promise<Course[]> {
    const response = await this.client.get<Course[]>(`/courses/by-major/${major}`);
    return response.data;
  }

  async createCourse(data: { courseName: string; courseCode: string; credits: number; major?: string; prerequisiteCourseId?: number }): Promise<Course> {
    const response = await this.client.post<Course>('/courses', data);
    return response.data;
  }

  async updateCourse(id: number, data: { courseName?: string; courseCode?: string; credits?: number; major?: string }): Promise<Course> {
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

  async searchClasses(code: string): Promise<CourseClass[]> {
    const response = await this.client.get<CourseClass[]>('/classes/search', { params: { code } });
    return response.data;
  }

  async getClassesBySemester(semesterId: number): Promise<CourseClass[]> {
    const response = await this.client.get<CourseClass[]>(`/classes/semester/${semesterId}`);
    return response.data;
  }

  async getClassesByMajor(major: string): Promise<CourseClass[]> {
    const response = await this.client.get<CourseClass[]>(`/classes/by-major/${major}`);
    return response.data;
  }

  async getClassById(id: number): Promise<CourseClass> {
    const response = await this.client.get<CourseClass>(`/classes/${id}`);
    return response.data;
  }

  async getStudentsInClass(classId: number): Promise<Student[]> {
    const response = await this.client.get<Student[]>(`/classes/${classId}/students`);
    return response.data;
  }

  async createClass(data: CreateClassRequest): Promise<{ message: string; classId: number }> {
    const response = await this.client.post<{ message: string; classId: number }>('/classes', data);
    return response.data;
  }

  async updateClass(id: number, data: Partial<CreateClassRequest>): Promise<CourseClass> {
    const response = await this.client.put<CourseClass>(`/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: number): Promise<void> {
    await this.client.delete(`/classes/${id}`);
  }

  // ============ TRANSFER REQUESTS APIs ============

  async getTransferRequests(): Promise<TransferRequest[]> {
    const response = await this.client.get<TransferRequest[]>('/transfers');
    return response.data;
  }

  async createTransferRequest(data: CreateTransferRequest): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>('/transfers', data);
    return response.data;
  }

  async approveTransferRequest(id: number): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>(`/transfers/${id}/approve`);
    return response.data;
  }

  async rejectTransferRequest(id: number): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>(`/transfers/${id}/reject`);
    return response.data;
  }

  // ============ ENROLLMENTS APIs ============

  async registerCourse(data: RegisterCourseRequest): Promise<EnrollmentResponse> {
    const response = await this.client.post<EnrollmentResponse>('/enrollments/register', data);
    return response.data;
  }

  async changeClass(data: ChangeClassRequest): Promise<EnrollmentResponse> {
    const response = await this.client.post<EnrollmentResponse>('/enrollments/change-class', data);
    return response.data;
  }

  async getMyEnrollments(studentId?: number, semesterId?: number): Promise<MyEnrollment[]> {
    // If no studentId provided, get from current user
    const sid = studentId || this.getCurrentStudentId();
    if (!sid) {
      console.warn('No student ID available for getMyEnrollments');
      return [];
    }
    const schedule = await this.getStudentSchedule(sid, semesterId);
    // Transform schedule items to MyEnrollment format
    return schedule.map(s => ({
      enrollmentId: s.enrollmentId,
      studentId: sid,
      classId: s.classId,
      className: s.className,
      courseCode: s.courseCode,
      courseName: s.courseName,
      credits: 0,
      room: s.room,
      schedule: s.schedule,
      dayOfWeekPair: s.dayOfWeekPair,
      timeSlot: s.timeSlot,
      enrollmentDate: '',
      status: 'Active',
      semesterName: s.semester,
      teacherName: '',
    }));
  }

  // Helper to get current student ID from stored user
  // Ưu tiên studentId (từ bảng Student) thay vì userId (từ bảng User)
  private getCurrentStudentId(): number | null {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Ưu tiên studentId cho Student role, fallback userId
        return user.studentId || user.userId || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  // ============ GRADES APIs ============

  async getMyGrades(studentId?: number): Promise<TranscriptResponse> {
    const sid = studentId || this.getCurrentStudentId();
    if (!sid) {
      console.warn('No student ID available for getMyGrades');
      return { studentCode: '', fullName: '', overallGPA: 0, details: [] };
    }
    return this.getStudentTranscript(sid);
  }

  async updateGrade(data: UpdateGradeRequest): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>('/grades/update', data);
    return response.data;
  }

  async getGradesByStudentId(studentId: number): Promise<TranscriptResponse> {
    return this.getStudentTranscript(studentId);
  }

  // ============ SEMESTERS APIs ============

  async getSemesters(): Promise<Semester[]> {
    const response = await this.client.get<Semester[]>('/semesters');
    return response.data;
  }

  async createSemester(data: CreateSemesterRequest): Promise<{ message: string; semesterId: number }> {
    const response = await this.client.post<{ message: string; semesterId: number }>('/semesters', data);
    return response.data;
  }

  async setActiveSemester(semesterId: number): Promise<{ message: string }> {
    const response = await this.client.put<{ message: string }>(`/semesters/${semesterId}/set-active`);
    return response.data;
  }

  async getCurrentSemester(): Promise<Semester | null> {
    const semesters = await this.getSemesters();
    return semesters.find(s => s.isActive) || null;
  }

  // ============ NOTIFICATIONS APIs ============

  async getNotificationsForStudent(studentId: number): Promise<Notification[]> {
    const response = await this.client.get<Notification[]>(`/notifications/student/${studentId}`);
    return response.data;
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    await this.client.post(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead(studentId: number): Promise<void> {
    await this.client.post(`/notifications/student/${studentId}/read-all`);
  }

  async getUnreadNotificationCount(studentId: number): Promise<number> {
    const response = await this.client.get<{ count: number }>(`/notifications/student/${studentId}/unread-count`);
    return response.data.count;
  }

  // ============ AI ADVISOR APIs ============

  async getAIAdvice(studentId: number): Promise<AIAdviceResponse> {
    return this.getStudentAIAnalysis(studentId);
  }

  // ============ LEARNING PATH APIs ============

  async getLearningPathRecommendation(studentId: number): Promise<LearningPathRecommendation | null> {
    try {
      const response = await this.client.get<{ success: boolean; data: LearningPathRecommendation }>(`/learningpath/student/${studentId}`);
      return response.data.data;
    } catch {
      return null;
    }
  }

  async generateLearningPath(studentId: number, semesterId?: number): Promise<LearningPathRecommendation> {
    const response = await this.client.post<{ success: boolean; data: LearningPathRecommendation }>('/learningpath/generate', {
      studentId,
      semesterId
    });
    return response.data.data;
  }

  async markLearningPathViewed(recommendationId: number): Promise<void> {
    await this.client.post(`/learningpath/${recommendationId}/mark-viewed`);
  }

  // ============ ACADEMIC WARNING APIs ============

  async getAcademicWarnings(studentId: number): Promise<AcademicWarning[]> {
    const response = await this.client.get<{ success: boolean; data: AcademicWarning[] }>(`/learningpath/warnings/${studentId}`);
    return response.data.data;
  }

  async checkWarnings(studentId: number): Promise<void> {
    await this.client.post(`/learningpath/check-warnings/${studentId}`);
  }

  // ============ AVAILABLE CLASSES APIs ============

  async getAvailableClasses(semesterId: number): Promise<AvailableClass[]> {
    const classes = await this.getClassesBySemester(semesterId);
    return classes.map(cls => ({
      classId: cls.classId,
      classCode: cls.classCode,
      className: cls.className,
      courseCode: cls.courseCode || '',
      courseName: cls.courseName || '',
      credits: 0,
      room: cls.room,
      schedule: cls.schedule,
      dayOfWeekPair: cls.dayOfWeekPair,
      timeSlot: cls.timeSlot,
      currentEnrollment: cls.currentEnrollment,
      maxCapacity: cls.maxCapacity,
      canRegister: cls.currentEnrollment < cls.maxCapacity,
      statusText: cls.currentEnrollment >= cls.maxCapacity ? 'Hết chỗ' : 'Còn chỗ',
    }));
  }
}

export const apiClient = new ApiClient();
