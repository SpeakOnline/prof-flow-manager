import { Dashboard } from "@/components/Dashboard/Dashboard";
import { LoginForm } from "@/components/Auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

// Definir tipo User para compatibilidade com Dashboard
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  phone: string;
  level: string;
  hasCertification: boolean;
};

const Index = () => {
  const { user, profile, isAdmin, isTeacher } = useAuth();

  // Se não há usuário autenticado, mostrar login
  if (!user || !profile) {
    return <LoginForm />;
  }

  // Criar objeto User compatível com Dashboard a partir do profile
  const dashboardUser: User = {
    id: user.id,
    name: profile.name || 'Usuário',
    email: profile.email || user.email || '',
    role: isAdmin ? 'admin' : 'teacher',
    phone: profile.phone || '',
    level: profile.level || 'intermediario',
    hasCertification: profile.has_certification || false,
  };

  return <Dashboard user={dashboardUser} />;
};

export default Index;
