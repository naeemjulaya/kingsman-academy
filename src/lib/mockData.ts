import { Course, CourseTutor, Profile, Payment, Lesson, Material, Chat, Message, Notification } from "@/types";

export const mockTutors: Profile[] = [
  {
    user_id: "t1",
    full_name: "Keven Gulele",
    email: "keven.gulele@uem.ac.mz",
    phone: "+258 84 999 1111",
    university: "UEM",
    role: "EXPLICADOR",
    status: "active",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7COcwOKcMCFOww9-p9OfRW9i3gHwMPSpogFWEuqxdpLoDuMaI67tzsQ7Wvz8cbqBBfXT08u_pZ8ZptX0ClvjJGf70_wDsYwiwmrAUon9tA1nXEj3Adw453GVdGMoPcMLpTi4ArYvHFo9NKtOypRLnWgcRXO_AKIzqeFRv2NF-IzNnHRBPNshebDF6GOl9Z4hSFixIG8rYTgf1w32TO91LyF4rQkqEBZ_KKTUfx_CqPWShIBdz2A-3yL50I9MmrEIQq0kPK36axdIt",
  },
  {
    user_id: "t2",
    full_name: "Nilzam Bakali",
    email: "nilzam@kingsman.academy",
    phone: "+258 82 222 3333",
    university: "UEM",
    role: "EXPLICADOR",
    status: "active",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE3JrmqnsINXQpMVwnJ9kN6S-UKnXjKZZ_-frYoBQGz2Zc9hPbNVXMRkCUFJMt5FDvJfwTKDPmSwH8JoxNUzf3ll3zecJjjK-cZXoTCq1UhfVc2NLBAiGbLi36Bv7jOwudBX-lIg9NZZ11qTlUtolW1ZD3BMeKzn4k0CeQ3xnOIRdRvpW_6AWF8kK3EpDk_lQpv30kN9QbY82FyK3ycf41wvUxBStnxv2e__jV7THNrv6U6fDH4nuL1g9GfV2KO-T-CuGNzwTvQnst",
  },
  {
    user_id: "t3",
    full_name: "Dulce Ezequiel",
    email: "dulce@kingsman.academy",
    phone: "+258 84 111 2222",
    university: "UEM",
    role: "EXPLICADOR",
    status: "active",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-uddCv2pAoYGAYNcqKkdObNAoD3kzT3A_EpJb5wYyFMTPd9KMecgd0WS61L1vy_Z2lTtKF03PPFGqu_F64fnt71WCteaM1SyBSCBmjMnW2KqMYWCJnO1UPf_zKxT-mB6X9r4NKcZ5I1BUqvzgjPqRt5rpvZfXrmoUotk17LnS3QuDDbjU3gEHX8-2aD5JkMOxWP6zXnNH4fUQG4AOeW4gdw_rBgsDN7pj_uvmi5j3SSpSp5ZiJQBkJtKhVgkOSn4R1YCuzO0M64EB",
  },
  {
    user_id: "t4",
    full_name: "Naeem Julaya",
    email: "naeem@kingsman.academy",
    phone: "+258 84 333 4444",
    university: "UEM",
    role: "EXPLICADOR",
    status: "active",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjPQUtbSru5td0MzI9m150I0wQ-audjm_tAflSzXNrDesij9M8VtuHMmNYKGVcMZDZJNlBU_KS5OqcXPZq07QLRy8SXp3H3IgcVdCbFEo9KVA91T-3gj8xeAdGCS93w8ky0JKJjqfOXoRVng7jT0T83GOo7Q8fEoe1fnpKT6i4TlxKpKlEod0Q33GCqyVOuqeLVAqk-qABZknbYBUL5SN1S9Axc9V0gThcZFFcdGkmEE4U2FQKXYbUB2Nd_F-4esZ11VIwqUQbpFbG",
  },
  {
    user_id: "t5",
    full_name: "Virgínia Tembe",
    email: "virginia@kingsman.academy",
    phone: "+258 84 555 6666",
    university: "UEM",
    role: "EXPLICADOR",
    status: "active",
    avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuALPtNGvThdZVePN5IuVjLbj1vgsnx1wQ_DK9GIbnVWUW_pWkTpO5KT_sZ0bsRHcPoeQzzEb8ssxy4YxW9dhAcg-GgMQQq7bDQakZ-1beDgmUZkPO_65USmxcL6Om-LOILT5lmylypRjhJbUdToIQOo70CRwxedsdfYV17Apoe1MUDPYhvoFFRy_N8pICyI4CiKMo9lTIOD6c2V-4e_9eMV0stSNIIqat8Q15T4a3sAB-35rDjZlRHg74zKhe38nTtveMXaMh8eK22V",
  }
];

