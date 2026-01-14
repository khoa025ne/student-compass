// ============ USER & AUTH TYPES ============
export interface User {
  userId: number;
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
  refreshTokens: () => Promise<void>;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

// ============ STUDENT TYPES ============
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  classId: number;
  enrollmentDate: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  classId: number;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  status?: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
}

// ============ ACADEMIC STRUCTURE TYPES ============
export interface Department {
  id: number;
  code: string;
  name: string;
}

export interface Semester {
  id: number;
  code: string;
  year: number;
  term: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  departmentId: number;
  departmentName: string;
  prerequisiteId: number | null;
  prerequisiteCode: string | null;
}

export interface CreateCourseRequest {
  code: string;
  name: string;
  description: string;
  credits: number;
  departmentId: number;
  prerequisiteId?: number | null;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

export interface CourseClass {
  id: number;
  code: string;
  courseName: string;
  maxCapacity: number;
  currentEnrollment: number;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  teacherName: string;
  semesterCode: string;
  enrollmentPercentage: number;
}

export interface CreateClassRequest {
  code: string;
  courseId: number;
  semesterId: number;
  maxCapacity: number;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  teacherId: number;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {}

// ============ ENROLLMENT TYPES ============
export interface AvailableClass {
  courseClassId: number;
  classCode: string;
  courseName: string;
  credits: number;
  availableSlots: number;
  maxCapacity: number;
  schedule: string;
  room: string;
  teacherName: string;
  prerequisiteMet: boolean;
  prerequisiteCode: string | null;
}

export interface EnrollmentRequest {
  courseClassId: number;
}

export interface EnrollmentResponse {
  success: boolean;
  enrollmentId?: number;
  message?: string;
  courseClass?: {
    code: string;
    courseName: string;
    schedule: string;
    credits: number;
  };
  error?: string;
  errorCode?: string;
  conflictingClass?: {
    code: string;
    courseName: string;
    schedule: string;
  };
  currentEnrollment?: number;
  maxCapacity?: number;
  requiredCourse?: string;
  statusCode?: number;
}

export interface MyEnrollment {
  enrollmentId: number;
  courseCode: string;
  courseName: string;
  credits: number;
  classCode: string;
  schedule: string;
  room: string;
  teacherName: string;
  status: 'Active' | 'Completed' | 'Dropped';
  currentGrade: string | null;
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
  fromCourseClassId: number;
  toCourseClassId: number;
}

// ============ GRADE TYPES ============
export interface CourseGrade {
  courseCode: string;
  courseName: string;
  credits: number;
  classCode: string;
  participation: number;
  quiz: number;
  assignment: number;
  midterm: number;
  final: number;
  finalScore: number;
  letterGrade: string;
  isOfficial: boolean;
}

export interface TranscriptResponse {
  studentName: string;
  cumulativeGPA: number;
  currentSemester: string;
  courses: CourseGrade[];
}

export interface CreateGradeRequest {
  studentId: number;
  courseClassId: number;
  participation?: number;
  quiz?: number;
  assignment?: number;
  midterm?: number;
  final?: number;
}

export interface UpdateGradeRequest extends Partial<CreateGradeRequest> {}

// ============ NOTIFICATION TYPES ============
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
  userId: number;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  userId?: number;
}

// ============ AI ADVISOR TYPES ============
export interface AIAdviceResponse {
  studentId: number;
  studentName: string;
  cumulativeGPA: number;
  advice: string;
  generatedAt: string;
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
