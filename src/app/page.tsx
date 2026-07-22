"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SocialLinks } from "@/components/social-links";

interface LandingTutor {
  id: string;
  full_name: string;
  university?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

interface LandingCourse {
  id: string;
  name: string;
  department?: string | null;
  university?: string | null;
  description: string;
  price_monthly: number;
  tutors: LandingTutor[];
}

interface LandingCatalog {
  courses: LandingCourse[];
  tutors: LandingTutor[];
  stats: { courses: number; tutors: number; students: number };
}

const fallbackTutors: LandingTutor[] = [
  {
    id: "keven",
    full_name: "Keven Gulele",
    university: "Universidade Eduardo Mondlane",
    bio: "Licenciando em Biologia Aplicada pela UEM, conta com cerca de três anos de experiência no acompanhamento de estudantes do ensino secundário e universitário.",
    avatar_url: "https://res.cloudinary.com/ddsjybint/image/upload/v1784727447/keven_yzixgu.jpg",
  },
  {
    id: "dulce",
    full_name: "Dulce Ezequiel",
    university: "Universidade Eduardo Mondlane",
    bio: "Licencianda em Ciências Biológicas pela UEM, com experiência em explicações e acompanhamento académico, especialmente na área de Estatística.",
    avatar_url: "https://res.cloudinary.com/ddsjybint/image/upload/v1784727460/dulce_xgovcc.jpg",
  },
  {
    id: "naeem",
    full_name: "Naeem Julaya",
    university: "Universidade Eduardo Mondlane",
    bio: "Licenciando em Engenharia Informática pela UEM e explicador de Análise Matemática, Eletrónica Digital e Eletrónica Analógica.",
    avatar_url: "https://res.cloudinary.com/ddsjybint/image/upload/v1784732806/nnn_fwzgrm.png",
  },
  {
    id: "virginia",
    full_name: "Virgínia Tembe",
    university: "Universidade Eduardo Mondlane",
    bio: "Licencianda em Biologia Aplicada pela UEM, com experiência em explicações de Biologia e Química e facilidade na transmissão de conteúdos.",
    avatar_url: "https://res.cloudinary.com/ddsjybint/image/upload/v1784727453/virginia_gya5sh.jpg",
  },
];

const fallbackCourses: LandingCourse[] = [
  ["Bioestatística", "DCB", "Aprenda a organizar, analisar e interpretar dados biológicos e de saúde, aplicando estatística a situações reais.", fallbackTutors[1]],
  ["Química Orgânica", "DCB", "Domine a estrutura, as propriedades e a reatividade dos compostos orgânicos através de explicações e exercícios.", fallbackTutors[0]],
  ["Fisiologia Animal", "DCB", "Compreenda o funcionamento integrado dos sistemas animais e os mecanismos de regulação dos organismos.", fallbackTutors[3]],
  ["Análise Matemática", "DMI", "Desenvolva o domínio de cálculo e equações diferenciais com uma abordagem prática e orientada à resolução.", fallbackTutors[2]],
  ["Electrónica Analógica", "FENG", "Compreenda díodos, transístores, amplificadores e circuitos analógicos através da análise prática.", fallbackTutors[2]],
  ["Electrónica Digital", "FENG", "Aprenda álgebra booleana, portas lógicas e circuitos combinatórios e sequenciais.", fallbackTutors[2]],
].map(([name, department, description, tutor], index) => ({
  id: `fallback-${index}`,
  name: name as string,
  department: department as string,
  description: description as string,
  price_monthly: 650,
  tutors: [tutor as LandingTutor],
}));

const featuredCourseOrder = [
  "Bioestatística",
  "Química Orgânica",
  "Fisiologia Animal",
  "Análise Matemática",
  "Electrónica Analógica",
  "Electrónica Digital",
];

const featuredTutorOrder = ["Keven Gulele", "Dulce Ezequiel", "Naeem Julaya", "Virgínia Tembe"];

export default function LandingPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState({
    platform_name: "Kingsman Academy",
    contact_email: "",
    contact_phone: "",
  });
  const [catalog, setCatalog] = useState<LandingCatalog>({
    courses: fallbackCourses,
    tutors: fallbackTutors,
    stats: { courses: 12, tutors: 8, students: 0 },
  });

  useEffect(() => {
    fetch("/api/settings").then((response) => response.json()).then((data) => setPlatform((current) => ({ ...current, ...data }))).catch(() => undefined);
    fetch("/api/catalog")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.courses) && Array.isArray(data.tutors)) setCatalog(data);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = document.querySelectorAll<HTMLElement>("[data-landing-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => {
      element.classList.add("landing-reveal-ready");
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, [catalog]);

