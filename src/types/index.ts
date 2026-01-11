// User & Auth Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Student' | 'Teacher' | 'Manager' | 'Admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

// Student Types
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

// Academic Structure Types
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

// Enrollment Types
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

// Transfer Request Types
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

// Grade Types
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

// AI Advisor Types
export interface AIAdviceResponse {
  studentId: number;
  studentName: string;
  cumulativeGPA: number;
  advice: string;
  generatedAt: string;
}

// API Response Types
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
  error: string;
  errorCode: string;
  statusCode: number;
}
