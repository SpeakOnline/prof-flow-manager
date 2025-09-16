import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScheduleGrid, ScheduleSlot } from "@/components/Schedule/ScheduleGrid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScheduleViewProps {
  user: {
    id: string;
    name: string;
    role: 'admin' | 'teacher';
  };
}

// Dados mockados para demonstração
const generateMockSchedule = () => {
  const times = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const schedule: Record<string, ScheduleSlot[]> = {};
  
  days.forEach(day => {
    schedule[day] = times.map((time, index) => ({
      id: `${day}-${index}`,
      time,
      status: Math.random() > 0.7 ? 'occupied' : Math.random() > 0.5 ? 'free' : 'unavailable',
      studentName: Math.random() > 0.7 ? 'João Silva' : undefined,
      lastModified: new Date()
    }));
  });
  
  return schedule;
};

export const ScheduleView = ({ user }: ScheduleViewProps) => {
  const [schedule, setSchedule] = useState<Record<string, ScheduleSlot[]>>(generateMockSchedule());
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; slot: ScheduleSlot } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: 'free' as ScheduleSlot['status'],
    studentName: ''
  });
  const isMobile = useIsMobile();

  const handleSlotClick = (day: string, slot: ScheduleSlot) => {
    setSelectedSlot({ day, slot });
    setEditForm({
      status: slot.status,
      studentName: slot.studentName || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveSlot = () => {
    if (!selectedSlot) return;

    setSchedule(prev => ({
      ...prev,
      [selectedSlot.day]: prev[selectedSlot.day].map(slot =>
        slot.id === selectedSlot.slot.id
          ? {
              ...slot,
              status: editForm.status,
              studentName: editForm.status === 'occupied' ? editForm.studentName : undefined,
              lastModified: new Date()
            }
          : slot
      )
    }));

    setIsEditDialogOpen(false);
    setSelectedSlot(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              {user.role === 'admin' ? 'Agenda Geral' : 'Minha Agenda'}
            </div>
            <Button size="sm" variant="outline" className={isMobile ? "w-full mt-2" : ""}>
              Imprimir
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ScheduleGrid 
            schedule={schedule}
            onSlotClick={handleSlotClick}
            readOnly={false}
          />
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={isMobile ? "w-[90vw] max-w-[90vw] sm:max-w-[425px]" : ""}>
          <DialogHeader>
            <DialogTitle>Editar Horário</DialogTitle>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4">
              <div>
                <Label>Horário</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedSlot.slot.time}
                </p>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value: ScheduleSlot['status']) => setEditForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Livre</SelectItem>
                    <SelectItem value="occupied">Ocupado</SelectItem>
                    <SelectItem value="unavailable">Indisponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.status === 'occupied' && (
                <div>
                  <Label htmlFor="studentName">Nome do Aluno</Label>
                  <Input
                    id="studentName"
                    value={editForm.studentName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Digite o nome do aluno"
                  />
                </div>
              )}

              <Button onClick={handleSaveSlot} className={isMobile ? "w-full" : "w-full"}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};