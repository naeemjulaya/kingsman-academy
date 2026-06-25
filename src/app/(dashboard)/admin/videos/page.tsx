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

interface VideoAula {
  id: string;
  title: string;
  course_id: string;
  course_name: string;
  tutor_name: string;
  duration: number;
  youtube_link: string;
  published_at: string;
  order_index: number;
  is_active: boolean;
}

interface CourseOption {
  id: string;
  name: string;
}

export default function VideosPage() {
  const supabase = createClient();
  const [videos, setVideos] = useState<VideoAula[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("TODOS");

  // Modais State
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Partial<VideoAula>>({
    title: "",
    course_id: "",
    duration: 30,
    youtube_link: "",
    order_index: 1,
    is_active: true
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLink, setPreviewLink] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Courses
      const { data: coursesData } = await supabase.from("courses").select("id, name");
      setCourses(coursesData as CourseOption[] || []);

      // 2. Fetch Lessons (videos)
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select(`
          id,
          title,
          course_id,
          youtube_link,
          duration,
          order_index,
          is_active,
          created_at,
          courses:course_id(name)
        `)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;

      // 3. Map tutor names
      const mappedVideos = await Promise.all(
        (lessonsData || []).map(async (l: any) => {
          const { data: tutorRel } = await supabase
            .from("course_tutors")
            .select(`
              profiles:tutor_id(full_name)
            `)
            .eq("course_id", l.course_id)
            .eq("is_active", true)
            .limit(1);

          const tutorName = tutorRel && tutorRel[0]?.profiles 
            ? (tutorRel[0].profiles as any).full_name 
            : "Sem Explicador";

          const cName = l.courses && (l.courses as any).name;

          return {
            id: l.id,
            title: l.title,
            course_id: l.course_id,
            course_name: cName || "Desconhecida",
            tutor_name: tutorName,
            duration: l.duration || 0,
            youtube_link: l.youtube_link || "",
            published_at: l.created_at || "",
            order_index: l.order_index || 0,
            is_active: l.is_active
          };
        })
      );

      setVideos(mappedVideos);
    } catch (error) {
      console.error("Erro ao carregar vídeo-aulas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedVideo({
      title: "",
      course_id: courses[0]?.id || "",
      duration: 30,
      youtube_link: "",
      order_index: videos.length + 1,
      is_active: true
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (video: VideoAula) => {
    setSelectedVideo(video);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && selectedVideo.id) {
        // Update
        const { error } = await supabase
          .from("lessons")
          .update({
            title: selectedVideo.title,
            course_id: selectedVideo.course_id,
            duration: selectedVideo.duration,
            youtube_link: selectedVideo.youtube_link,
            order_index: selectedVideo.order_index,
            is_active: selectedVideo.is_active,
            topic: "Aula" // Default topic required by schema
          })
          .eq("id", selectedVideo.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("lessons")
          .insert({
            title: selectedVideo.title,
            course_id: selectedVideo.course_id,
            duration: selectedVideo.duration,
            youtube_link: selectedVideo.youtube_link,
            order_index: selectedVideo.order_index,
            is_active: selectedVideo.is_active,
            topic: "Aula" // Default topic
          });

        if (error) throw error;
      }

      setIsOpen(false);
      fetchData();
    } catch (error: any) {
      alert("Erro ao gravar vídeo-aula: " + error.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", videoToDelete);
      if (error) throw error;

      setVideos(prev => prev.filter(v => v.id !== videoToDelete));
      setIsDeleteOpen(false);
      setVideoToDelete(null);
    } catch (error: any) {
      alert("Erro ao eliminar aula: " + error.message);
    }
  };

  const handlePreview = (link: string) => {
    setPreviewLink(link);
    setIsPreviewOpen(true);
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) || 
                          v.tutor_name.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === "TODOS" || v.course_id === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1440px] mx-auto p-4 md:p-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Gestão de Vídeo-Aulas</h1>
            <p className="text-sm text-on-surface-variant/70 mt-1">
              Faça upload, organize a ordem das aulas e defina os links de transmissão do YouTube das cadeiras.
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} className="w-full md:w-auto font-bold uppercase tracking-wider">
            + Adicionar Aula
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Procurar Aula</label>
            <Input
              placeholder="Pesquisar por título ou professor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Filtrar por Cadeira</label>
            <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="TODOS">Todas as Cadeiras</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => { setSearch(""); setCourseFilter("TODOS"); }} className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </Card>

        {/* Tabela de Vídeos */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Carregando vídeo-aulas da base de dados...
            </div>
          ) : filteredVideos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Título da Aula</TableHead>
                    <TableHead>Cadeira</TableHead>
                    <TableHead>Explicador</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Publicação</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVideos.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-semibold text-primary">#{v.order_index}</TableCell>
                      <TableCell className="font-semibold text-on-surface">{v.title}</TableCell>
                      <TableCell>{v.course_name}</TableCell>
                      <TableCell className="font-medium">{v.tutor_name}</TableCell>
                      <TableCell className="font-semibold text-on-surface-variant">{v.duration} min</TableCell>
                      <TableCell>{v.published_at ? new Date(v.published_at).toLocaleDateString("pt-PT") : "N/D"}</TableCell>
                      <TableCell>
                        <Badge variant={v.is_active ? "success" : "danger"}>
                          {v.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePreview(v.youtube_link)}
                            className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Ver Link
                          </button>
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => { setVideoToDelete(v.id); setIsDeleteOpen(true); }}
                            className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Eliminar
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
              Nenhuma vídeo-aula correspondente encontrada.
            </div>
          )}
        </Card>

        {/* Modal de Criação / Edição */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent onClose={() => setIsOpen(false)}>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Editar Vídeo-Aula" : "Adicionar Nova Vídeo-Aula"}</DialogTitle>
              <DialogDescription>Insira o link do YouTube e as informações de indexação.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Título da Vídeo-Aula</label>
                <Input
                  required
                  placeholder="Ex: Aula 3: Distribuição Normal e Z-Score"
                  value={selectedVideo.title}
                  onChange={(e) => setSelectedVideo({ ...selectedVideo, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Cadeira Associada</label>
                  <Select
                    value={selectedVideo.course_id}
                    onChange={(e) => setSelectedVideo({ ...selectedVideo, course_id: e.target.value })}
                  >
                    <option value="">Selecione uma Cadeira</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Ordem/Index</label>
                  <Input
                    type="number"
                    required
                    value={selectedVideo.order_index}
                    onChange={(e) => setSelectedVideo({ ...selectedVideo, order_index: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Duração (Minutos)</label>
                  <Input
                    type="number"
                    required
                    value={selectedVideo.duration}
                    onChange={(e) => setSelectedVideo({ ...selectedVideo, duration: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Estado da Aula</label>
                  <Select
                    value={selectedVideo.is_active ? "ativo" : "inativo"}
                    onChange={(e) => setSelectedVideo({ ...selectedVideo, is_active: e.target.value === "ativo" })}
                  >
                    <option value="ativo">Publicado</option>
                    <option value="inativo">Oculto</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Link YouTube</label>
                <Input
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={selectedVideo.youtube_link}
                  onChange={(e) => setSelectedVideo({ ...selectedVideo, youtube_link: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {isEdit ? "Guardar Alterações" : "Adicionar Aula"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Pré-visualização de Link */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent onClose={() => setIsPreviewOpen(false)}>
            <DialogHeader>
              <DialogTitle>Link da Transmissão</DialogTitle>
              <DialogDescription>Link configurado no canal privado do YouTube para os alunos matriculados.</DialogDescription>
            </DialogHeader>
            <div className="p-4 rounded bg-surface-container flex flex-col gap-3 mt-2">
              <span className="text-xs text-[#808080] font-mono break-all font-semibold select-all">{previewLink}</span>
              <a href={previewLink} target="_blank" rel="noopener noreferrer" className="w-full text-center">
                <Button variant="primary" className="w-full">
                  Abrir no YouTube
                </Button>
              </a>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alerta de Confirmação de Eliminação */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent onClose={() => setIsDeleteOpen(false)}>
            <DialogHeader>
              <DialogTitle className="text-red-500">Confirmar Eliminação</DialogTitle>
              <DialogDescription>
                Tem a certeza de que deseja eliminar esta vídeo-aula? Os alunos perderão o acesso ao vídeo e ao registo de progresso assistido.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Eliminar Aula
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