export const mockCourseTutors: CourseTutor[] = [
  { id: "ct1", course_id: "c1", tutor_id: "t1", is_active: true },
  { id: "ct2", course_id: "c2", tutor_id: "t2", is_active: true },
  { id: "ct3", course_id: "c3", tutor_id: "t3", is_active: true },
  { id: "ct4", course_id: "c4", tutor_id: "t4", is_active: true },
  { id: "ct5", course_id: "c5", tutor_id: "t5", is_active: true },
  { id: "ct6", course_id: "c6", tutor_id: "t1", is_active: true },
];

export const mockCourses: Course[] = [
  {
    id: "c1",
    name: "Bioestatística",
    department: "Ciências Médicas",
    price_monthly: 750,
    price_per_lesson: 150,
    description: "Domine análise de dados, inferência estatística e probabilidade com foco em saúde.",
    max_tutors: 2,
    is_active: true,
  },
  {
    id: "c2",
    name: "Química Orgânica",
    department: "Engenharia",
    price_monthly: 750,
    price_per_lesson: 150,
    description: "Mecanismos de reação, síntese orgânica e hidrocarbonetos explicados de forma simples.",
    max_tutors: 1,
    is_active: true,
  },
  {
    id: "c3",
    name: "Fisiologia Animal",
    department: "Biologia",
    price_monthly: 750,
    price_per_lesson: 150,
    description: "Funcionamento sistémico dos organismos vivos em detalhe, com foco integrativo.",
    max_tutors: 1,
    is_active: true,
  },
  {
    id: "c4",
    name: "Bioquímica Vegetal",
    department: "Agronomia",
    price_monthly: 750,
    price_per_lesson: 150,
    description: "Metabolismo, fotossíntese e processos vitais no reino das plantas.",
    max_tutors: 1,
    is_active: true,
  },
  {
    id: "c5",
    name: "Análise Matemática II",
    department: "Engenharia",
    price_monthly: 750,
    price_per_lesson: 150,
    description: "Cálculo integral, equações diferenciais e séries com abordagem prática e direta.",
    max_tutors: 1,
    is_active: true,
  },
  {
    id: "c6",
    name: "Física II",
    department: "Engenharia",
    price_monthly: 750,
    price_per_lesson: 150,
    description: "Termodinâmica, oscilações, ondas e introdução ao eletromagnetismo.",
    max_tutors: 1,
    is_active: true,
  }
];

