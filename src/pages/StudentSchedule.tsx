import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Users, Search, MessageCircle, HelpCircle, Clock, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabasePublic } from "@/integrations/supabase/client";
import type { Teacher } from "@/integrations/supabase/extended-types";
import { TEACHER_LEVEL_LABELS } from "@/integrations/supabase/extended-types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Schedule = {
  id: string;
  day_of_week: number;
  hour: number;
  minute: number;
  end_hour: number;
  end_minute: number;
  status: string;
};

const dayLabels: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

const StudentSchedule = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSchedules, setTeacherSchedules] = useState<Record<string, Schedule[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState<Record<string, boolean>>({});
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Número de WhatsApp da coordenação (deve ser configurado via env var)
  const coordinationWhatsApp = import.meta.env.VITE_COORDINATION_WHATSAPP || '5511999999999';

  const loadTeachers = async () => {
    try {
      setLoading(true);
      
      // Usar a função RPC para buscar professores disponíveis com contagem de horários
      const { data, error } = await supabasePublic
        .rpc('get_available_teachers');

      if (error) throw error;
      
      // Mapear os dados para o formato Teacher e adicionar contagem
      const teachersWithCount = (data || []).map(teacher => ({
        ...teacher,
        available_schedules_count: teacher.available_schedules_count
      }));
      
      setTeachers(teachersWithCount);
      
      // Não carregar horários antecipadamente - usar lazy loading quando clicar no professor
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: 'Erro ao carregar professores',
        description: 'Não foi possível carregar a lista de professores.',
        variant: 'destructive',
      });
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherSchedules = async (teacherId: string) => {
    try {
      setLoadingSchedules(prev => ({ ...prev, [teacherId]: true }));
      
      // Usar a função RPC para buscar horários disponíveis
      const { data, error } = await supabasePublic
        .rpc('get_teacher_available_schedules', { teacher_id_param: teacherId });

      if (error) throw error;
      setTeacherSchedules(prev => ({
        ...prev,
        [teacherId]: data || []
      }));
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast({
        title: 'Erro ao carregar horários',
        description: 'Não foi possível carregar os horários do professor.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSchedules(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  // Carregar professores ao montar
  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return teachers;

    return teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(term) ||
      teacher.email.toLowerCase().includes(term)
    );
  }, [teachers, searchTerm]);

  const getLevelColor = (level: Teacher['level']) => {
    switch (level) {
      case 'iniciante':
        return 'bg-status-free text-status-free-foreground';
      case 'intermediario':
        return 'bg-status-occupied text-status-occupied-foreground';
      case 'avancado':
      case 'nativo':
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const formatScheduleTime = (schedule: Schedule) => {
    const startTime = `${schedule.hour.toString().padStart(2, '0')}:${(schedule.minute || 0).toString().padStart(2, '0')}`;
    const endTime = `${schedule.end_hour.toString().padStart(2, '0')}:${(schedule.end_minute || 0).toString().padStart(2, '0')}`;
    return `${startTime} - ${endTime}`;
  };

  const handleTeacherClick = async (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
    
    // Carregar horários sob demanda (lazy loading)
    if (!teacherSchedules[teacher.id]) {
      await loadTeacherSchedules(teacher.id);
    }
  };

  const handleWhatsAppTeacher = () => {
    if (!selectedTeacher?.phone) {
      toast({
        title: 'Contato não disponível',
        description: 'Este professor não possui número de WhatsApp cadastrado.',
        variant: 'destructive',
      });
      return;
    }

    // Formatar número para WhatsApp
    let cleanPhone = selectedTeacher.phone.replace(/\D/g, '');
    
    // Se não tiver código do país, adicionar +55 (Brasil)
    if (!cleanPhone.startsWith('55')) {
      // Remover o 0 inicial do DDD se existir
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }
      cleanPhone = '55' + cleanPhone;
    }
    
    const message = encodeURIComponent(`Olá! Gostaria de agendar uma aula com você.`);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleWhatsAppCoordination = () => {
    const message = encodeURIComponent('Olá! Tenho uma dúvida sobre as aulas.');
    const whatsappUrl = `https://wa.me/${coordinationWhatsApp}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const getAvailableSchedulesCount = (teacherId: string) => {
    // Primeiro tenta usar a contagem da função RPC, depois verifica os horários carregados
    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher && 'available_schedules_count' in teacher) {
      return teacher.available_schedules_count;
    }
    return teacherSchedules[teacherId]?.length || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            🎓 Professores Disponíveis
          </h1>
          <p className="text-muted-foreground text-lg">
            Visualize apenas professores com horários livres para agendar sua aula
          </p>
          
          {/* Botão de Dúvidas */}
          <Button
            variant="outline"
            onClick={handleWhatsAppCoordination}
            className="mx-auto"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Tirar Dúvidas com a Coordenação
          </Button>
        </div>

        {/* Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar professor por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Professores */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Card 
                key={teacher.id} 
                className="h-full min-h-[280px] transition-smooth hover:shadow-custom-md cursor-pointer"
                onClick={() => handleTeacherClick(teacher)}
              >
                <CardContent className="flex h-full flex-col space-y-4 p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="font-semibold text-foreground truncate">{teacher.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{teacher.email}</p>
                      {teacher.district && (
                        <p className="text-sm text-muted-foreground truncate">Distrito: {teacher.district}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getLevelColor(teacher.level)}>
                      {TEACHER_LEVEL_LABELS[teacher.level]}
                    </Badge>
                    
                    {teacher.has_international_certification && (
                      <Badge variant="secondary">
                        Certificado
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {getAvailableSchedulesCount(teacher.id)} horário(s) disponível(is)
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTeacherClick(teacher);
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Horários
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum professor disponível</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum professor encontrado com os termos da busca.' : 'Não há professores com horários disponíveis no momento.'}
            </p>
          </div>
        )}

        {/* Diálogo de Detalhes do Professor */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={isMobile ? "w-[90vw] max-w-[90vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto" : "max-w-[600px] max-h-[90vh] overflow-y-auto"}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {selectedTeacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {selectedTeacher?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTeacher?.email}
              </DialogDescription>
            </DialogHeader>

            {selectedTeacher && (
              <div className="space-y-4">
                {/* Informações do Professor */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getLevelColor(selectedTeacher.level)}>
                      {TEACHER_LEVEL_LABELS[selectedTeacher.level]}
                    </Badge>
                    
                    {selectedTeacher.has_international_certification && (
                      <Badge variant="secondary">
                        Certificado Internacional
                      </Badge>
                    )}
                  </div>

                  {selectedTeacher.academic_background && (
                    <div>
                      <p className="text-sm font-medium">Formação:</p>
                      <p className="text-sm text-muted-foreground">{selectedTeacher.academic_background}</p>
                    </div>
                  )}

                  {selectedTeacher.district && (
                    <div>
                      <p className="text-sm font-medium">Localização:</p>
                      <p className="text-sm text-muted-foreground">{selectedTeacher.district}</p>
                    </div>
                  )}
                </div>

                {/* Horários Disponíveis */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horários Disponíveis
                  </h4>
                  
                  {loadingSchedules[selectedTeacher.id] ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : teacherSchedules[selectedTeacher.id]?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum horário disponível no momento.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {teacherSchedules[selectedTeacher.id]?.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <span className="text-sm font-medium">
                            {dayLabels[schedule.day_of_week]}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatScheduleTime(schedule)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={handleWhatsAppTeacher}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!selectedTeacher.phone}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {selectedTeacher.phone ? 'WhatsApp do Professor' : 'Sem WhatsApp'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppCoordination}
                    className="flex-1"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Dúvidas com Coordenação
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentSchedule;
