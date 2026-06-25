"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export default function TestRolePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Teste de Role</h1>

            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Informações do Utilizador</h2>
                <div className="space-y-2">
                    <p><strong>Email:</strong> {user?.email || "Não autenticado"}</p>
                    <p><strong>Nome:</strong> {user?.fullName || "N/A"}</p>
                    <p><strong>Role:</strong> <span className="text-primary font-bold">{user?.role || "N/A"}</span></p>
                    <p><strong>ID:</strong> {user?.id || "N/A"}</p>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Links de Teste</h2>
                <div className="space-y-2">
                    <a href="/estudante" className="block text-primary hover:underline">/estudante</a>
                    <a href="/explicador" className="block text-primary hover:underline">/explicador</a>
                    <a href="/coordenador" className="block text-primary hover:underline">/coordenador</a>
                    <a href="/admin" className="block text-primary hover:underline">/admin</a>
                </div>
            </Card>
        </div>
    );
}