//export const mockUsers: Profile[] = [
//  ...mockTutors,
//  { user_id: "s101", full_name: "Keven Gulele", email: "keven.gulele@uem.ac.mz", role: "ESTUDANTE", university: "UEM", course: "Medicina", year_of_study: "2º Ano", phone: "+258 84 123 4567", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2Q2-DUXyCvl9clOmukXUATsRAaZoDLQ02qyBRMKJmFbJEq8oEsyQm2syEISHXyUBv9M-k2C8eg8ktUTgL9b1R1qOcpScYiIMkIvNx6UgGXdLcpMbShLjUYEMHfssgDcIvysxzcWklGQF9Zqy0_UKnS075gizNqUYyX63PiI2tQz2POwdpfXCttMNJcQIwkydkoWqH0fdUAZvngDSX0qwk5fdRnIJxeco1qfv2swshNVeIj9PBy1cFZbskAzAimPsGd5188-5D7V0j", status: "active" },
//  { user_id: "s102", full_name: "João Pedro", email: "joao.pedro@uem.ac.mz", role: "ESTUDANTE", university: "UEM", course: "Agronomia", year_of_study: "2º Ano", phone: "+258 82 444 5555", avatar_url: "", status: "active" },
//  { user_id: "s103", full_name: "Sandra Lima", email: "sandra.lima@isctem.ac.mz", role: "ESTUDANTE", university: "ISCTEM", course: "Farmácia", year_of_study: "3º Ano", phone: "+258 85 987 6543", avatar_url: "", status: "active" },
//  { user_id: "c_1", full_name: "Naeem Julaya", email: "naeem.coord@kingsman.academy", role: "COORDENADOR", university: "UEM", phone: "+258 84 555 6666", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjPQUtbSru5td0MzI9m150I0wQ-audjm_tAflSzXNrDesij9M8VtuHMmNYKGVcMZDZJNlBU_KS5OqcXPZq07QLRy8SXp3H3IgcVdCbFEo9KVA91T-3gj8xeAdGCS93w8ky0JKJjqfOXoRVng7jT0T83GOo7Q8fEoe1fnpKT6i4TlxKpKlEod0Q33GCqyVOuqeLVAqk-qABZknbYBUL5SN1S9Axc9V0gThcZFFcdGkmEE4U2FQKXYbUB2Nd_F-4esZ11VIwqUQbpFbG", status: "active" },
//  { user_id: "adm_1", full_name: "Kingsman Admin", email: "admin@kingsman.academy", role: "ADMIN", university: "Kingsman HQ", phone: "+258 84 000 0000", avatar_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjPQUtbSru5td0MzI9m150I0wQ-audjm_tAflSzXNrDesij9M8VtuHMmNYKGVcMZDZJNlBU_KS5OqcXPZq07QLRy8SXp3H3IgcVdCbFEo9KVA91T-3gj8xeAdGCS93w8ky0JKJjqfOXoRVng7jT0T83GOo7Q8fEoe1fnpKT6i4TlxKpKlEod0Q33GCqyVOuqeLVAqk-qABZknbYBUL5SN1S9Axc9V0gThcZFFcdGkmEE4U2FQKXYbUB2Nd_F-4esZ11VIwqUQbpFbG", status: "active" }
//];

export const mockStudentData = {
  name: "Keven Gulele",
  id: "s101",
  enrolledCourses: [
    { id: "c1", name: "Bioestatística", progress: 60, totalLessons: 12, completedLessons: 7, tutor: "Keven Gulele", nextLesson: "Aula 8: Regressão Linear", price: 750 },
    { id: "c2", name: "Química Orgânica", progress: 30, totalLessons: 10, completedLessons: 3, tutor: "Nilzam Bakali", nextLesson: "Aula 4: Reacções de Substituição", price: 750 }
  ],
  stats: {
    enrolledCourses: 2,
    watchedLessons: 10,
    nextPayment: { amount: 750, date: "20/06/2026" }
  },
  recentActivity: [
    { type: "lesson_completed", message: "Aula concluída — Bioestatística Aula 7: Correlação", date: "Hoje, 10:45 AM" },
    { type: "material_downloaded", message: "Material de Estudo baixado — Química Orgânica", date: "Ontem, 16:20 PM" },
    { type: "payment_confirmed", message: "Confirmação de Pagamento Recebida — Semestre de Junho", date: "22 Out, 09:12 AM" }
  ]
};

export const mockPayments: Payment[] = [
  { id: "p1", student_id: "s102", course_id: "c1", amount: 750, method: "MPESA", status: "PENDING", proof_url: "/mock-proof.jpg" },
  { id: "p2", student_id: "s103", course_id: "c2", amount: 750, method: "EMOLA", status: "PENDING", proof_url: "/mock-proof.jpg" },
  { id: "p3", student_id: "s101", course_id: "c1", amount: 750, method: "MPESA", status: "CONFIRMED", proof_url: "/mock-proof.jpg" },
  { id: "p4", student_id: "s104", course_id: "c5", amount: 750, method: "TRANSFERENCIA", status: "CONFIRMED", proof_url: "/mock-proof.jpg" },
  { id: "p5", student_id: "s105", course_id: "c6", amount: 750, method: "MPESA", status: "REJECTED", proof_url: "/mock-proof.jpg" }
];

