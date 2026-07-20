"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockCourses, mockTutors, mockCourseTutors } from "@/lib/mockData";
import { SocialLinks } from "@/components/social-links";

export default function LandingPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState({
    platform_name: "Kingsman Academy",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    fetch("/api/settings").then((response) => response.json()).then((data) => setPlatform((current) => ({ ...current, ...data }))).catch(() => undefined);
  }, []);
  
  // Testimonial carousel mock state
  const testimonials = [
    {
      text: "A Kingsman Academy não é apenas uma plataforma de explicações, é um divisor de águas. Consegui passar em Bioquímica com uma nota excelente graças à metodologia focada e aos materiais exclusivos que não encontrei em nenhum outro lugar.",
      author: "Sara Mondlane",
      role: "Estudante de Engenharia Alimentar",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuChn8tcm2NA_3DOkZABdCBItv5DG0Pd4aakjXysDeSX63fE7MpIYLdL8f9PoXA1cC6zsQHQKvnmwp5troPwC8pDNiGr5dvj4u_ZtOHX6RVmI3trEy4BcxmJcsq-qiGSlPDTZoSwP5Ka2itPgTKMZ1U3Dc-74bXBlCusBcWMFK49oS40cW7BNyEmMNHM4g9OTJD4b0bSv5TYkg_vMKHEmugcmy5GlUzxfiBisVuAm42JIBj3M1Ps_cyRviOKVl02wdfykp7e9IXGov0c"
    },
    {
      text: "A clareza dos explicadores nas matérias mais áridas me ajudou a sair de uma nota de reprovação para um 16 em Bioestatística. Recomendo o plano mensal!",
      author: "Artur Langa",
      role: "Estudante de Medicina, UEM",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2Q2-DUXyCvl9clOmukXUATsRAaZoDLQ02qyBRMKJmFbJEq8oEsyQm2syEISHXyUBv9M-k2C8eg8ktUTgL9b1R1qOcpScYiIMkIvNx6UgGXdLcpMbShLjUYEMHfssgDcIvysxzcWklGQF9Zqy0_UKnS075gizNqUYyX63PiI2tQz2POwdpfXCttMNJcQIwkydkoWqH0fdUAZvngDSX0qwk5fdRnIJxeco1qfv2swshNVeIj9PBy1cFZbskAzAimPsGd5188-5D7V0j"
    }
  ];
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="bg-[#0A0A0A] text-[#f2dceb] font-sans selection:bg-primary selection:text-black">
      {/* Background decoration elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="scanline" style={{ animationDelay: "0s" }}></div>
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
          <div className="relative z-20 max-w-4xl">
            <span className="text-primary font-bold tracking-[0.3em] text-[10px] md:text-xs uppercase mb-4 block">Elite Academic Performance</span>
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
        <section className="py-16 max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">70+</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Estudantes</p>
            </div>
            <div className="glass-panel p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">15+</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Cadeiras</p>
            </div>
            <div className="glass-panel p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">12</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Explicadores</p>
            </div>
            <div className="glass-panel p-6 rounded-xl text-center shadow-xl">
              <h3 className="text-primary font-playfair text-3xl md:text-4xl font-bold mb-1">4</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Universidades</p>
            </div>
          </div>
        </section>

        {/* SEÇÃO CADEIRAS */}
        <section className="py-20 bg-surface-container-low/30" id="cadeiras">
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
              {mockCourses.slice(0, 6).map((course) => {
                const courseTutor = mockCourseTutors.find((ct) => ct.course_id === course.id);
                const tutor = courseTutor ? mockTutors.find((t) => t.user_id === courseTutor.tutor_id) || mockTutors[0] : mockTutors[0];
                return (
                  <div key={course.id} className="glass-panel p-6 rounded-xl group hover:border-primary/40 transition-all duration-300">
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
                      <div className="w-9 h-9 rounded-full bg-surface-variant overflow-hidden border border-primary/20">
                        <img className="w-full h-full object-cover" src={tutor.avatar_url || ""} alt={tutor.full_name} />
                      </div>
                      <span className="text-sm font-semibold text-on-surface">{tutor.full_name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SEÇÃO EXPLICADORES */}
        <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12" id="explicadores">
          <h2 className="font-playfair text-3xl md:text-4xl text-on-surface font-bold mb-10 text-center uppercase tracking-tight">
            O Nosso <span className="text-primary italic">Corpo Docente</span> de Elite
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Keven Gulele Feature */}
            <div className="md:col-span-2 glass-panel p-6 rounded-xl overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="w-full h-48 rounded-lg overflow-hidden mb-6 border border-primary/10">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={mockTutors[0].avatar_url || ""} 
                    alt={mockTutors[0].full_name} 
                  />
                </div>
                <h3 className="font-playfair text-2xl text-on-surface font-bold">{mockTutors[0].full_name}</h3>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3 mt-1">
                  Explicador de Excelência
                </p>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                  {mockTutors[0].university}
                </p>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-4 text-xs text-on-surface-variant/80 font-semibold">
                <span>⭐ 4.9 Classificação</span>
                <span>👤 124 Alunos</span>
              </div>
            </div>

            {/* Next 3 grid items */}
            {mockTutors.slice(1, 4).map((tutor) => (
              <div key={tutor.user_id} className="glass-panel p-6 rounded-xl text-center flex flex-col items-center justify-between group hover:scale-[1.02] transition-all">
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
                  ⭐ 4.8 (100+ avaliações)
                </div>
              </div>
            ))}

            <div className="md:col-span-5 glass-panel p-6 rounded-xl flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/3 h-48 rounded-lg overflow-hidden border border-primary/10">
                <img className="w-full h-full object-cover" src={mockTutors[4].avatar_url || ""} alt={mockTutors[4].full_name} />
              </div>
              <div className="flex-1">
                <h3 className="font-playfair text-2xl text-on-surface font-bold">{mockTutors[4].full_name}</h3>
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3 mt-1">
                  Especialista
                </p>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {mockTutors[4].university}
                </p>
                <div className="flex gap-6 mt-4 text-xs font-semibold text-[#808080]">
                  <span>⭐ 4.9 Classificação</span>
                  <span>📚 50+ Aulas Publicadas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREÇOS */}
        <section className="py-20 bg-surface-container-highest/10" id="planos">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl text-on-surface uppercase font-bold">Planos de Acesso</h2>
              <p className="text-on-surface-variant text-sm mt-2">Escolha o nível de suporte ideal para o seu semestre.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plano 1 */}
              <div className="glass-panel p-8 rounded-xl flex flex-col justify-between h-full border border-white/5">
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
              <div className="glass-panel p-8 rounded-xl flex flex-col justify-between h-full border-2 border-primary relative transform lg:-translate-y-4 shadow-2xl shadow-primary/20 bg-[#1a0a1a]/60">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Mais Popular</div>
                <div>
                  <h3 className="font-playfair text-xl text-on-surface font-bold mb-4">Mensal DCB</h3>
                  <div className="mb-8">
                    <span className="text-3xl font-bold text-primary">750 MT</span>
                    <span className="text-on-surface-variant text-sm">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Acesso Ilimitado à Cadeira</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Biblioteca Digital de Exercícios</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Grupo de Estudo Exclusivo</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span> Suporte 24/7 via Chat</li>
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
              <div className="glass-panel p-8 rounded-xl flex flex-col justify-between h-full border border-white/5">
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

        {/* TESTEMUNHOS */}
        <section className="py-20 max-w-[1440px] mx-auto px-6 md:px-12 overflow-hidden">
          <div className="glass-panel p-8 md:p-12 rounded-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12 relative">
            <div className="absolute top-8 left-8 text-primary opacity-20 transform -translate-x-4 -translate-y-4 select-none">
              <span className="material-symbols-outlined text-[100px] md:text-[140px] leading-none">format_quote</span>
            </div>
            
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-primary/20 shrink-0 relative z-10">
              <img className="w-full h-full object-cover" src={testimonials[activeTestimonial].avatar} alt="Estudante" />
            </div>
            
            <div className="relative z-10 flex-1">
              <p className="font-playfair text-lg md:text-xl text-on-surface italic mb-6 leading-relaxed">
                &ldquo;{testimonials[activeTestimonial].text}&rdquo;
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="font-playfair text-lg text-primary font-bold">{testimonials[activeTestimonial].author}</h4>
                  <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">{testimonials[activeTestimonial].role}</p>
                </div>
                
                {/* Dots indicator to toggle */}
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        i === activeTestimonial ? "bg-[#FF48FF] w-6" : "bg-[#808080]"
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
              <li><a className="hover:text-primary transition-colors" href="#cadeiras">Bioestatística</a></li>
              <li><a className="hover:text-primary transition-colors" href="#cadeiras">Química Orgânica</a></li>
              <li><a className="hover:text-primary transition-colors" href="#cadeiras">Fisiologia Animal</a></li>
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
