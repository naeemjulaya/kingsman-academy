import { Cadeira, Explicador, Utilizador, Pagamento, Aula, Material, Chat, Mensagem, Notificacao } from "@/types";

export const mockTutors: Explicador[] = [
  {
    id: "t1",
    name: "Keven Gulele",
    specialty: "Estatística & Fisiologia",
    bio: "Líder do programa acadêmico com mais de 5 anos de experiência em monitoria universitária e consultoria estatística.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7COcwOKcMCFOww9-p9OfRW9i3gHwMPSpogFWEuqxdpLoDuMaI67tzsQ7Wvz8cbqBBfXT08u_pZ8ZptX0ClvjJGf70_wDsYwiwmrAUon9tA1nXEj3Adw453GVdGMoPcMLpTi4ArYvHFo9NKtOypRLnWgcRXO_AKIzqeFRv2NF-IzNnHRBPNshebDF6GOl9Z4hSFixIG8rYTgf1w32TO91LyF4rQkqEBZ_KKTUfx_CqPWShIBdz2A-3yL50I9MmrEIQq0kPK36axdIt",
    rating: 4.9,
    reviewsCount: 48,
    studentsCount: 154,
    lessonsCount: 32,
    earnings: 45750,
    status: "active",
    courses: ["c1", "c6"]
  },
  {
    id: "t2",
    name: "Nilzam Bakali",
    specialty: "Química Orgânica & Geral",
    bio: "Graduado em Química pela UEM. Dedicado a desmistificar reações orgânicas complexas passo a passo.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE3JrmqnsINXQpMVwnJ9kN6S-UKnXjKZZ_-frYoBQGz2Zc9hPbNVXMRkCUFJMt5FDvJfwTKDPmSwH8JoxNUzf3ll3zecJjjK-cZXoTCq1UhfVc2NLBAiGbLi36Bv7jOwudBX-lIg9NZZ11qTlUtolW1ZD3BMeKzn4k0CeQ3xnOIRdRvpW_6AWF8kK3EpDk_lQpv30kN9QbY82FyK3ycf41wvUxBStnxv2e__jV7THNrv6U6fDH4nuL1g9GfV2KO-T-CuGNzwTvQnst",
    rating: 4.8,
    reviewsCount: 35,
    studentsCount: 98,
    lessonsCount: 24,
    earnings: 32000,
    status: "active",
    courses: ["c2"]
  },
  {
    id: "t3",
    name: "Dulce Ezequiel",
    specialty: "Bioquímica & Fisiologia Animal",
    bio: "Investigadora em Ciências Biológicas. Método focado em fixação de conceitos práticos e esquemas visuais.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-uddCv2pAoYGAYNcqKkdObNAoD3kzT3A_EpJb5wYyFMTPd9KMecgd0WS61L1vy_Z2lTtKF03PPFGqu_F64fnt71WCteaM1SyBSCBmjMnW2KqMYWCJnO1UPf_zKxT-mB6X9r4NKcZ5I1BUqvzgjPqRt5rpvZfXrmoUotk17LnS3QuDDbjU3gEHX8-2aD5JkMOxWP6zXnNH4fUQG4AOeW4gdw_rBgsDN7pj_uvmi5j3SSpSp5ZiJQBkJtKhVgkOSn4R1YCuzO0M64EB",
    rating: 4.7,
    reviewsCount: 29,
    studentsCount: 85,
    lessonsCount: 18,
    earnings: 24500,
    status: "active",
    courses: ["c3", "c4"]
  },
  {
    id: "t4",
    name: "Naeem Julaya",
    specialty: "Álgebra Linear & Programação",
    bio: "Apaixonado por computação gráfica e modelagem matemática. Aulas dinâmicas e focadas em raciocínio lógico.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjPQUtbSru5td0MzI9m150I0wQ-audjm_tAflSzXNrDesij9M8VtuHMmNYKGVcMZDZJNlBU_KS5OqcXPZq07QLRy8SXp3H3IgcVdCbFEo9KVA91T-3gj8xeAdGCS93w8ky0JKJjqfOXoRVng7jT0T83GOo7Q8fEoe1fnpKT6i4TlxKpKlEod0Q33GCqyVOuqeLVAqk-qABZknbYBUL5SN1S9Axc9V0gThcZFFcdGkmEE4U2FQKXYbUB2Nd_F-4esZ11VIwqUQbpFbG",
    rating: 4.9,
    reviewsCount: 42,
    studentsCount: 112,
    lessonsCount: 28,
    earnings: 38250,
    status: "active",
    courses: ["c4"]
  },
  {
    id: "t5",
    name: "Virgínia Tembe",
    specialty: "Cálculo & Física Aplicada",
    bio: "Mestre em Física Aplicada, Virgínia traz uma metodologia única para desmistificar os cálculos mais complexos das engenharias.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALPtNGvThdZVePN5IuVjLbj1vgsnx1wQ_DK9GIbnVWUW_pWkTpO5KT_sZ0bsRHcPoeQzzEb8ssxy4YxW9dhAcg-GgMQQq7bDQakZ-1beDgmUZkPO_65USmxcL6Om-LOILT5lmylypRjhJbUdToIQOo70CRwxedsdfYV17Apoe1MUDPYhvoFFRy_N8pICyI4CiKMo9lTIOD6c2V-4e_9eMV0stSNIIqat8Q15T4a3sAB-35rDjZlRHg74zKhe38nTtveMXaMh8eK22V",
    rating: 4.9,
    reviewsCount: 55,
    studentsCount: 180,
    lessonsCount: 40,
    earnings: 52000,
    status: "active",
    courses: ["c5"]
  }
];