export const mockLessons: Lesson[] = [
  { id: "l1", title: "Aula 1: Introdução e Amostragem", description: "Bases conceituais da bioestatística e métodos de amostragem em populações clínicas.", duration: 45, course_id: "c1", order_index: 1, is_active: true },
  { id: "l2", title: "Aula 2: Estatística Descritiva", description: "Medidas de tendência central (média, mediana, moda) e dispersão (variância, desvio padrão).", duration: 50, course_id: "c1", order_index: 2, is_active: true },
  { id: "l3", title: "Aula 3: Probabilidade Básica", description: "Conceitos fundamentais de probabilidade e tabelas de contingência na saúde.", duration: 40, course_id: "c1", order_index: 3, is_active: true },
  { id: "l4", title: "Aula 4: Distribuição Normal e Z-Score", description: "Uso da distribuição gaussiana padrão e cálculo de probabilidades sob a curva.", duration: 55, course_id: "c1", order_index: 4, is_active: true },
  { id: "l5", title: "Aula 5: Intervalos de Confiança", description: "Como estimar parâmetros populacionais com base em médias e proporções amostrais.", duration: 48, course_id: "c1", order_index: 5, is_active: true },
  { id: "l6", title: "Aula 6: Teste T de Student", description: "Comparação de médias de grupos independentes e emparelhados.", duration: 52, course_id: "c1", order_index: 6, is_active: true },
  { id: "l7", title: "Aula 7: Correlação Linear", description: "Cálculo e interpretação do coeficiente de Pearson.", duration: 45, course_id: "c1", order_index: 7, is_active: true },
  { id: "l8", title: "Aula 8: Regressão Linear Simples", description: "Criação de modelos preditivos e testes de hipóteses de inclinação.", duration: 50, course_id: "c1", order_index: 8, is_active: true },

  // Lessons for Chemistry
  { id: "l201", title: "Aula 1: Hibridação do Átomo de Carbono", description: "Estudo dos orbitais sp3, sp2 e sp, geometria molecular e ligações sigma/pi.", duration: 42, course_id: "c2", order_index: 1, is_active: true },
  { id: "l202", title: "Aula 2: Nomenclatura IUPAC de Alcanos", description: "Regras sistemáticas para nomear alcanos e radicais alquil lineares e ramificados.", duration: 48, course_id: "c2", order_index: 2, is_active: true },
  { id: "l203", title: "Aula 3: Análise Conformacional", description: "Projeções de Newman, confôrmeros eclipsados e alternados do etano e butano.", duration: 40, course_id: "c2", order_index: 3, is_active: true },
];

export const mockMaterials: Material[] = [
  { id: "m1", title: "Formulário de Probabilidade e Amostragem.pdf", file_type: "pdf", file_size: 1200000, file_url: "#", course_id: "c1", uploaded_by: "t1" },
  { id: "m2", title: "Exercícios Resolvidos - Teste T.pdf", file_type: "pdf", file_size: 850000, file_url: "#", course_id: "c1", uploaded_by: "t1" },
  { id: "m3", title: "Tabela de Distribuição Normal.pdf", file_type: "pdf", file_size: 340000, file_url: "#", course_id: "c1", uploaded_by: "t1" },
  { id: "m4", title: "Apontamentos Teóricos de Bioestatística.pdf", file_type: "pdf", file_size: 3400000, file_url: "#", course_id: "c1", uploaded_by: "t1" },

  // Chemistry materials
  { id: "m201", title: "Mecanismos de Substituição Nucleofílica (SN1 vs SN2).pdf", file_type: "pdf", file_size: 1800000, file_url: "#", course_id: "c2", uploaded_by: "t2" },
  { id: "m202", title: "Ficha de Exercícios 1: Hibridação e Acidez.pdf", file_type: "pdf", file_size: 620000, file_url: "#", course_id: "c2", uploaded_by: "t2" }
];

