"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select_input";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    confirmarPassword: "",
    contacto: "",
    linkedin: "",
    universidade: "UEM - Univ. Eduardo Mondlane",
    curso: "",
    ano: "1º Ano",
    termsAccepted: false,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, termsAccepted: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmarPassword) {
      setError("As palavras-passe não coincidem");
      setLoading(false);
      return;
    }

    // 1. Cria user no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Erro ao criar conta");
      setLoading(false);
      return;
    }

    // Parse year of study (e.g. "1º Ano" -> 1)
    const yearParsed = parseInt(formData.ano.replace(/\D/g, "")) || 1;

    // 2. Cria profile na tabela profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authData.user.id,
      full_name: formData.nome,
      email: formData.email,
      phone: formData.contacto,
      university: formData.universidade,
      course: formData.curso,
      year_of_study: yearParsed,
      role: "ESTUDANTE", // default
      status: "active",
      avatar_url: avatarPreview || undefined
    });

    if (profileError) {
      setError("Erro ao criar perfil. Tente novamente.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login?registered=true");
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleRegister();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Stepper Indicator */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 w-full h-[2px] bg-surface-container-high -translate-y-1/2 z-0"></div>
          <div
            className="absolute top-4 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>

          {/* Step Dots */}
          {[
            { step: 1, label: "Conta" },
            { step: 2, label: "Perfil" },
            { step: 3, label: "Univer" },
            { step: 4, label: "Confir" }
          ].map((s) => {
            const isCompleted = s.step < currentStep;
            const isActive = s.step === currentStep;
            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                    isCompleted
                      ? "bg-primary text-black border-transparent"
                      : isActive
                        ? "bg-primary text-black border-transparent shadow-[0_0_15px_rgba(255,170,245,0.4)]"
                        : "bg-surface-container-high text-on-surface-variant border-border/10"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-xs font-bold">check</span>
                  ) : (
                    s.step
                  )}
                </div>
                <span className={`text-[9px] uppercase font-bold tracking-wider ${isActive || isCompleted ? "text-primary" : "text-on-surface-variant"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-step Form Container */}
      <div className="w-full max-w-md glass-panel rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="scanning-line opacity-20"></div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Step 1: Conta */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-playfair text-xl text-on-surface mb-4 font-bold">Credenciais de Acesso</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Nome Completo</label>
                  <Input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Artur Langa"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Email Institucional</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="artur.langa@uem.ac.mz"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Senha</label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Confirmar</label>
                    <Input
                      type="password"
                      name="confirmarPassword"
                      value={formData.confirmarPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Perfil */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-playfair text-xl text-on-surface mb-4 font-bold">Informações Pessoais</h3>
              <div className="space-y-3">
                <div className="flex flex-col items-center mb-4">
                  <label className="w-20 h-20 rounded-full bg-surface-container border-2 border-dashed border-primary/30 flex items-center justify-center relative cursor-pointer hover:bg-surface-container-high transition-all group overflow-hidden">
                    {avatarPreview ? (
                      <img className="absolute inset-0 w-full h-full object-cover" src={avatarPreview} alt="Avatar preview" />
                    ) : (
                      <span className="material-symbols-outlined text-2xl text-on-surface-variant group-hover:text-primary">photo_camera</span>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                  <p className="text-[10px] font-bold text-on-surface-variant mt-2 uppercase tracking-wider">Foto de Perfil</p>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Contacto (Telemóvel)</label>
                  <Input
                    type="tel"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleInputChange}
                    placeholder="+258 84 000 0000"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">LinkedIn (Opcional)</label>
                  <Input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="linkedin.com/in/usuario"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Universidade */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-playfair text-xl text-on-surface mb-4 font-bold">Dados Académicos</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Universidade</label>
                  <SelectInput name="universidade" value={formData.universidade} onChange={handleInputChange}>
                    <option>UEM - Univ. Eduardo Mondlane</option>
                    <option>UP - Univ. Pedagógica</option>
                    <option>ISCTEM</option>
                    <option>USTM</option>
                    <option>UCM - Univ. Católica</option>
                  </SelectInput>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Curso</label>
                  <Input
                    type="text"
                    name="curso"
                    value={formData.curso}
                    onChange={handleInputChange}
                    placeholder="Engenharia Informática"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Ano de Frequência</label>
                  <SelectInput name="ano" value={formData.ano} onChange={handleInputChange}>
                    <option>1º Ano</option>
                    <option>2º Ano</option>
                    <option>3º Ano</option>
                    <option>4º Ano</option>
                    <option>5º Ano</option>
                    <option>Finalista</option>
                  </SelectInput>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmar */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-playfair text-xl text-on-surface mb-4 font-bold">Resumo do Registo</h3>
              <div className="space-y-2 bg-[#1b1019]/40 p-4 rounded-lg border border-primary/10 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant font-bold uppercase">Estudante</span>
                  <span className="font-bold text-on-surface">{formData.nome || "Não preenchido"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-2">
                  <span className="text-on-surface-variant font-bold uppercase">Email</span>
                  <span className="font-bold text-on-surface">{formData.email || "Não preenchido"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-2">
                  <span className="text-on-surface-variant font-bold uppercase">Instituição</span>
                  <span className="font-bold text-on-surface">{formData.universidade}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-on-surface-variant font-bold uppercase">Curso</span>
                  <span className="font-bold text-on-surface">{formData.curso || "Não preenchido"} ({formData.ano})</span>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={handleCheckboxChange}
                  className="mt-1 h-4 w-4 rounded border-none bg-surface-container text-primary focus:ring-primary cursor-pointer"
                />
                <label className="text-xs text-on-surface-variant leading-relaxed" htmlFor="terms">
                  Aceito os <a className="text-primary hover:underline font-bold" href="#">Termos de Serviço</a> e a <a className="text-primary hover:underline" href="#">Política de Privacidade</a> da Kingsman Academy.
                </label>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 font-semibold">{error}</p>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className={`flex-1 py-3 font-bold uppercase tracking-wider ${currentStep === 1 ? "invisible" : ""}`}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              isLoading={loading}
              disabled={currentStep === totalSteps && !formData.termsAccepted}
              className="flex-[2] py-3 font-bold uppercase tracking-wider"
            >
              {currentStep === totalSteps ? "Confirmar Registo" : "Próximo Passo"}
            </Button>
          </div>
        </form>

        {/* Help link */}
        <div className="mt-6 text-center border-t border-white/5 pt-4">
          <p className="text-xs text-on-surface-variant">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              Entrar agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