export const mockCourses: Cadeira[] = [
  {
    id: "c1",
    name: "Bioestatística",
    department: "Ciências Médicas",
    price: 750,
    description: "Domine análise de dados, inferência estatística e probabilidade com foco em saúde.",
    syllabus: "Introdução à Estatística Médica, Amostragem, Probabilidade, Distribuições, Intervalos de Confiança, Testes de Hipóteses, Regressão Linear.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4SsbTIUYyOMWrOsHWjTYWoR_27NmoErDD-RJ9qMKV3fxJ5OdOTfVU_V5t-AjMckHHvxNpl0JEDH58585WZyN9LMRL4fJ0xGBDKdOQWsam5Tdr5fz24mmxDOL8EraJoGE6HydLRmkNj5ArQn0Iscc_V6d2Bp3-nnNjJAv2F_j42lr2ZkgA4No5pNiAqpf8NpHc15im2vvI07OGHFrjqEmcLUvKMamvx_gRlY0Igk9Ul8ZLwknRI6XLJnRnzamxE1DMcaqjgW5bfrfm",
    tutorId: "t1",
    status: "active",
    duration: "12 Semanas",
    level: "2º Ano",
    progress: 60
  },
  {
    id: "c2",
    name: "Química Orgânica",
    department: "Engenharia",
    price: 750,
    description: "Mecanismos de reação, síntese orgânica e hidrocarbonetos explicados de forma simples.",
    syllabus: "Hibridação do Carbono, Alcanos, Alcenos, Alcinos, Estereoquímica, Substituição Nucleofílica, Eliminação, Espectroscopia.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm-c2cXdoUO9movwPFo7nbSCQ_sMHbGduT7fR8OoRc3TvZHnle3Rvdq2JAgbyZeSabIyRs_qEpe9cgCNgQcH92uD-8CgwGGXUgPVnoLjD-lYfWLwUU3SHUOBZEceZ4sh7fzTcfFazz7g34tHMY5EYSNBkYogsTZaTmtqQPl-UqbcnFDNw4Y7YEyBU6c_cojr0SU_ZcP4BekjHQ81mW96JEmHwvizFJgapW74iweSlwH46elYUtU71qXRhRyjYwNs4hY00P2znkvvLZ",
    tutorId: "t2",
    status: "active",
    duration: "10 Semanas",
    level: "1º Ano",
    progress: 30
  },
  {
    id: "c3",
    name: "Fisiologia Animal",
    department: "Biologia",
    price: 750,
    description: "Funcionamento sistémico dos organismos vivos em detalhe, com foco integrativo.",
    syllabus: "Homeostase, Sistema Nervoso, Sistema Endócrino, Fisiologia Cardiovascular, Respiração, Digestão, Excreção e Osmorregulação.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPdmvg6CX5WWeX7GUFqEy1CUqEjHA6U-rTVgMYnTFRpdoC86Wm2sc0HmZwOruIJgEaricXFNwY6yZnYUtCXkGBJ7E3Tg3dLQexU8lPFW4_p1Tim31K_tgoEDxCRYX9xfX7R44DwcE3TG_M2p2qsWsm2iQdY7TUeKe3AW8VjETdmQ4urkRmql-qAptzbaC2TU-3p-FL1rFh8AYKVuY1NDlpyopDAtDRLL4xTPjFv8yc9c1dsWXe2kWQmHR1b5bSlig9pAJdRuHUWEBf",
    tutorId: "t3",
    status: "active",
    duration: "14 Semanas",
    level: "3º Ano",
    progress: 0
  },
  {
    id: "c4",
    name: "Bioquímica Vegetal",
    department: "Agronomia",
    price: 750,
    description: "Metabolismo, fotossíntese e processos vitais no reino das plantas.",
    syllabus: "Fotossíntese (Fases Luminosa e Escura), Metabolismo de Carbono, Fixação de Azoto, Metabolismo Secundário, Hormonas Vegetais.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPdmvg6CX5WWeX7GUFqEy1CUqEjHA6U-rTVgMYnTFRpdoC86Wm2sc0HmZwOruIJgEaricXFNwY6yZnYUtCXkGBJ7E3Tg3dLQexU8lPFW4_p1Tim31K_tgoEDxCRYX9xfX7R44DwcE3TG_M2p2qsWsm2iQdY7TUeKe3AW8VjETdmQ4urkRmql-qAptzbaC2TU-3p-FL1rFh8AYKVuY1NDlpyopDAtDRLL4xTPjFv8yc9c1dsWXe2kWQmHR1b5bSlig9pAJdRuHUWEBf",
    tutorId: "t3",
    status: "active",
    duration: "12 Semanas",
    level: "2º Ano"
  },
  {
    id: "c5",
    name: "Análise Matemática II",
    department: "Engenharia",
    price: 750,
    description: "Cálculo integral, equações diferenciais e séries com abordagem prática e direta.",
    syllabus: "Integrais Indefinidos, Integrais Definidos, Aplicações da Integração, Séries Numéricas, Equações Diferenciais Ordinárias.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlB4TkdOSWFpUJovq4ZgdZQrGE2fiac3oTzWWdV4CZZsrPHFiKx-ucMoR2y7wXQ3HKQde_msY-zvXC_ngD3f6PGl1lzIc-EBkgp7SrBnIAnm0xluxp5N78HE54oLku8P6k8uuGSVgnXuxC4UrthDdcKZ5jxiDBCHjWckqWipgG8bji9JEeU8FicyafDPghc5kTJscsXL7mrtA68OUy1eNis3qBsKjFw07TRMZba5MkpX8KIHbsmOPDGmkIDedJHg-nB3OH5vgN70Qb",
    tutorId: "t5",
    status: "active",
    duration: "16 Semanas",
    level: "1º Ano"
  },
  {
    id: "c6",
    name: "Física II",
    department: "Engenharia",
    price: 750,
    description: "Termodinâmica, oscilações, ondas e introdução ao eletromagnetismo.",
    syllabus: "Temperatura e Calor, Leis da Termodinâmica, Movimento Harmônico Simples, Ondas Mecânicas, Campo Elétrico, Lei de Gauss.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm-c2cXdoUO9movwPFo7nbSCQ_sMHbGduT7fR8OoRc3TvZHnle3Rvdq2JAgbyZeSabIyRs_qEpe9cgCNgQcH92uD-8CgwGGXUgPVnoLjD-lYfWLwUU3SHUOBZEceZ4sh7fzTcfFazz7g34tHMY5EYSNBkYogsTZaTmtqQPl-UqbcnFDNw4Y7YEyBU6c_cojr0SU_ZcP4BekjHQ81mW96JEmHwvizFJgapW74iweSlwH46elYUtU71qXRhRyjYwNs4hY00P2znkvvLZ",
    tutorId: "t1",
    status: "active",
    duration: "12 Semanas",
    level: "1º Ano"
  },
  // Adding more mock courses to reach 15 as per PRD/Brief requirements
  {
    id: "c7",
    name: "Álgebra Linear",
    department: "Engenharia",
    price: 750,
    description: "Espaços vetoriais, matrizes, determinantes e transformações lineares explicadas de forma intuitiva.",
    syllabus: "Sistemas de Equações, Vetores e Matrizes, Espaços Vetoriais, Valores Próprios, Espaços de Produto Interno.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlB4TkdOSWFpUJovq4ZgdZQrGE2fiac3oTzWWdV4CZZsrPHFiKx-ucMoR2y7wXQ3HKQde_msY-zvXC_ngD3f6PGl1lzIc-EBkgp7SrBnIAnm0xluxp5N78HE54oLku8P6k8uuGSVgnXuxC4UrthDdcKZ5jxiDBCHjWckqWipgG8bji9JEeU8FicyafDPghc5kTJscsXL7mrtA68OUy1eNis3qBsKjFw07TRMZba5MkpX8KIHbsmOPDGmkIDedJHg-nB3OH5vgN70Qb",
    tutorId: "t4",
    status: "active",
    duration: "10 Semanas",
    level: "1º Ano"
  },
  {
    id: "c8",
    name: "Fisiologia Vegetal",
    department: "Agronomia",
    price: 750,
    description: "Relações hídricas, nutrição mineral e desenvolvimento de plantas superiores.",
    syllabus: "Água nas Células, Transpiração, Nutrição Mineral, Transporte no Floema, Crescimento Vegetal, Fotoperiodismo.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPdmvg6CX5WWeX7GUFqEy1CUqEjHA6U-rTVgMYnTFRpdoC86Wm2sc0HmZwOruIJgEaricXFNwY6yZnYUtCXkGBJ7E3Tg3dLQexU8lPFW4_p1Tim31K_tgoEDxCRYX9xfX7R44DwcE3TG_M2p2qsWsm2iQdY7TUeKe3AW8VjETdmQ4urkRmql-qAptzbaC2TU-3p-FL1rFh8AYKVuY1NDlpyopDAtDRLL4xTPjFv8yc9c1dsWXe2kWQmHR1b5bSlig9pAJdRuHUWEBf",
    tutorId: "t3",
    status: "active",
    duration: "12 Semanas",
    level: "3º Ano"
  },
  {
    id: "c9",
    name: "Cálculo I",
    department: "Engenharia",
    price: 750,
    description: "Limites, continuidade, derivadas e introdução à primitivação.",
    syllabus: "Funções Reais, Limites de Funções, Continuidade, Derivadas, Regras de Derivação, Aplicação de Derivadas, Introdução a Primitivas.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlB4TkdOSWFpUJovq4ZgdZQrGE2fiac3oTzWWdV4CZZsrPHFiKx-ucMoR2y7wXQ3HKQde_msY-zvXC_ngD3f6PGl1lzIc-EBkgp7SrBnIAnm0xluxp5N78HE54oLku8P6k8uuGSVgnXuxC4UrthDdcKZ5jxiDBCHjWckqWipgG8bji9JEeU8FicyafDPghc5kTJscsXL7mrtA68OUy1eNis3qBsKjFw07TRMZba5MkpX8KIHbsmOPDGmkIDedJHg-nB3OH5vgN70Qb",
    tutorId: "t5",
    status: "active",
    duration: "16 Semanas",
    level: "1º Ano"
  },
  {
    id: "c10",
    name: "Microbiologia Geral",
    department: "Ciências Médicas",
    price: 750,
    description: "Mundo microbiano: vírus, bactérias e fungos, com enfoque em patologia.",
    syllabus: "História da Microbiologia, Estrutura Bacteriana, Nutrição e Crescimento, Genética Bacteriana, Virologia, Micologia, Controlo Microbiano.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4SsbTIUYyOMWrOsHWjTYWoR_27NmoErDD-RJ9qMKV3fxJ5OdOTfVU_V5t-AjMckHHvxNpl0JEDH58585WZyN9LMRL4fJ0xGBDKdOQWsam5Tdr5fz24mmxDOL8EraJoGE6HydLRmkNj5ArQn0Iscc_V6d2Bp3-nnNjJAv2F_j42lr2ZkgA4No5pNiAqpf8NpHc15im2vvI07OGHFrjqEmcLUvKMamvx_gRlY0Igk9Ul8ZLwknRI6XLJnRnzamxE1DMcaqjgW5bfrfm",
    tutorId: "t1",
    status: "active",
    duration: "12 Semanas",
    level: "2º Ano"
  },
  {
    id: "c11",
    name: "Introdução à Programação",
    department: "Informática",
    price: 750,
    description: "Conceitos básicos de algoritmos, lógica de programação e sintaxe C/Python.",
    syllabus: "Variáveis e Operadores, Estruturas de Controlo de Fluxo, Funções, Vetores e Matrizes, Ficheiros, Alocação de Memória.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlB4TkdOSWFpUJovq4ZgdZQrGE2fiac3oTzWWdV4CZZsrPHFiKx-ucMoR2y7wXQ3HKQde_msY-zvXC_ngD3f6PGl1lzIc-EBkgp7SrBnIAnm0xluxp5N78HE54oLku8P6k8uuGSVgnXuxC4UrthDdcKZ5jxiDBCHjWckqWipgG8bji9JEeU8FicyafDPghc5kTJscsXL7mrtA68OUy1eNis3qBsKjFw07TRMZba5MkpX8KIHbsmOPDGmkIDedJHg-nB3OH5vgN70Qb",
    tutorId: "t4",
    status: "active",
    duration: "10 Semanas",
    level: "1º Ano"
  },
  {
    id: "c12",
    name: "Estruturas de Dados",
    department: "Informática",
    price: 750,
    description: "Pilhas, filas, árvores, grafos e algoritmos de ordenação e pesquisa.",
    syllabus: "Listas Ligadas, Pilhas e Filas, Árvores Binárias de Pesquisa, Grafos, Tabelas Hash, Algoritmos de Ordenação, Algoritmos de Pesquisa.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlB4TkdOSWFpUJovq4ZgdZQrGE2fiac3oTzWWdV4CZZsrPHFiKx-ucMoR2y7wXQ3HKQde_msY-zvXC_ngD3f6PGl1lzIc-EBkgp7SrBnIAnm0xluxp5N78HE54oLku8P6k8uuGSVgnXuxC4UrthDdcKZ5jxiDBCHjWckqWipgG8bji9JEeU8FicyafDPghc5kTJscsXL7mrtA68OUy1eNis3qBsKjFw07TRMZba5MkpX8KIHbsmOPDGmkIDedJHg-nB3OH5vgN70Qb",
    tutorId: "t4",
    status: "active",
    duration: "12 Semanas",
    level: "2º Ano"
  },
  {
    id: "c13",
    name: "Física I",
    department: "Engenharia",
    price: 750,
    description: "Mecânica clássica, cinemática, dinâmica e leis de conservação.",
    syllabus: "Vetores, Movimento Unidimensional e Bidimensional, Leis de Newton, Trabalho e Energia, Conservação do Momento, Rotação.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm-c2cXdoUO9movwPFo7nbSCQ_sMHbGduT7fR8OoRc3TvZHnle3Rvdq2JAgbyZeSabIyRs_qEpe9cgCNgQcH92uD-8CgwGGXUgPVnoLjD-lYfWLwUU3SHUOBZEceZ4sh7fzTcfFazz7g34tHMY5EYSNBkYogsTZaTmtqQPl-UqbcnFDNw4Y7YEyBU6c_cojr0SU_ZcP4BekjHQ81mW96JEmHwvizFJgapW74iweSlwH46elYUtU71qXRhRyjYwNs4hY00P2znkvvLZ",
    tutorId: "t5",
    status: "active",
    duration: "12 Semanas",
    level: "1º Ano"
  },
  {
    id: "c14",
    name: "Química Geral",
    department: "Ciências Biológicas",
    price: 750,
    description: "Estrutura atómica, ligações químicas e reações em soluções aquosas.",
    syllabus: "Teoria Atómica, Tabela Periódica, Ligações Químicas, Estequiometria, Termoquímica, Equilíbrio Químico, Ácidos e Bases.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm-c2cXdoUO9movwPFo7nbSCQ_sMHbGduT7fR8OoRc3TvZHnle3Rvdq2JAgbyZeSabIyRs_qEpe9cgCNgQcH92uD-8CgwGGXUgPVnoLjD-lYfWLwUU3SHUOBZEceZ4sh7fzTcfFazz7g34tHMY5EYSNBkYogsTZaTmtqQPl-UqbcnFDNw4Y7YEyBU6c_cojr0SU_ZcP4BekjHQ81mW96JEmHwvizFJgapW74iweSlwH46elYUtU71qXRhRyjYwNs4hY00P2znkvvLZ",
    tutorId: "t2",
    status: "active",
    duration: "10 Semanas",
    level: "1º Ano"
  },
  {
    id: "c15",
    name: "Genética Geral",
    department: "Ciências Biológicas",
    price: 750,
    description: "Princípios mendelianos, genética molecular e engenharia genética básica.",
    syllabus: "Leis de Mendel, Cruzamento e Ligação, Estrutura do ADN, Transcrição e Tradução, Mutações Genéticas, ADN Recombinante.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPdmvg6CX5WWeX7GUFqEy1CUqEjHA6U-rTVgMYnTFRpdoC86Wm2sc0HmZwOruIJgEaricXFNwY6yZnYUtCXkGBJ7E3Tg3dLQexU8lPFW4_p1Tim31K_tgoEDxCRYX9xfX7R44DwcE3TG_M2p2qsWsm2iQdY7TUeKe3AW8VjETdmQ4urkRmql-qAptzbaC2TU-3p-FL1rFh8AYKVuY1NDlpyopDAtDRLL4xTPjFv8yc9c1dsWXe2kWQmHR1b5bSlig9pAJdRuHUWEBf",
    tutorId: "t1",
    status: "active",
    duration: "14 Semanas",
    level: "2º Ano"
  }
];

