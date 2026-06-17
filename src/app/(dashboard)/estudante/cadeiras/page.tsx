"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { mockCourses, mockTutors, mockCourseTutors } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select_input";
import { Badge } from "@/components/ui/badge";

export default function CourseCatalogue() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [level, setLevel] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.description?.toLowerCase().includes(search.toLowerCase());

      const matchesDepartment = department === "all" || course.department === department;
      // Level doesn't exist in DB schema anymore, we will ignore it or you can change it to search another field.
      // For now we'll just allow all.
      const matchesLevel = level === "all";

      return matchesSearch && matchesDepartment && matchesLevel;
    });
  }, [search, department, level]);

  // Paginated courses
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Header section */}
      <div>
        <span className="text-primary font-bold text-xs uppercase tracking-widest">Catálogo</span>
        <h2 className="font-playfair text-3xl font-bold text-on-surface mt-1 uppercase">Cadeiras Académicas</h2>
        <p className="text-sm text-on-surface-variant/70 mt-1">
          Explore e inscreva-se no programa de suporte acadêmico de elite.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <Input
            type="text"
            placeholder="Pesquisar cadeira (ex: Bioestatística)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
          <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/40">
            search
          </span>
        </div>

        {/* Filters */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
          <SelectInput
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 font-semibold"
          >
            <option value="all">Todas Faculdades</option>
            <option value="Ciências Médicas">Ciências Médicas</option>
            <option value="Engenharia">Engenharia</option>
            <option value="Biologia">Biologia</option>
            <option value="Agronomia">Agronomia</option>
            <option value="Informática">Informática</option>
          </SelectInput>

          <SelectInput
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-40 font-semibold"
          >
            <option value="all">Todos Anos</option>
            <option value="1º Ano">1º Ano</option>
            <option value="2º Ano">2º Ano</option>
            <option value="3º Ano">3º Ano</option>
            <option value="Finalista">Finalista</option>
          </SelectInput>
        </div>
      </Card>

      {/* Catalogue Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCourses.length > 0 ? (
          paginatedCourses.map((course) => {
            const courseTutor = mockCourseTutors.find((ct) => ct.course_id === course.id);
            const tutor = courseTutor ? mockTutors.find((t) => t.user_id === courseTutor.tutor_id) : null;
            const tutorName = tutor ? tutor.full_name : "Não Atribuído";
            const tutorAvatar = tutor ? tutor.avatar_url : "";
            return (
              <Card key={course.id} className="p-6 group hover:border-primary/40 transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <Badge variant="primary">{course.department}</Badge>
                    <span className="text-sm font-bold text-on-surface-variant">{course.price_monthly} MT/mês</span>
                  </div>
                  <Link href={`/estudante/cadeiras/${course.id}`}>
                    <h4 className="font-playfair text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors cursor-pointer">
                      {course.name}
                    </h4>
                  </Link>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-4">
                    Departamento: {course.department}
                  </p>
                  <p className="text-sm text-on-surface-variant/80 mb-6 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
                      <img className="w-full h-full object-cover" src={tutorAvatar || ""} alt={tutorName} />
                    </div>
                    <span className="text-xs font-semibold text-on-surface">{tutorName}</span>
                  </div>
                  <Link href={`/estudante/cadeiras/${course.id}`}>
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                      Detalhes <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </Link>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-4 block">search_off</span>
            <p className="font-semibold text-sm">Nenhuma cadeira encontrada para os filtros selecionados.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-6 border-t border-white/5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="text-xs text-on-surface font-semibold">
            Página <span className="text-primary font-bold">{currentPage}</span> de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