  const featuredCourses = useMemo(() => [...catalog.courses]
    .sort((a, b) => {
      const aIndex = featuredCourseOrder.indexOf(a.name);
      const bIndex = featuredCourseOrder.indexOf(b.name);
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    })
    .slice(0, 6), [catalog.courses]);

  const featuredTutors = useMemo(() => [...catalog.tutors]
    .filter((tutor) => tutor.avatar_url || tutor.bio)
    .sort((a, b) => {
      const aIndex = featuredTutorOrder.indexOf(a.full_name);
      const bIndex = featuredTutorOrder.indexOf(b.full_name);
      return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
    })
    .slice(0, 4), [catalog.tutors]);

  const highlights = [
    {
      title: "Acompanhamento que aproxima",
      text: "Aprenda com explicadores que transformam conteúdos complexos em explicações claras, exercícios orientados e acompanhamento próximo.",
      icon: "school",
    },
    {
      title: "Materiais sempre ao seu alcance",
      text: "Consulte fichas, PDFs, gravações e recursos gratuitos ou exclusivos da sua cadeira num espaço organizado para estudar melhor.",
      icon: "auto_stories",
    },
  ];

  const [activeHighlight, setActiveHighlight] = useState(0);

  return (
    <div className="landing-page bg-[#0A0A0A] text-[#f2dceb] font-sans selection:bg-primary selection:text-black">
      {/* Background decoration elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="scanline" style={{ animationDelay: "0s" }}></div>
        <div className="landing-orb landing-orb-one" />
        <div className="landing-orb landing-orb-two" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#150b14]/80 backdrop-blur-md border-b border-primary/10 h-20 shadow-md shadow-primary/5">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full flex items-center justify-between">
          <Link href="/" className="font-playfair text-[#FF48FF] font-bold text-lg md:text-xl tracking-tight">
            {platform.platform_name.toUpperCase()}
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <a href="#cadeiras" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold">Cadeiras</a>
            <a href="#explicadores" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold">Explicadores</a>
            <a href="#planos" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold">Planos</a>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push("/login")}
              className="text-on-surface hover:text-primary transition-colors duration-200 font-semibold text-sm cursor-pointer"
            >
              Entrar
            </button>
            <button 
              onClick={() => router.push("/register")}
              className="magenta-gradient px-4 py-2 rounded-lg text-sm text-black font-bold shadow-lg shadow-primary/20 hover:brightness-110 hover:shadow-primary/30 transition-[filter,box-shadow] duration-200 cursor-pointer"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10">
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 md:px-12 pt-20 pb-16 relative overflow-hidden">
          <div className="landing-grid-glow absolute inset-0" />
          <div className="landing-float-chip landing-float-chip-left hidden lg:flex">
            <span className="material-symbols-outlined">menu_book</span>
            <span>{catalog.stats.courses} cadeiras ativas</span>
          </div>
          <div className="landing-float-chip landing-float-chip-right hidden lg:flex">
            <span className="material-symbols-outlined">workspace_premium</span>
            <span>Explicadores da UEM</span>
          </div>
          <div className="relative z-20 max-w-4xl landing-hero-enter">
            <span className="text-primary font-bold tracking-[0.3em] text-[10px] md:text-xs uppercase mb-4 block">Excelência académica</span>
            <h1 className="font-playfair text-4xl md:text-6xl text-on-surface mb-6 font-bold leading-tight uppercase tracking-tight">
              Eleve o seu <span className="text-primary italic">Desempenho</span> Académico
            </h1>
            <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
              Acesso exclusivo aos melhores explicadores e materiais de elite para garantir o seu sucesso nas cadeiras mais desafiantes da universidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push("/register")}
                className="magenta-gradient px-8 py-3.5 rounded-lg text-sm text-black font-bold shadow-xl shadow-primary/30 hover:brightness-110 hover:shadow-primary/40 transition-[filter,box-shadow] duration-200 cursor-pointer"
              >
                Começar Agora
              </button>
              <a 
                href="#cadeiras" 
                className="border border-primary/40 hover:border-primary px-8 py-3.5 rounded-lg text-sm text-primary font-semibold hover:bg-primary/10 transition-all flex items-center justify-center"
              >
                Ver Cadeiras
              </a>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-16 max-w-[1440px] mx-auto px-6 md:px-12" data-landing-reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-panel landing-card p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">{catalog.stats.courses}</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Cadeiras ativas</p>
            </div>
            <div className="glass-panel landing-card p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">{catalog.stats.tutors}</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Explicadores</p>
            </div>
            <div className="glass-panel landing-card p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">650 MT</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Por cadeira / mês</p>
            </div>
            <div className="glass-panel landing-card p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">24/7</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Materiais disponíveis</p>
            </div>
          </div>
        </section>

        {/* SEÇÃO CADEIRAS */}
        <section className="py-20 bg-surface-container-low/30" id="cadeiras" data-landing-reveal>
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
              <div>
                <span className="text-primary font-bold text-xs uppercase tracking-widest">Catálogo</span>
                <h2 className="font-playfair text-3xl text-on-surface mt-1 uppercase font-bold">Cadeiras Disponíveis</h2>
              </div>
              <button 
                onClick={() => router.push("/login")}
                className="text-on-surface-variant hover:text-primary text-sm font-bold flex items-center gap-2 mt-4 sm:mt-0 cursor-pointer"
              >
                Ver todas <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course, index) => {
                const tutor = course.tutors[0];
                return (
                  <div key={course.id} className="glass-panel landing-card landing-card-glow p-6 rounded-xl group" style={{ animationDelay: `${index * 80}ms` }}>
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase">
                        {course.department}
                      </span>
                      <span className="text-on-surface-variant font-bold text-sm">{course.price_monthly} MT/mês</span>
                    </div>
                    <h4 className="font-playfair text-xl text-on-surface font-bold mb-2 group-hover:text-primary transition-colors">
                      {course.name}
                    </h4>
                    <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                      <div className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {tutor?.avatar_url ? <img className="w-full h-full object-cover" src={tutor.avatar_url} alt={tutor.full_name} /> : tutor?.full_name?.charAt(0) || "K"}
                      </div>
                      <span className="text-sm font-semibold text-on-surface">{tutor?.full_name || "Equipa Kingsman"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SEÇÃO EXPLICADORES */}
        <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12" id="explicadores" data-landing-reveal>
          <h2 className="font-playfair text-3xl md:text-4xl text-on-surface font-bold mb-10 text-center uppercase tracking-tight">
            O Nosso <span className="text-primary italic">Corpo Docente</span> de Elite
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {featuredTutors[0] && <div className="md:col-span-2 glass-panel landing-card landing-card-glow p-6 rounded-xl overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="w-full h-48 rounded-lg overflow-hidden mb-6 border border-primary/10">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={featuredTutors[0].avatar_url || ""}
                    alt={featuredTutors[0].full_name}
                  />
                </div>
                <h3 className="font-playfair text-2xl text-on-surface font-bold">{featuredTutors[0].full_name}</h3>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3 mt-1">
                  Explicador de Excelência
                </p>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  {featuredTutors[0].bio}
                </p>
              </div>
              <div className="flex items-center gap-2 border-t border-white/5 pt-4 text-xs text-on-surface-variant/80 font-semibold">
                <span className="material-symbols-outlined text-primary text-base">school</span>
                <span>{featuredTutors[0].university || "Universidade Eduardo Mondlane"}</span>
              </div>
            </div>}

            {/* Next 3 grid items */}
            {featuredTutors.slice(1, 4).map((tutor) => (
              <div key={tutor.id} className="glass-panel landing-card p-6 rounded-xl text-center flex flex-col items-center justify-between group">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-2 border-primary/40 p-1 mb-4 group-hover:border-primary transition-colors">
                    <img className="w-full h-full object-cover rounded-full" src={tutor.avatar_url || ""} alt={tutor.full_name} />
                  </div>
                  <h4 className="font-playfair text-lg text-on-surface font-bold">{tutor.full_name}</h4>
                  <span className="text-primary/70 text-[10px] font-bold uppercase tracking-wider mt-1">
                    Explicador
                  </span>
                </div>
                <div className="w-full border-t border-white/5 pt-3 mt-6 text-[11px] text-on-surface-variant/70">
                  <p className="line-clamp-4 leading-relaxed">{tutor.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PREÇOS */}
        <section className="py-20 bg-surface-container-highest/10" id="planos" data-landing-reveal>
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl text-on-surface uppercase font-bold">Planos de Acesso</h2>
              <p className="text-on-surface-variant text-sm mt-2">Escolha o nível de suporte ideal para o seu semestre.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plano 1 */}
              <div className="glass-panel landing-card p-8 rounded-xl flex flex-col justify-between h-full border border-white/5">
                <div>
                  <h3 className="font-playfair text-xl text-on-surface font-bold mb-4">Acesso por Aula</h3>
                  <div className="mb-8">
                    <span className="text-3xl font-bold text-primary">150 MT</span>
                    <span className="text-on-surface-variant text-sm">/sessão</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> 1 Aula Presencial/Online</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Material de Apoio da Aula</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Resolução de Dúvidas</li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push("/login")}
                  className="w-full border border-primary/40 hover:border-primary py-3 rounded-lg text-sm text-primary font-bold hover:bg-primary/10 transition-all cursor-pointer"
                >
                  Selecionar
                </button>
              </div>

              {/* Plano 2 */}
              <div className="glass-panel landing-card landing-card-featured p-8 rounded-xl flex flex-col justify-between h-full border-2 border-primary relative transform lg:-translate-y-4 shadow-2xl shadow-primary/20 bg-[#1a0a1a]/60">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Mais Popular</div>
                <div>
                  <h3 className="font-playfair text-xl text-on-surface font-bold mb-4">Mensal por Cadeira</h3>
                  <div className="mb-8">
                    <span className="text-3xl font-bold text-primary">650 MT</span>
                    <span className="text-on-surface-variant text-sm">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Acesso Ilimitado à Cadeira</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Biblioteca Digital de Exercícios</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Grupo de Estudo Exclusivo</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Grupo exclusivo da cadeira</li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push("/register")}
                  className="w-full magenta-gradient py-3 rounded-lg text-sm text-black font-bold shadow-lg shadow-primary/30 hover:scale-[1.03] transition-all cursor-pointer"
                >
                  Assinar Agora
                </button>
              </div>

              {/* Plano 3 */}
              <div className="glass-panel landing-card p-8 rounded-xl flex flex-col justify-between h-full border border-white/5">
                <div>
                  <h3 className="font-playfair text-xl text-on-surface font-bold mb-4">Revisão Especial</h3>
                  <div className="mb-8">
                    <span className="text-3xl font-bold text-primary">Sob Consulta</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Intensivo Pré-Exame</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Resolução de Exames Passados</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Coaching Acadêmico</li>
                  </ul>
                </div>
                <button 
                  onClick={() => router.push("/login")}
                  className="w-full border border-primary/40 hover:border-primary py-3 rounded-lg text-sm text-primary font-bold hover:bg-primary/10 transition-all cursor-pointer"
                >
                  Contactar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* DESTAQUES DA EXPERIÊNCIA */}
        <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12 overflow-hidden" data-landing-reveal>
          <div className="glass-panel landing-card-glow p-8 md:p-12 rounded-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative">
            <div className="absolute top-8 left-8 text-primary opacity-20 transform -translate-x-4 -translate-y-4 select-none">
              <span className="material-symbols-outlined text-[100px] md:text-[140px] leading-none">{highlights[activeHighlight].icon}</span>
            </div>
            
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-primary/20 shrink-0 relative z-10 flex items-center justify-center bg-primary/10 landing-icon-float">
              <span className="material-symbols-outlined text-primary text-5xl md:text-7xl">{highlights[activeHighlight].icon}</span>
            </div>
            
            <div className="relative z-10 flex-1">
              <h3 className="font-playfair text-2xl text-primary font-bold mb-3">{highlights[activeHighlight].title}</h3>
              <p className="font-playfair text-lg md:text-xl text-on-surface mb-6 leading-relaxed">
                {highlights[activeHighlight].text}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">Experiência Kingsman Academy</p>
                </div>
                
                {/* Dots indicator to toggle */}
                <div className="flex gap-2">
                  {highlights.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveHighlight(i)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        i === activeHighlight ? "bg-[#FF48FF] w-6" : "bg-[#808080]"
                      }`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#150b14] border-t border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-12 py-16 max-w-[1440px] mx-auto">
          <div className="space-y-4 col-span-1">
            <h2 className="font-playfair text-xl text-primary tracking-tight font-bold">{platform.platform_name.toUpperCase()}</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Elevando o padrão da educação universitária em Moçambique através de tecnologia e expertise.
            </p>
            <SocialLinks />
          </div>
          <div>
            <h4 className="text-xs text-on-surface uppercase tracking-widest font-bold mb-4">Cadeiras</h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              {featuredCourses.slice(0, 3).map((course) => (
                <li key={course.id}><a className="hover:text-primary transition-colors" href="#cadeiras">{course.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs text-on-surface uppercase tracking-widest font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors" href="#planos">Planos e Preços</a></li>
              <li><a className="hover:text-primary transition-colors" href="#explicadores">Explicadores</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs text-on-surface uppercase tracking-widest font-bold mb-4">Suporte</h4>
            <ul className="space-y-2 text-xs text-on-surface-variant">
              {platform.contact_email && <li><a className="hover:text-primary transition-colors" href={`mailto:${platform.contact_email}`}>{platform.contact_email}</a></li>}
              {platform.contact_phone && <li><a className="hover:text-primary transition-colors" href={`tel:${platform.contact_phone}`}>{platform.contact_phone}</a></li>}
              <li><a className="hover:text-primary transition-colors" href="#">Privacidade</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        <div className="px-6 md:px-12 py-6 max-w-[1440px] mx-auto border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-on-surface-variant">
          <p>© 2026 Kingsman Academy. All Rights Reserved.</p>
          <p>Made with <span className="text-primary">♥</span> in Mozambique</p>
        </div>
      </footer>
    </div>
  );
}
