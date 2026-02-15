import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Star, Shield, Plus, Trash2, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useTeachers } from "@/hooks/useTeachers";
import {
  useSpecialListsByType,
  useCreateSpecialListEntry,
  useDeleteSpecialListEntry,
} from "@/hooks/useSpecialLists";
import { cn } from "@/lib/utils";

export const SpecialListsView = () => {
  // Hooks para buscar dados
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers();
  const { data: restrictedTeachers = [], isLoading: isLoadingRestricted } = useSpecialListsByType('restricted');
  const { data: bestTeachers = [], isLoading: isLoadingBest } = useSpecialListsByType('best');
  
  // Mutations
  const createEntry = useCreateSpecialListEntry();
  const deleteEntry = useDeleteSpecialListEntry();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'restricted' | 'best'>('restricted');
  const [teacherComboOpen, setTeacherComboOpen] = useState(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    observation: ''
  });

  // Filtrar professores que já estão em uma lista específica
  const availableTeachers = useMemo(() => {
    const existingIds = dialogType === 'restricted' 
      ? restrictedTeachers.map(t => t.teacher_id)
      : bestTeachers.map(t => t.teacher_id);
    
    return teachers.filter(t => !existingIds.includes(t.id));
  }, [teachers, restrictedTeachers, bestTeachers, dialogType]);

  // Obter nome do professor selecionado
  const selectedTeacher = useMemo(() => {
    return teachers.find(t => t.id === formData.teacherId);
  }, [teachers, formData.teacherId]);

  const handleAdd = (type: 'restricted' | 'best') => {
    setDialogType(type);
    setFormData({ teacherId: '', observation: '' });
    setTeacherComboOpen(false);
    setIsAddDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.teacherId) return;
    
    await createEntry.mutateAsync({
      teacher_id: formData.teacherId,
      list_type: dialogType,
      observation: formData.observation || null,
    });

    setIsAddDialogOpen(false);
    setFormData({ teacherId: '', observation: '' });
  };

  const handleRemove = async (id: string) => {
    await deleteEntry.mutateAsync(id);
  };

  const renderTeacherList = (entries: typeof restrictedTeachers, type: 'restricted' | 'best') => {
    const isLoading = type === 'restricted' ? isLoadingRestricted : isLoadingBest;
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="transition-smooth hover:shadow-custom-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {entry.teachers?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{entry.teachers?.name || 'Professor não encontrado'}</h4>
                  {entry.observation && (
                    <p className="text-sm text-muted-foreground">{entry.observation}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Adicionado em: {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemove(entry.id)}
                disabled={deleteEntry.isPending}
              >
                {deleteEntry.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum professor nesta lista</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Listas Especiais</h1>
        <p className="text-muted-foreground">
          Gerencie listas especiais de professores (visível apenas para administradores)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Restrição */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                Não Enviar Alunos no Momento
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdd('restricted')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderTeacherList(restrictedTeachers, 'restricted')}
          </CardContent>
        </Card>

        {/* Lista dos Melhores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Melhores Professores
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdd('best')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderTeacherList(bestTeachers, 'best')}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Adicionar Professor */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar à Lista {dialogType === 'restricted' ? 'de Restrição' : 'dos Melhores'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Professor</Label>
              <Popover open={teacherComboOpen} onOpenChange={setTeacherComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={teacherComboOpen}
                    className="justify-between"
                    disabled={isLoadingTeachers}
                  >
                    {isLoadingTeachers ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando...
                      </span>
                    ) : selectedTeacher ? (
                      selectedTeacher.name
                    ) : (
                      "Selecione um professor..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Pesquisar professor..." />
                    <CommandList>
                      <CommandEmpty>Nenhum professor encontrado.</CommandEmpty>
                      <CommandGroup>
                        {availableTeachers.map((teacher) => (
                          <CommandItem
                            key={teacher.id}
                            value={teacher.name}
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, teacherId: teacher.id }));
                              setTeacherComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.teacherId === teacher.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {teacher.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {availableTeachers.length === 0 && !isLoadingTeachers && (
                <p className="text-sm text-muted-foreground">
                  Todos os professores já estão nesta lista.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="observation">Motivo/Observação (opcional)</Label>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) => setFormData(prev => ({ ...prev, observation: e.target.value }))}
                placeholder="Digite o motivo ou observação..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!formData.teacherId || createEntry.isPending}
              >
                {createEntry.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adicionando...
                  </span>
                ) : (
                  "Adicionar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};