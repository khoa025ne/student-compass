// ============ ENUMS ============
export enum DayOfWeekPair {
  MonThu = 1, // 2-5
  TueFri = 2, // 3-6
  WedSat = 3  // 4-7
}

export enum TimeSlot {
  Slot1 = 1,
  Slot2 = 2,
  Slot3 = 3,
  Slot4 = 4
}

// ============ USER & AUTH TYPES ============
export interface User {
  userId: number;
  studentId?: number; // StudentId nếu role là Student
  email: string;
  fullName: string;
  phoneNumber?: string;
  roleName: 'Student' | 'Teacher' | 'Manager' | 'Admin';
  roleId: number;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string | null;
  mustChangePassword?: boolean;
  hasGoogleAccount?: boolean;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
  mustChangePassword: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface GoogleLoginRequest {
  googleToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

export interface AuthMeResponse {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  roleId: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  loginWithGoogle: (googleToken: string) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<ChangePasswordResponse>;
  changePasswordByEmail: (data: { email: string; oldPassword: string; newPassword: string; confirmPassword: string }) => Promise<ChangePasswordResponse>;
  refreshTokens: () => Promise<void>;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateAvatar: (file: File) => Promise<{ message: string; avatarUrl: string }>;
}

// ============ STUDENT TYPES ============
export interface Student {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: string;
  classCode?: string;
  overallGPA: number;
  createdAt?: string;
  major?: string;
  avatarUrl?: string;
  currentTermNo?: number;
  isFirstLogin?: boolean;
  userId?: number;
}

export interface CreateStudentRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  major: string;
  classCode: string;
}

export interface UpdateStudentRequest {
  fullName?: string;
  phoneNumber?: string;
  classCode?: string;
  major?: string;
}

// ============ ACADEMIC STRUCTURE TYPES ============
export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface Semester {
  semesterId: number;
  semesterName: string;
  semesterCode: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateSemesterRequest {
  semesterName: string;
  semesterCode: string;
  startDate: string;
  endDate: string;
}

export interface Course {
  courseId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  prerequisiteCourseId?: number | null;
}

export interface CreateCourseRequest {
  courseName: string;
  courseCode: string;
  credits: number;
  prerequisiteCourseId?: number | null;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

export interface CourseClass {
  classId: number;
  className: string;
  classCode?: string;
  courseId: number;
  courseName?: string;
  courseCode?: string;
  semesterId: number;
  semesterName?: string;
  maxCapacity: number;
  currentEnrollment: number;
  room: string;
  schedule?: string;
  dayOfWeekPair: DayOfWeekPair;
  timeSlot: TimeSlot;
  teacherId?: number;
  teacherName?: string;
}

export interface CreateClassRequest {
  classCode: string;
  className: string;
  courseId: number;
  semesterId: number;
  room: string;
  schedule: string;
  maxCapacity: number;
  dayOfWeekPair: DayOfWeekPair;
  timeSlot: TimeSlot;
  teacherId?: number;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {}

// ============ ENROLLMENT TYPES ============
export interface AvailableClass {
  classId: number;
  classCode?: string;
  className: string;
  courseCode: string;
  courseName: string;
  credits: number;
  room: string;
  schedule?: string;
  dayOfWeekPair: DayOfWeekPair;
  timeSlot: TimeSlot;
  currentEnrollment: number;
  maxCapacity: number;
  canRegister: boolean;
  statusText: string;
}

export interface RegisterCourseRequest {
  studentId: number;
  classId: number;
}

export interface ChangeClassRequest {
  studentId: number;
  oldClassId: number;
  newClassId: number;
}

export interface EnrollmentRequest {
  studentId: number;
  classId: number;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
}

export interface MyEnrollment {
  enrollmentId: number;
  studentId: number;
  classId: number;
  className: string;
  courseCode: string;
  courseName: string;
  credits: number;
  room: string;
  schedule?: string;
  dayOfWeekPair: DayOfWeekPair;
  timeSlot: TimeSlot;
  enrollmentDate: string;
  status: string;
  midtermScore?: number | null;
  finalScore?: number | null;
  totalScore?: number | null;
  grade?: string | null;
  isPassed?: boolean;
  attemptNumber?: number;
  semesterName?: string;
}

// ============ SCHEDULE TYPES ============
export interface ScheduleItem {
  enrollmentId: number;
  classId: number;
  className: string;
  room: string;
  schedule?: string;
  dayOfWeekPair: DayOfWeekPair;
  timeSlot: TimeSlot;
  courseCode: string;
  courseName: string;
  semester: string;
}

// ============ TRANSCRIPT TYPES ============
export interface TranscriptCourse {
  courseCode: string;
  courseName: string;
  credits: number;
  score?: number | null;
  grade?: string | null;
  status: string;
}

export interface TranscriptSemester {
  semester: string;
  courses: TranscriptCourse[];
  semesterGPA: number;
}

export interface TranscriptResponse {
  studentCode: string;
  fullName: string;
  overallGPA: number;
  details: TranscriptSemester[];
}

// ============ TRANSFER REQUEST TYPES ============
export interface TransferRequest {
  id: number;
  studentName: string;
  fromClass: string;
  toClass: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface CreateTransferRequest {
  studentId: number;
  oldClassId: number;
  newClassId: number;
}

// ============ GRADE TYPES ============
export interface UpdateGradeRequest {
  enrollmentId: number;
  midtermScore?: number;
  finalScore?: number;
}

// ============ NOTIFICATION TYPES ============
export interface Notification {
  notificationId: number;
  studentId: number;
  title: string;
  message: string;
  type?: 'Info' | 'ScoreUpdate' | 'Warning' | 'Achievement' | 'LearningPath' | 'success' | 'warning' | 'error' | 'info';
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationRequest {
  studentId: number;
  title: string;
  message: string;
}

// ============ AI ADVISOR TYPES ============
export interface AIAdviceResponse {
  analysis: string;
}

// ============ LEARNING PATH TYPES ============
export interface RecommendedCourse {
  courseCode: string;
  courseName: string;
  credits: number;
  priority: number;
  reason: string;
}

export interface LearningPathRecommendation {
  recommendationId: number;
  studentId: number;
  semesterId: number;
  semesterCode?: string;
  recommendationDate: string;
  recommendedCourses: {
    recommendedCourses: RecommendedCourse[];
    overallStrategy: string;
    warnings: string[];
  } | string;
  overallStrategy: string;
  aiModelUsed: string;
  isViewed: boolean;
}

export interface GenerateLearningPathRequest {
  studentId: number;
  semesterId?: number;
}

// ============ ACADEMIC WARNING TYPES ============
export interface AcademicWarning {
  warningType: string;
  title: string;
  description: string;
  severity: 'Critical' | 'Warning' | 'Info';
  detectedAt: string;
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errorCode?: string;
  statusCode?: number;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errorCode?: string;
  statusCode?: number;
}

// ============ USER MANAGEMENT TYPES (ADMIN) ============
export interface CreateUserRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  roleId: number;
}

export interface UpdateUserRequest {
  fullName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UpdateUserRoleRequest {
  userId: number;
  newRoleId: number;
}
