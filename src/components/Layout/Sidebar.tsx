import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Calendar,
  Users,
  Search,
  Star,
  Shield,
  User,
  Clock
} from "lucide-react";

interface SidebarProps {
  userRole: 'admin' | 'teacher';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ userRole, activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    {
      id: 'schedule',
      label: 'Minha Agenda',
      icon: Calendar,
      roles: ['admin', 'teacher']
    },
    {
      id: 'teachers',
      label: 'Professores',
      icon: Users,
      roles: ['admin']
    },
    {
      id: 'search',
      label: 'Buscar Horários',
      icon: Search,
      roles: ['admin', 'teacher']
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: User,
      roles: ['admin', 'teacher']
    },
    {
      id: 'special-lists',
      label: 'Listas Especiais',
      icon: Star,
      roles: ['admin']
    }
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-card border-r shadow-custom-sm">
      <div className="p-6">
        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start transition-smooth",
                  activeTab === item.id && "bg-primary text-primary-foreground shadow-custom"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};