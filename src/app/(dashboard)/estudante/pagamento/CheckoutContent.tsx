"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PaymentMethod = "MPESA" | "EMOLA" | "TRANSFERENCIA";
interface PaymentSettings {
    mpesa_number: string;
    emola_number: string;
    bank_details: string;
    payment_review_hours: number;
}

type PaymentApiResult = {
    error?: string;
    path?: string;
    uploadUrl?: string;
    paymentId?: string;
};

async function readPaymentApiResult(response: Response): Promise<PaymentApiResult> {
    const body = await response.text();
    if (!body.trim()) {
        throw new Error(`O servidor respondeu sem dados (HTTP ${response.status}).`);
    }

    try {
        return JSON.parse(body) as PaymentApiResult;
    } catch {
        throw new Error(`O servidor devolveu uma resposta inválida (HTTP ${response.status}).`);
    }
}

export default function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId");
    const { user } = useAuth();
    const supabase = createClient();

    const [course, setCourse] = useState<any>(null);
    const [loadingInitial, setLoadingInitial] = useState(true);

    const [method, setMethod] = useState<PaymentMethod>("MPESA");
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(2);
    const [transactionId, setTransactionId] = useState<string>("");
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        mpesa_number: "849418723",
        emola_number: "863312201",
        bank_details: "BIM (NIB)\n000100000103813561457",
        payment_review_hours: 24,
    });

    useEffect(() => {
        fetch("/api/settings")
            .then((response) => response.json())
            .then((data) => setPaymentSettings((current) => ({ ...current, ...data })))
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        } else {
            router.push("/estudante/cadeiras");
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const { data } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (data) setCourse(data);
        } catch (error) {
            console.error("Error fetching course:", error);
        } finally {
            setLoadingInitial(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
            if (!allowedTypes.includes(selectedFile.type)) {
                alert("Envie o comprovativo em PDF, JPG ou PNG.");
                e.target.value = "";
                setFile(null);
                setFilePreview(null);
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) {
                alert("O comprovativo não pode ultrapassar 5 MB.");
                e.target.value = "";
                setFile(null);
                setFilePreview(null);
                return;
            }
            setFile(selectedFile);
            if (selectedFile.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const copyPaymentValue = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            window.setTimeout(() => setCopiedField((current) => current === field ? null : current), 2000);
        } catch {
            alert("Não foi possível copiar automaticamente. Selecione e copie o número manualmente.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !user || !course) return;

        setLoading(true);
        try {
            const proofResponse = await fetch("/api/payments/proof", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                    fileSize: file.size,
                }),
            });
            const proofResult = await readPaymentApiResult(proofResponse);
            if (!proofResponse.ok) throw new Error(proofResult.error || "Falha ao enviar o comprovativo");
            if (!proofResult.path || !proofResult.uploadUrl) {
                throw new Error("A resposta de preparação do comprovativo está incompleta");
            }
            const filePath = proofResult.path;

            const r2UploadResponse = await fetch(proofResult.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!r2UploadResponse.ok) throw new Error("O R2 não aceitou o comprovativo");

            const paymentResponse = await fetch("/api/payments/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course.id,
                    method,
                    proofPath: filePath,
                }),
            });
            const paymentResult = await readPaymentApiResult(paymentResponse);
            if (!paymentResponse.ok) throw new Error(paymentResult.error || "Falha ao registar o pagamento");
            if (!paymentResult.paymentId) throw new Error("O pagamento foi registado sem um identificador");

            setTransactionId(paymentResult.paymentId.split('-')[0].toUpperCase());
            setStep(3);
        } catch (error) {
            console.error("Error submitting payment:", error);
            alert(error instanceof Error ? error.message : "Ocorreu um erro ao submeter o comprovativo. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (loadingInitial) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-20 text-on-surface-variant font-medium">Cadeira não encontrada.</div>;
    }

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto relative">
            {/* Visual Stepper */}
            <div className="flex items-center justify-center mb-10">
                <div className="flex items-center w-full max-w-2xl">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary mb-2 font-bold text-xs">
                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Resumo</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-primary mx-4 mb-6"></div>

                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 font-bold transition-all ${step >= 2
                                ? "bg-primary text-black shadow-lg shadow-primary/40 ring-4 ring-primary/20"
                                : "border-2 border-surface-container text-on-surface-variant bg-surface-container-low"
                            }`}>
                            {step > 2 ? (
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            ) : (
                                <span className="material-symbols-outlined">payments</span>
                            )}
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= 2 ? "text-primary" : "text-on-surface-variant"}`}>
                            Pagamento
                        </span>
                    </div>
                    <div className={`flex-1 h-[2px] mx-4 mb-6 transition-all ${step >= 3 ? "bg-primary" : "bg-surface-container"}`}></div>

                    <div className={`flex flex-col items-center ${step < 3 ? "opacity-45" : ""}`}>
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 font-bold text-xs ${step >= 3
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-surface-container text-on-surface-variant"
                            }`}>
                            <span className="material-symbols-outlined text-sm">verified</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Confirmação</span>
                    </div>
                </div>
            </div>

            {step === 2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h3 className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-4">Escolha o Método</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div
                                    onClick={() => setMethod("MPESA")}
                                    className={`glass-panel p-5 rounded-xl border relative cursor-pointer group hover:scale-[1.02] transition-all flex flex-col justify-between ${method === "MPESA" ? "border-2 border-primary" : "border-primary/10"
                                        }`}
                                >
                                    {method === "MPESA" && (
                                        <div className="absolute top-2.5 right-2.5 text-primary">
                                            <span className="material-symbols-outlined text-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                check_circle
                                            </span>
                                        </div>
                                    )}
                                    <div className="w-12 h-12 bg-[#E61C23] rounded-lg flex items-center justify-center mb-4 text-white font-bold text-xl select-none">
                                        M
                                    </div>
                                    <div>
                                        <p className="font-playfair text-lg text-on-surface font-bold">M-Pesa</p>
                                        <p className="text-[10px] text-[#808080] font-semibold mt-0.5">Vodacom Mozambique</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setMethod("EMOLA")}
                                    className={`glass-panel p-5 rounded-xl border relative cursor-pointer group hover:scale-[1.02] transition-all flex flex-col justify-between ${method === "EMOLA" ? "border-2 border-primary" : "border-primary/10"
                                        }`}
                                >
                                    {method === "EMOLA" && (
                                        <div className="absolute top-2.5 right-2.5 text-primary">
                                            <span className="material-symbols-outlined text-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                check_circle
                                            </span>
                                        </div>
                                    )}
                                    <div className="w-12 h-12 bg-[#F37021] rounded-lg flex items-center justify-center mb-4 text-white font-bold text-xl select-none">
                                        e
                                    </div>
                                    <div>
                                        <p className="font-playfair text-lg text-on-surface font-bold">e-Mola</p>
                                        <p className="text-[10px] text-[#808080] font-semibold mt-0.5">Movitel S.A.</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setMethod("TRANSFERENCIA")}
                                    className={`glass-panel p-5 rounded-xl border relative cursor-pointer group hover:scale-[1.02] transition-all flex flex-col justify-between ${method === "TRANSFERENCIA" ? "border-2 border-primary" : "border-primary/10"
                                        }`}
                                >
                                    {method === "TRANSFERENCIA" && (
                                        <div className="absolute top-2.5 right-2.5 text-primary">
                                            <span className="material-symbols-outlined text-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                check_circle
                                            </span>
                                        </div>
                                    )}
                                    <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center mb-4 text-primary text-xl select-none">
                                        <span className="material-symbols-outlined text-2xl">account_balance</span>
                                    </div>
                                    <div>
                                        <p className="font-playfair text-lg text-on-surface font-bold">Banco</p>
                                        <p className="text-[10px] text-[#808080] font-semibold mt-0.5">Transferência Direta</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4 text-amber-400">
                                <span className="material-symbols-outlined">info</span>
                                <h4 className="text-xs uppercase font-bold tracking-wider">
                                    Instruções de Pagamento {method}
                                </h4>
                            </div>

                            {method === "MPESA" && (
                                <ol className="space-y-3 text-sm text-on-surface-variant font-medium">
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                                        <p>Abra o menu M-Pesa no seu telemóvel.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                                        <p>Selecione a opção para transferir dinheiro.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                                        <div className="flex-1">
                                            <p className="mb-2">Envie para o número M-Pesa:</p>
                                            <CopyablePaymentValue
                                                value={paymentSettings.mpesa_number || "Não configurado"}
                                                copied={copiedField === "mpesa"}
                                                onCopy={() => copyPaymentValue(paymentSettings.mpesa_number, "mpesa")}
                                            />
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">4</span>
                                        <p>Introduza o valor total de <span className="text-primary font-bold">{course.price_monthly} MT</span>.</p>
                                    </li>
                                </ol>
                            )}

                            {method === "EMOLA" && (
                                <ol className="space-y-3 text-sm text-on-surface-variant font-medium">
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                                        <p>Abra o menu e-Mola no seu telemóvel Movitel.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                                        <p>Selecione a opção para transferir dinheiro.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                                        <div className="flex-1">
                                            <p className="mb-2">Envie para a conta e-Mola de <strong className="text-amber-200">Keven Gulele</strong>:</p>
                                            <CopyablePaymentValue
                                                value={paymentSettings.emola_number || "Não configurado"}
                                                copied={copiedField === "emola"}
                                                onCopy={() => copyPaymentValue(paymentSettings.emola_number, "emola")}
                                            />
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="bg-amber-500/20 text-amber-400 w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs font-bold">4</span>
                                        <p>Confirme o valor de <span className="text-primary font-bold">{course.price_monthly} MT</span>.</p>
                                    </li>
                                </ol>
                            )}

                            {method === "TRANSFERENCIA" && (
                                <div className="space-y-4 text-sm text-on-surface-variant font-medium">
                                    <p>Efectue a transferência bancária para a nossa conta institucional e anexe o comprovativo:</p>
                                    <div className="bg-[#0A0A0A]/40 p-4 rounded-lg border border-amber-500/10 space-y-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">BIM — NIB</p>
                                        <CopyablePaymentValue
                                            value="000100000103813561457"
                                            copied={copiedField === "nib"}
                                            onCopy={() => copyPaymentValue("000100000103813561457", "nib")}
                                        />
                                        {paymentSettings.bank_details && !paymentSettings.bank_details.includes("000100000103813561457") && (
                                            <p className="whitespace-pre-wrap text-xs text-amber-200">{paymentSettings.bank_details}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <h3 className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-4">Comprovativo de Pagamento</h3>
                                <label className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 hover:border-primary transition-all">
                                    <span className="material-symbols-outlined text-primary text-5xl mb-4">cloud_upload</span>
                                    <p className="font-playfair text-lg text-on-surface font-bold text-center">
                                        {file ? file.name : "Clique ou arraste o comprovativo"}
                                    </p>
                                    <p className="text-xs text-on-surface-variant/70 text-center mt-2 font-semibold">
                                        Suporta PDF, JPG ou PNG (Máx 5MB)
                                    </p>
                                    <input type="file" className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} />
                                </label>
                            </div>

                            {filePreview && (
                                <Card className="p-4 flex flex-col items-center border border-primary/20">
                                    <p className="text-xs text-primary font-bold mb-3 uppercase tracking-wider">Pré-visualização do Comprovativo</p>
                                    <div className="max-w-[200px] rounded overflow-hidden shadow-md">
                                        <img className="w-full h-auto object-contain" src={filePreview} alt="Comprovativo Preview" />
                                    </div>
                                </Card>
                            )}
                        </form>
                    </div>

                    <div className="lg:col-span-4">
                        <Card className="p-6 space-y-6 sticky top-24 border-primary/20 magenta-glow">
                            <h3 className="font-playfair text-xl font-bold text-on-surface mb-6 uppercase border-b border-border/10 pb-4">
                                Resumo do Pedido
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-start pb-4 border-b border-border/10">
                                    <div>
                                        <p className="text-sm font-bold text-on-surface">{course.name}</p>
                                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wide mt-0.5">Matrícula Semestral</p>
                                    </div>
                                    <span className="text-sm font-bold text-on-surface">{course.price_monthly} MT</span>
                                </div>

                                <div className="flex justify-between text-xs text-on-surface-variant font-bold">
                                    <span>Taxa de Processamento</span>
                                    <span>0 MT</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-border/10">
                                <span className="font-playfair text-base font-bold text-on-surface-variant">TOTAL</span>
                                <span className="font-playfair text-3xl font-bold text-primary">{course.price_monthly} MT</span>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={!file || loading}
                                variant={file ? "primary" : "secondary"}
                                className={`w-full py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${!file ? "cursor-not-allowed opacity-60" : ""
                                    }`}
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined">{file ? "lock" : "lock_open"}</span>
                                )}
                                {loading ? "Processando..." : "Confirmar Pagamento"}
                            </Button>

                            <p className="text-[9px] text-[#808080] text-center uppercase tracking-wider font-semibold">
                                Ambiente Seguro & Encriptado Kingsman
                            </p>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card className="max-w-xl mx-auto p-10 text-center space-y-6 border-primary/20 magenta-glow">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(0,229,160,0.2)]">
                        <span className="material-symbols-outlined text-4xl font-bold">verified</span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-playfair text-2xl font-bold text-on-surface uppercase">Comprovativo Submetido!</h3>
                        <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                            O seu pagamento para a cadeira <span className="text-primary font-bold">{course.name}</span> foi enviado para a coordenação.
                        </p>
                    </div>

                    <div className="p-4 bg-[#1b1019]/40 border border-primary/10 rounded-lg text-xs space-y-1 max-w-md mx-auto font-medium">
                        <div className="flex justify-between">
                            <span className="text-[#808080]">ID Transacção:</span>
                            <span className="font-mono text-primary font-bold">TX-{transactionId || "Pendente"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#808080]">Valor:</span>
                            <span className="font-bold">{course.price_monthly} MT</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#808080]">Estado:</span>
                            <span className="text-amber-400 font-bold uppercase tracking-wider">Pendente de Validação</span>
                        </div>
                    </div>

                    <p className="text-xs text-on-surface-variant/80 max-w-xs mx-auto leading-relaxed">
                        A aprovação demora tipicamente até {paymentSettings.payment_review_hours} horas. Receberá uma notificação quando estiver concluído.
                    </p>

                    <div className="pt-4">
                        <Button onClick={() => router.push("/estudante")} variant="primary" className="px-8 font-bold uppercase tracking-wider">
                            Ir para o Dashboard
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}

function CopyablePaymentValue({
    value,
    copied,
    onCopy,
}: {
    value: string;
    copied: boolean;
    onCopy: () => void;
}) {
    const canCopy = value !== "Não configurado";

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-black/20 px-3 py-2.5">
            <span className="break-all font-mono text-sm font-bold tracking-wide text-amber-200">{value}</span>
            <button
                type="button"
                onClick={onCopy}
                disabled={!canCopy}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Copiar ${value}`}
            >
                <span className="material-symbols-outlined text-base">{copied ? "check" : "content_copy"}</span>
                {copied ? "Copiado" : "Copiar"}
            </button>
        </div>
    );
}
