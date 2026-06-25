"use client";

import React, { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface Utilizador {
  id: string;
  full_name: string;
  email: string;
  role: "ESTUDANTE" | "ADMIN" | "EXPLICADOR" | "COORDENADOR";
  status: "active" | "inactive";
  created_at: string;
}

export default function UtilizadoresPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Utilizador[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Estados dos Modais
  const [selectedUser, setSelectedUser] = useState<Utilizador | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data as Utilizador[] || []);
    } catch (error) {
      console.error("Erro ao carregar utilizadores da base de dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (error: any) {
      alert("Erro ao alterar o estado do utilizador: " + error.message);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: selectedUser.full_name,
          email: selectedUser.email,
          role: selectedUser.role,
          status: selectedUser.status
        })
        .eq("id", selectedUser.id);

      if (error) throw error;
      
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? selectedUser : u)));
      setIsEditOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      alert("Erro ao guardar alterações: " + error.message);
    }
  };

  // Filtragem
  const filteredUsers = users.filter(user => {
    const nameStr = user.full_name || "";
    const emailStr = user.email || "";
    const matchesSearch = 
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      emailStr.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "TODOS" || user.role === roleFilter;
    const matchesStatus = statusFilter === "TODOS" || 
      (statusFilter === "ATIVO" && user.status === "active") || 
      (statusFilter === "INATIVO" && user.status === "inactive");

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Cálculos de Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1440px] mx-auto p-4 md:p-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Gestão de Utilizadores</h1>
            <p className="text-sm text-on-surface-variant/70 mt-1">
              Visualize, edite e controle o estado das contas de estudantes e administradores da Kingsman Academy diretamente da base de dados.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Pesquisar</label>
            <Input
              placeholder="Nome ou email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Tipo/Cargo</label>
            <Select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="TODOS">Todos os Cargos</option>
              <option value="ESTUDANTE">Estudante</option>
              <option value="ADMIN">Administrador</option>
              <option value="EXPLICADOR">Explicador</option>
              <option value="COORDENADOR">Coordenador</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Estado</label>
            <Select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="TODOS">Todos os Estados</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </Select>
          </div>

          <Button 
            variant="secondary" 
            onClick={() => { setSearch(""); setRoleFilter("TODOS"); setStatusFilter("TODOS"); setCurrentPage(1); }}
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </Card>

        {/* Tabela de Utilizadores */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Carregando utilizadores da base de dados...
            </div>
          ) : paginatedUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Data de Registo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-semibold text-on-surface">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "ADMIN" ? "primary" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString("pt-PT") : "N/D"}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "success" : "danger"}>
                          {user.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Detalhes
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setIsEditOpen(true); }}
                            className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                              user.status === "active"
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {user.status === "active" ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Nenhum utilizador encontrado com os filtros atuais.
            </div>
          )}
        </Card>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-[#150b14]/40 p-4 rounded-xl border border-primary/10">
            <span className="text-xs text-on-surface-variant font-semibold">
              Página {currentPage} de {totalPages} ({filteredUsers.length} utilizadores)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                Seguinte
              </Button>
            </div>
          </div>
        )}

        {/* Modal de Detalhes */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent onClose={() => setIsDetailsOpen(false)}>
            <DialogHeader>
              <DialogTitle>Detalhes do Utilizador</DialogTitle>
              <DialogDescription>Informações completas do registo do utilizador.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 text-sm mt-2">
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">ID do Utilizador:</span>
                  <span className="text-on-surface font-semibold uppercase">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Nome Completo:</span>
                  <span className="text-on-surface font-semibold">{selectedUser.full_name}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Endereço de Email:</span>
                  <span className="text-on-surface font-semibold">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Cargo/Função:</span>
                  <span className="text-on-surface font-semibold">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Data de Registo:</span>
                  <span className="text-on-surface font-semibold">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString("pt-PT") : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-on-surface-variant">Estado da Conta:</span>
                  <span className="text-on-surface font-semibold">
                    <Badge variant={selectedUser.status === "active" ? "success" : "danger"}>
                      {selectedUser.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent onClose={() => setIsEditOpen(false)}>
            <DialogHeader>
              <DialogTitle>Editar Utilizador</DialogTitle>
              <DialogDescription>Modifique os dados básicos ou o perfil do utilizador.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Nome Completo</label>
                  <Input
                    required
                    value={selectedUser.full_name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Email</label>
                  <Input
                    type="email"
                    required
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Cargo</label>
                  <Select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                  >
                    <option value="ESTUDANTE">Estudante</option>
                    <option value="EXPLICADOR">Explicador</option>
                    <option value="COORDENADOR">Coordenador</option>
                    <option value="ADMIN">Administrador</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Estado da Conta</label>
                  <Select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as any })}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Guardar Alterações
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
