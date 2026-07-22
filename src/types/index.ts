export type UserRole = 'ESTUDANTE' | 'EXPLICADOR' | 'COORDENADOR' | 'ADMIN';
export type UserStatus = 'active' | 'pending' | 'inactive';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';
export type EnrollmentStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type PaymentMethod = 'MPESA' | 'EMOLA' | 'TRANSFERENCIA';

export interface Profile {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  university?: string;
  course?: string;
  year_of_study?: number;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  name: string;
  department?: string;
  university?: string;
  description?: string;
  price_monthly?: number;
  price_per_lesson?: number;
  max_tutors: number;
  youtube_playlist_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CourseTutor {
  id: string;
  course_id: string;
  tutor_id: string;
  topics?: string[];
  is_active: boolean;
  assigned_at?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  student_id: string;
  course_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proof_url?: string;
  confirmed_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  topic?: string;
  description?: string;
  youtube_link?: string;
  duration?: number;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Material {
  id: string;
  lesson_id?: string;
  course_id: string;
  title: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  storage_provider?: 'EXTERNAL' | 'R2';
  object_key?: string;
  access_level?: 'FREE' | 'PREMIUM';
  mime_type?: string;
  original_name?: string;
  uploaded_by: string;
  created_at?: string;
}

export interface LessonCompletion {
  id: string;
  student_id: string;
  lesson_id: string;
  progress_percent: number;
  watched_duration?: number;
  completed_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  metadata?: any;
  created_at?: string;
}

export interface Analytic {
  id: string;
  metric_type: string;
  metric_value: number;
  recorded_at?: string;
}

// UI-specific wrapper for Chat interface that might combine messages/profiles
export interface Chat {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
