export interface Cadeira {
  id: string;
  name: string;
  department: string;
  price: number;
  description: string;
  syllabus: string;
  image: string;
  tutorId: string;
  status: "active" | "inactive";
  duration: string;
  level: string;
  progress?: number;
}

export interface Explicador {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  lessonsCount: number;
  earnings: number;
  status: "active" | "pending" | "inactive";
  courses: string[];
}

export interface Utilizador {
  id: string;
  name: string;
  email: string;
  role: "estudante" | "explicador" | "coordenador" | "admin";
  university: string;
  courseOfStudy?: string;
  yearOfStudy?: string;
  contact?: string;
  avatar: string;
  status: "active" | "inactive" | "pending";
}

export interface Pagamento {
  id: string;
  student: string;
  studentId: string;
  course: string;
  courseId: string;
  amount: number;
  method: "M-Pesa" | "e-Mola" | "Transferência";
  date: string;
  status: "pending" | "confirmed" | "rejected";
  proofUrl: string;
}

export interface Aula {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  courseId: string;
  status: "locked" | "available" | "completed";
  order: number;
}

export interface Material {
  id: string;
  title: string;
  type: "pdf" | "slides" | "exercise_sheet";
  size: string;
  downloadUrl: string;
  courseId: string;
  lessonId?: string;
}

export interface Mensagem {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderRole: string;
  content: string;
  timestamp: string;
  unread: boolean;
  chatId: string;
}

export interface Chat {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Notificacao {
  id: string;
  title: string;
  message: string;
  type: "payment" | "lesson" | "system" | "message";
  date: string;
  unread: boolean;
}