export const mockStudentData = {
  name: "Keven Gulele",
  id: "4892-X",
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

export const mockPayments: Pagamento[] = [
  { id: "p1", student: "João Pedro", studentId: "s102", course: "Bioestatística", courseId: "c1", amount: 750, method: "M-Pesa", date: "14/06/2026", status: "pending", proofUrl: "/mock-proof.jpg" },
  { id: "p2", student: "Sandra Lima", studentId: "s103", course: "Química Orgânica", courseId: "c2", amount: 750, method: "e-Mola", date: "14/06/2026", status: "pending", proofUrl: "/mock-proof.jpg" },
  { id: "p3", student: "Keven Gulele", studentId: "s101", course: "Bioestatística", courseId: "c1", amount: 750, method: "M-Pesa", date: "12/06/2026", status: "confirmed", proofUrl: "/mock-proof.jpg" },
  { id: "p4", student: "Milena Sitoe", studentId: "s104", course: "Análise Matemática II", courseId: "c5", amount: 750, method: "Transferência", date: "10/06/2026", status: "confirmed", proofUrl: "/mock-proof.jpg" },
  { id: "p5", student: "Dércio Tembe", studentId: "s105", course: "Física II", courseId: "c6", amount: 750, method: "M-Pesa", date: "09/06/2026", status: "rejected", proofUrl: "/mock-proof.jpg" }
];

export const mockUsers: Utilizador[] = [
  { id: "s101", name: "Keven Gulele", email: "keven.gulele@uem.ac.mz", role: "estudante", university: "UEM", courseOfStudy: "Medicina", yearOfStudy: "2º Ano", contact: "+258 84 123 4567", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2Q2-DUXyCvl9clOmukXUATsRAaZoDLQ02qyBRMKJmFbJEq8oEsyQm2syEISHXyUBv9M-k2C8eg8ktUTgL9b1R1qOcpScYiIMkIvNx6UgGXdLcpMbShLjUYEMHfssgDcIvysxzcWklGQF9Zqy0_UKnS075gizNqUYyX63PiI2tQz2POwdpfXCttMNJcQIwkydkoWqH0fdUAZvngDSX0qwk5fdRnIJxeco1qfv2swshNVeIj9PBy1cFZbskAzAimPsGd5188-5D7V0j", status: "active" },
  { id: "s102", name: "João Pedro", email: "joao.pedro@uem.ac.mz", role: "estudante", university: "UEM", courseOfStudy: "Agronomia", yearOfStudy: "2º Ano", contact: "+258 82 444 5555", avatar: "", status: "active" },
  { id: "s103", name: "Sandra Lima", email: "sandra.lima@isctem.ac.mz", role: "estudante", university: "ISCTEM", courseOfStudy: "Farmácia", yearOfStudy: "3º Ano", contact: "+258 85 987 6543", avatar: "", status: "active" },
  { id: "t1", name: "Keven Gulele", email: "keven.docente@kingsman.academy", role: "explicador", university: "UEM", contact: "+258 84 999 1111", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7COcwOKcMCFOww9-p9OfRW9i3gHwMPSpogFWEuqxdpLoDuMaI67tzsQ7Wvz8cbqBBfXT08u_pZ8ZptX0ClvjJGf70_wDsYwiwmrAUon9tA1nXEj3Adw453GVdGMoPcMLpTi4ArYvHFo9NKtOypRLnWgcRXO_AKIzqeFRv2NF-IzNnHRBPNshebDF6GOl9Z4hSFixIG8rYTgf1w32TO91LyF4rQkqEBZ_KKTUfx_CqPWShIBdz2A-3yL50I9MmrEIQq0kPK36axdIt", status: "active" },
  { id: "t2", name: "Nilzam Bakali", email: "nilzam@kingsman.academy", role: "explicador", university: "UEM", contact: "+258 82 222 3333", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE3JrmqnsINXQpMVwnJ9kN6S-UKnXjKZZ_-frYoBQGz2Zc9hPbNVXMRkCUFJMt5FDvJfwTKDPmSwH8JoxNUzf3ll3zecJjjK-cZXoTCq1UhfVc2NLBAiGbLi36Bv7jOwudBX-lIg9NZZ11qTlUtolW1ZD3BMeKzn4k0CeQ3xnOIRdRvpW_6AWF8kK3EpDk_lQpv30kN9QbY82FyK3ycf41wvUxBStnxv2e__jV7THNrv6U6fDH4nuL1g9GfV2KO-T-CuGNzwTvQnst", status: "active" },
  { id: "c_1", name: "Naeem Julaya", email: "naeem.coord@kingsman.academy", role: "coordenador", university: "UEM", contact: "+258 84 555 6666", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjPQUtbSru5td0MzI9m150I0wQ-audjm_tAflSzXNrDesij9M8VtuHMmNYKGVcMZDZJNlBU_KS5OqcXPZq07QLRy8SXp3H3IgcVdCbFEo9KVA91T-3gj8xeAdGCS93w8ky0JKJjqfOXoRVng7jT0T83GOo7Q8fEoe1fnpKT6i4TlxKpKlEod0Q33GCqyVOuqeLVAqk-qABZknbYBUL5SN1S9Axc9V0gThcZFFcdGkmEE4U2FQKXYbUB2Nd_F-4esZ11VIwqUQbpFbG", status: "active" },
  { id: "adm_1", name: "Kingsman Admin", email: "admin@kingsman.academy", role: "admin", university: "Kingsman HQ", contact: "+258 84 000 0000", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjPQUtbSru5td0MzI9m150I0wQ-audjm_tAflSzXNrDesij9M8VtuHMmNYKGVcMZDZJNlBU_KS5OqcXPZq07QLRy8SXp3H3IgcVdCbFEo9KVA91T-3gj8xeAdGCS93w8ky0JKJjqfOXoRVng7jT0T83GOo7Q8fEoe1fnpKT6i4TlxKpKlEod0Q33GCqyVOuqeLVAqk-qABZknbYBUL5SN1S9Axc9V0gThcZFFcdGkmEE4U2FQKXYbUB2Nd_F-4esZ11VIwqUQbpFbG", status: "active" }
];

export const mockLessons: Aula[] = [
  { id: "l1", title: "Aula 1: Introdução e Amostragem", description: "Bases conceituais da bioestatística e métodos de amostragem em populações clínicas.", duration: "45 min", courseId: "c1", status: "completed", order: 1 },
  { id: "l2", title: "Aula 2: Estatística Descritiva", description: "Medidas de tendência central (média, mediana, moda) e dispersão (variância, desvio padrão).", duration: "50 min", courseId: "c1", status: "completed", order: 2 },
  { id: "l3", title: "Aula 3: Probabilidade Básica", description: "Conceitos fundamentais de probabilidade e tabelas de contingência na saúde.", duration: "40 min", courseId: "c1", status: "completed", order: 3 },
  { id: "l4", title: "Aula 4: Distribuição Normal e Z-Score", description: "Uso da distribuição gaussiana padrão e cálculo de probabilidades sob a curva.", duration: "55 min", courseId: "c1", status: "completed", order: 4 },
  { id: "l5", title: "Aula 5: Intervalos de Confiança", description: "Como estimar parâmetros populacionais com base em médias e proporções amostrais.", duration: "48 min", courseId: "c1", status: "completed", order: 5 },
  { id: "l6", title: "Aula 6: Teste T de Student", description: "Comparação de médias de grupos independentes e emparelhados.", duration: "52 min", courseId: "c1", status: "completed", order: 6 },
  { id: "l7", title: "Aula 7: Correlação Linear", description: "Cálculo e interpretação do coeficiente de Pearson.", duration: "45 min", courseId: "c1", status: "completed", order: 7 },
  { id: "l8", title: "Aula 8: Regressão Linear Simples", description: "Criação de modelos preditivos e testes de hipóteses de inclinação.", duration: "50 min", courseId: "c1", status: "available", order: 8 },
  { id: "l9", title: "Aula 9: Teste Qui-Quadrado", description: "Análise de variáveis categóricas e associação em saúde pública.", duration: "48 min", courseId: "c1", status: "locked", order: 9 },
  { id: "l10", title: "Aula 10: Análise de Variância (ANOVA)", description: "Comparação de múltiplas médias e contrastes lineares.", duration: "60 min", courseId: "c1", status: "locked", order: 10 },
  
  // Lessons for Chemistry
  { id: "l201", title: "Aula 1: Hibridação do Átomo de Carbono", description: "Estudo dos orbitais sp3, sp2 e sp, geometria molecular e ligações sigma/pi.", duration: "42 min", courseId: "c2", status: "completed", order: 1 },
  { id: "l202", title: "Aula 2: Nomenclatura IUPAC de Alcanos", description: "Regras sistemáticas para nomear alcanos e radicais alquil lineares e ramificados.", duration: "48 min", courseId: "c2", status: "completed", order: 2 },
  { id: "l203", title: "Aula 3: Análise Conformacional", description: "Projeções de Newman, confôrmeros eclipsados e alternados do etano e butano.", duration: "40 min", courseId: "c2", status: "completed", order: 3 },
  { id: "l204", title: "Aula 4: Reacções de Substituição Radicalar", description: "Halogenação de alcanos, estabilidade de radicais livres e regioquímica.", duration: "55 min", courseId: "c2", status: "available", order: 4 },
  { id: "l205", title: "Aula 5: Estereoquímica I", description: "Enantiómeros, quiralidade, carbonos assimétricos e projeções de Fischer.", duration: "50 min", courseId: "c2", status: "locked", order: 5 }
];

export const mockMaterials: Material[] = [
  { id: "m1", title: "Formulário de Probabilidade e Amostragem.pdf", type: "pdf", size: "1.2 MB", downloadUrl: "#", courseId: "c1" },
  { id: "m2", title: "Exercícios Resolvidos - Teste T.pdf", type: "pdf", size: "850 KB", downloadUrl: "#", courseId: "c1" },
  { id: "m3", title: "Tabela de Distribuição Normal.pdf", type: "pdf", size: "340 KB", downloadUrl: "#", courseId: "c1" },
  { id: "m4", title: "Apontamentos Teóricos de Bioestatística.pdf", type: "pdf", size: "3.4 MB", downloadUrl: "#", courseId: "c1" },
  
  // Chemistry materials
  { id: "m201", title: "Mecanismos de Substituição Nucleofílica (SN1 vs SN2).pdf", type: "pdf", size: "1.8 MB", downloadUrl: "#", courseId: "c2" },
  { id: "m202", title: "Ficha de Exercícios 1: Hibridação e Acidez.pdf", type: "pdf", size: "620 KB", downloadUrl: "#", courseId: "c2" }
];

export const mockChats: Chat[] = [
  { id: "ch1", participantName: "Keven Gulele", participantAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7COcwOKcMCFOww9-p9OfRW9i3gHwMPSpogFWEuqxdpLoDuMaI67tzsQ7Wvz8cbqBBfXT08u_pZ8ZptX0ClvjJGf70_wDsYwiwmrAUon9tA1nXEj3Adw453GVdGMoPcMLpTi4ArYvHFo9NKtOypRLnWgcRXO_AKIzqeFRv2NF-IzNnHRBPNshebDF6GOl9Z4hSFixIG8rYTgf1w32TO91LyF4rQkqEBZ_KKTUfx_CqPWShIBdz2A-3yL50I9MmrEIQq0kPK36axdIt", participantRole: "Tutor", lastMessage: "Olá Keven, a aula 8 já está disponível na plataforma. Bons estudos!", lastMessageTime: "10:45 AM", unreadCount: 1 },
  { id: "ch2", participantName: "Nilzam Bakali", participantAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE3JrmqnsINXQpMVwnJ9kN6S-UKnXjKZZ_-frYoBQGz2Zc9hPbNVXMRkCUFJMt5FDvJfwTKDPmSwH8JoxNUzf3ll3zecJjjK-cZXoTCq1UhfVc2NLBAiGbLi36Bv7jOwudBX-lIg9NZZ11qTlUtolW1ZD3BMeKzn4k0CeQ3xnOIRdRvpW_6AWF8kK3EpDk_lQpv30kN9QbY82FyK3ycf41wvUxBStnxv2e__jV7THNrv6U6fDH4nuL1g9GfV2KO-T-CuGNzwTvQnst", participantRole: "Tutor", lastMessage: "Podes fazer o upload do comprovativo na página de pagamento.", lastMessageTime: "Ontem", unreadCount: 0 },
  { id: "ch3", participantName: "Virgínia Tembe", participantAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuALPtNGvThdZVePN5IuVjLbj1vgsnx1wQ_DK9GIbnVWUW_pWkTpO5KT_sZ0bsRHcPoeQzzEb8ssxy4YxW9dhAcg-GgMQQq7bDQakZ-1beDgmUZkPO_65USmxcL6Om-LOILT5lmylypRjhJbUdToIQOo70CRwxedsdfYV17Apoe1MUDPYhvoFFRy_N8pICyI4CiKMo9lTIOD6c2V-4e_9eMV0stSNIIqat8Q15T4a3sAB-35rDjZlRHg74zKhe38nTtveMXaMh8eK22V", participantRole: "Tutor", lastMessage: "Sem problema! Vejo-te na aula de Cálculo.", lastMessageTime: "15 Jun", unreadCount: 0 }
];

export const mockMessages: Mensagem[] = [
  { id: "m_1", senderName: "Keven Gulele", senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7COcwOKcMCFOww9-p9OfRW9i3gHwMPSpogFWEuqxdpLoDuMaI67tzsQ7Wvz8cbqBBfXT08u_pZ8ZptX0ClvjJGf70_wDsYwiwmrAUon9tA1nXEj3Adw453GVdGMoPcMLpTi4ArYvHFo9NKtOypRLnWgcRXO_AKIzqeFRv2NF-IzNnHRBPNshebDF6GOl9Z4hSFixIG8rYTgf1w32TO91LyF4rQkqEBZ_KKTUfx_CqPWShIBdz2A-3yL50I9MmrEIQq0kPK36axdIt", senderRole: "Tutor", content: "Olá Keven! Dúvidas sobre a ficha de regressão linear?", timestamp: "10:40 AM", unread: false, chatId: "ch1" },
  { id: "m_2", senderName: "Keven Gulele", senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2Q2-DUXyCvl9clOmukXUATsRAaZoDLQ02qyBRMKJmFbJEq8oEsyQm2syEISHXyUBv9M-k2C8eg8ktUTgL9b1R1qOcpScYiIMkIvNx6UgGXdLcpMbShLjUYEMHfssgDcIvysxzcWklGQF9Zqy0_UKnS075gizNqUYyX63PiI2tQz2POwdpfXCttMNJcQIwkydkoWqH0fdUAZvngDSX0qwk5fdRnIJxeco1qfv2swshNVeIj9PBy1cFZbskAzAimPsGd5188-5D7V0j", senderRole: "Student", content: "Sim professor, estou um pouco perdido no passo da fórmula de ANOVA residual.", timestamp: "10:43 AM", unread: false, chatId: "ch1" },
  { id: "m_3", senderName: "Keven Gulele", senderAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7COcwOKcMCFOww9-p9OfRW9i3gHwMPSpogFWEuqxdpLoDuMaI67tzsQ7Wvz8cbqBBfXT08u_pZ8ZptX0ClvjJGf70_wDsYwiwmrAUon9tA1nXEj3Adw453GVdGMoPcMLpTi4ArYvHFo9NKtOypRLnWgcRXO_AKIzqeFRv2NF-IzNnHRBPNshebDF6GOl9Z4hSFixIG8rYTgf1w32TO91LyF4rQkqEBZ_KKTUfx_CqPWShIBdz2A-3yL50I9MmrEIQq0kPK36axdIt", senderRole: "Tutor", content: "Olá Keven, a aula 8 já está disponível na plataforma. Bons estudos! Dei lá uma explicação detalhada.", timestamp: "10:45 AM", unread: true, chatId: "ch1" }
];

export const mockNotifications: Notificacao[] = [
  { id: "n1", title: "Pagamento Aprovado", message: "O seu comprovativo da cadeira de Química Orgânica foi validado com sucesso.", type: "payment", date: "Há 1 hora", unread: true },
  { id: "n2", title: "Nova Aula Disponível", message: "A Aula 8: Regressão Linear Simples de Bioestatística foi publicada.", type: "lesson", date: "Há 3 horas", unread: true },
  { id: "n3", title: "Nova Mensagem", message: "O explicador Keven Gulele enviou uma mensagem para você.", type: "message", date: "Há 4 horas", unread: false },
  { id: "n4", title: "Manutenção do Sistema", message: "A plataforma estará em atualização no domingo às 02:00 AM.", type: "system", date: "Há 1 dia", unread: false }
];