export const mockChats: Chat[] = [
  { id: "ch1", participantName: "Keven Gulele", participantAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7COcwOKcMCFOww9-p9OfRW9i3gHwMPSpogFWEuqxdpLoDuMaI67tzsQ7Wvz8cbqBBfXT08u_pZ8ZptX0ClvjJGf70_wDsYwiwmrAUon9tA1nXEj3Adw453GVdGMoPcMLpTi4ArYvHFo9NKtOypRLnWgcRXO_AKIzqeFRv2NF-IzNnHRBPNshebDF6GOl9Z4hSFixIG8rYTgf1w32TO91LyF4rQkqEBZ_KKTUfx_CqPWShIBdz2A-3yL50I9MmrEIQq0kPK36axdIt", participantRole: "Tutor", lastMessage: "Olá Keven, a aula 8 já está disponível na plataforma. Bons estudos!", lastMessageTime: "10:45 AM", unreadCount: 1 },
  { id: "ch2", participantName: "Nilzam Bakali", participantAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE3JrmqnsINXQpMVwnJ9kN6S-UKnXjKZZ_-frYoBQGz2Zc9hPbNVXMRkCUFJMt5FDvJfwTKDPmSwH8JoxNUzf3ll3zecJjjK-cZXoTCq1UhfVc2NLBAiGbLi36Bv7jOwudBX-lIg9NZZ11qTlUtolW1ZD3BMeKzn4k0CeQ3xnOIRdRvpW_6AWF8kK3EpDk_lQpv30kN9QbY82FyK3ycf41wvUxBStnxv2e__jV7THNrv6U6fDH4nuL1g9GfV2KO-T-CuGNzwTvQnst", participantRole: "Tutor", lastMessage: "Podes fazer o upload do comprovativo na página de pagamento.", lastMessageTime: "Ontem", unreadCount: 0 },
  { id: "ch3", participantName: "Virgínia Tembe", participantAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALPtNGvThdZVePN5IuVjLbj1vgsnx1wQ_DK9GIbnVWUW_pWkTpO5KT_sZ0bsRHcPoeQzzEb8ssxy4YxW9dhAcg-GgMQQq7bDQakZ-1beDgmUZkPO_65USmxcL6Om-LOILT5lmylypRjhJbUdToIQOo70CRwxedsdfYV17Apoe1MUDPYhvoFFRy_N8pICyI4CiKMo9lTIOD6c2V-4e_9eMV0stSNIIqat8Q15T4a3sAB-35rDjZlRHg74zKhe38nTtveMXaMh8eK22V", participantRole: "Tutor", lastMessage: "Sem problema! Vejo-te na aula de Cálculo.", lastMessageTime: "15 Jun", unreadCount: 0 }
];

export const mockMessages: Message[] = [
  { id: "m_1", sender_id: "t1", receiver_id: "s101", content: "Olá Keven! Dúvidas sobre a ficha de regressão linear?", is_read: true },
  { id: "m_2", sender_id: "s101", receiver_id: "t1", content: "Sim professor, estou um pouco perdido no passo da fórmula de ANOVA residual.", is_read: true },
  { id: "m_3", sender_id: "t1", receiver_id: "s101", content: "Olá Keven, a aula 8 já está disponível na plataforma. Bons estudos! Dei lá uma explicação detalhada.", is_read: false }
];

export const mockNotifications: Notification[] = [
  { id: "n1", title: "Pagamento Aprovado", content: "O seu comprovativo da cadeira de Química Orgânica foi validado com sucesso.", type: "payment", user_id: "s101", is_read: false, created_at: "Há 1 hora" },
  { id: "n2", title: "Nova Aula Disponível", content: "A Aula 8: Regressão Linear Simples de Bioestatística foi publicada.", type: "lesson", user_id: "s101", is_read: false, created_at: "Há 3 horas" },
  { id: "n3", title: "Nova Mensagem", content: "O explicador Keven Gulele enviou uma mensagem para você.", type: "message", user_id: "s101", is_read: true, created_at: "Há 4 horas" },
  { id: "n4", title: "Manutenção do Sistema", content: "A plataforma estará em atualização no domingo às 02:00 AM.", type: "system", user_id: "s101", is_read: true, created_at: "Há 1 dia" }
];
