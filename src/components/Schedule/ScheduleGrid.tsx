import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ScheduleSlot {
  id: string;
  time: string;
  status: 'free' | 'occupied' | 'unavailable';
  studentName?: string;
  lastModified?: Date;
}

interface ScheduleGridProps {
  schedule: Record<string, ScheduleSlot[]>;
  onSlotClick?: (day: string, slot: ScheduleSlot) => void;
  readOnly?: boolean;
}

const days = [
  { key: 'sunday', label: 'Domingo' },
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' }
];

const getStatusColor = (status: ScheduleSlot['status']) => {
  switch (status) {
    case 'free':
      return 'bg-status-free text-status-free-foreground';
    case 'occupied':
      return 'bg-status-occupied text-status-occupied-foreground';
    case 'unavailable':
      return 'bg-status-unavailable text-status-unavailable-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: ScheduleSlot['status']) => {
  switch (status) {
    case 'free':
      return 'Livre';
    case 'occupied':
      return 'Com aluno';
    case 'unavailable':
      return 'Indisponível';
  }
};

export const ScheduleGrid = ({ schedule, onSlotClick, readOnly = false }: ScheduleGridProps) => {
  const isMobile = useIsMobile();
  return (
    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7'} gap-4`}>
      {days.map((day) => (
        <div key={day.key} className="space-y-2">
          <h3 className="text-sm font-semibold text-center p-2 bg-muted rounded-md">
            {day.label}
          </h3>
          <div className="space-y-2">
            {(schedule[day.key] || []).map((slot) => (
              <Card
                key={slot.id}
                className={cn(
                  "transition-smooth hover:shadow-custom-md cursor-pointer",
                  !readOnly && "hover:scale-105"
                )}
                onClick={() => !readOnly && onSlotClick?.(day.key, slot)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {slot.time}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs", getStatusColor(slot.status))}
                    >
                      {getStatusLabel(slot.status)}
                    </Badge>
                  </div>
                  {slot.status === 'occupied' && slot.studentName && (
                    <p className="text-xs text-foreground truncate">
                      {slot.studentName}
                    </p>
                  )}
                  {slot.lastModified && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Alterado: {slot.lastModified.toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};