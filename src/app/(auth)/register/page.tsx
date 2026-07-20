"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select_input";
import { createClient } from "@/lib/supabase/client";
import { EmailMagicLinkForm } from "@/components/auth/email-magic-link-form";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states mapped to DB schema
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    password: string;
    confirmarPassword: string;
    phone: string;
    university: string;
    course: string;
    year_of_study: number;
    termsAccepted: boolean;
  }>({
    full_name: "",
    email: "",
    password: "",
    confirmarPassword: "",
    phone: "",
    university: "UEM",
    course: "",
    year_of_study: 1,
    termsAccepted: false,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "year_of_study") {
      setFormData((prev) => ({ ...prev, year_of_study: parseInt(value, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submission with Supabase
      if (formData.password !== formData.confirmarPassword) {
        setError("As senhas não coincidem.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Sign up user (Trigger creates row in profiles table with default role ESTUDANTE)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Upsert also covers projects where the auth trigger was not installed yet.
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              user_id: authData.user.id,
              full_name: formData.full_name,
              email: formData.email,
              phone: formData.phone,
              university: formData.university,
              course: formData.course,
              year_of_study: formData.year_of_study,
              role: "ESTUDANTE",
              status: "active",
              // avatar_url logic would require storage upload first, skipping for now
            }, { onConflict: "user_id" });

          if (profileError) throw profileError;

          // Note: Depending on email confirmation settings in Supabase, 
          // the user might need to check their email first. 
          // If auto-confirm is enabled, they are logged in.
          router.push("/estudante");
        }
      } catch (err: any) {
        console.error("Registration error:", err);
        setError(err.message || "Ocorreu um erro ao criar a conta.");
      } finally {
        setLoading(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${isCompleted
                    ? "bg-primary text-black border-transparent"
                    : isActive
                      ? "bg-primary text-black border-transparent shadow-[0_0_15px_rgba(255,170,245,0.4)]"
                      : "bg-surface-container-high text-on-surface-variant border-border/10"
                    }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
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

        <div className="relative z-10 mb-5">
          <EmailMagicLinkForm onError={setError} />
          <div className="mt-4 flex items-center gap-3">
            <hr className="flex-1 border-border/10" />
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant/60">ou preencher manualmente</span>
            <hr className="flex-1 border-border/10" />
          </div>
          {error && currentStep !== 4 && <p className="mt-3 text-xs font-semibold text-red-400">{error}</p>}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 relative z-10">
          {/* Step 1: Conta */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-playfair text-xl text-on-surface mb-4 font-bold">Credenciais de Acesso</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Nome Completo</label>
                  <Input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+258 84 000 0000"
                    required
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
                  <SelectInput name="university" value={formData.university} onChange={handleInputChange}>
                    <option value="UEM">UEM - Univ. Eduardo Mondlane</option>
                    <option value="UP">UP - Univ. Pedagógica</option>
                    <option value="ISCTEM">ISCTEM</option>
                    <option value="USTM">USTM</option>
                    <option value="UCM">UCM - Univ. Católica</option>
                  </SelectInput>
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Curso</label>
                  <Input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="Engenharia Informática"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Ano de Frequência</label>
                  <SelectInput name="year_of_study" value={String(formData.year_of_study)} onChange={handleInputChange}>
                    <option value="1">1º Ano</option>
                    <option value="2">2º Ano</option>
                    <option value="3">3º Ano</option>
                    <option value="4">4º Ano</option>
                    <option value="5">5º Ano / Finalista</option>
                  </SelectInput>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmar */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-playfair text-xl text-on-surface mb-4 font-bold">Resumo do Registo</h3>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2 bg-[#1b1019]/40 p-4 rounded-lg border border-primary/10 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant font-bold uppercase">Estudante</span>
                  <span className="font-bold text-on-surface">{formData.full_name || "Não preenchido"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-2">
                  <span className="text-on-surface-variant font-bold uppercase">Email</span>
                  <span className="font-bold text-on-surface">{formData.email || "Não preenchido"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-2">
                  <span className="text-on-surface-variant font-bold uppercase">Instituição</span>
                  <span className="font-bold text-on-surface">{formData.university}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-on-surface-variant font-bold uppercase">Curso</span>
                  <span className="font-bold text-on-surface">{formData.course || "Não preenchido"} ({formData.year_of_study < 5 ? `${formData.year_of_study}º Ano` : "5º Ano / Finalista"})</span>
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

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4 relative z-10">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={loading}
              className={`flex-1 py-3 font-bold uppercase tracking-wider ${currentStep === 1 ? "invisible" : ""}`}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              disabled={(currentStep === totalSteps && !formData.termsAccepted) || loading}
              className="flex-[2] py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {loading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
              {currentStep === totalSteps ? (loading ? "Criando Conta..." : "Confirmar Registo") : "Próximo Passo"}
            </Button>
          </div>
        </form>

        {/* Help link */}
        <div className="mt-6 text-center border-t border-white/5 pt-4 relative z-10">
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
