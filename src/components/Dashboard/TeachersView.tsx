import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users, Search, UserPlus, Eye, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTeachers } from "@/hooks/useTeachers";
import { getLevelColor, getLevelLabel } from "@/lib/colors";
import { Database } from "@/integrations/supabase/types";

type Teacher = Database['public']['Tables']['teachers']['Row'];

export const TeachersView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const { data: teachers, isLoading, error } = useTeachers();

  const filteredTeachers = (teachers || []).filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} gap-4`}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Professores</h1>
          <p className="text-muted-foreground">Gerencie o cadastro dos professores</p>
        </div>
        <Button className="bg-gradient-primary w-full md:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Professor
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Professores
          </CardTitle>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar professor por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando professores...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-destructive">Erro ao carregar professores</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredTeachers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredTeachers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="transition-smooth hover:shadow-custom-md">
                  <CardContent className={`flex ${isMobile ? 'flex-col' : 'items-center justify-between'} p-4 ${isMobile ? 'gap-3' : 'gap-4'}`}>
                    <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} w-full`}>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="overflow-hidden">
                        <h3 className="font-semibold text-foreground truncate">{teacher.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{teacher.email}</p>
                        <p className="text-sm text-muted-foreground truncate">{teacher.phone || 'Sem telefone'}</p>
                      </div>
                    </div>

                    <div className={`flex ${isMobile ? 'w-full justify-between flex-wrap' : 'items-center'} gap-2`}>
                      {teacher.level && (
                        <Badge className={getLevelColor(teacher.level)}>
                          {getLevelLabel(teacher.level)}
                        </Badge>
                      )}

                      {teacher.has_certification && (
                        <Badge variant="secondary">
                          Certificado
                        </Badge>
                      )}

                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        <Eye className="h-4 w-4" />
                        {isMobile && <span className="ml-2">Detalhes</span>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};