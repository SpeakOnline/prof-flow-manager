import { useState } from "react";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { LoginForm } from "@/components/Auth/LoginForm";

// Definir tipo User
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  phone: string;
  level: string;
  hasCertification: boolean;
};

// Usuários mockados para demonstração
const mockUsers: Record<string, User> = {
  'admin@escola.com': {
    id: '1',
    name: 'Ana Silva',
    email: 'admin@escola.com',
    role: 'admin',
    phone: '(11) 99999-1111',
    level: 'Sênior',
    hasCertification: true
  },
  'professor@escola.com': {
    id: '2',
    name: 'Carlos Santos',
    email: 'professor@escola.com',
    role: 'teacher',
    phone: '(11) 99999-2222',
    level: 'Pleno',
    hasCertification: false
  }
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (credentials: { email: string; password: string; role: 'admin' | 'teacher' }) => {
    const userData = mockUsers[credentials.email];
    if (userData) {
      setUser(userData);
    }
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard user={user} />;
};

export default Index;
