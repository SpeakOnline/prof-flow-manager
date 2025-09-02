import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogIn } from "lucide-react";

interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string; role: 'admin' | 'teacher' }) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Usuários demo para teste
  const demoUsers = [
    {
      email: 'admin@escola.com',
      password: 'admin123',
      role: 'admin' as const,
      name: 'Ana Silva',
      label: 'Administrador'
    },
    {
      email: 'professor@escola.com',
      password: 'prof123',
      role: 'teacher' as const,
      name: 'Carlos Santos',
      label: 'Professor'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular autenticação
    setTimeout(() => {
      const user = demoUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
      );

      if (user) {
        onLogin({
          email: user.email,
          password: credentials.password,
          role: user.role
        });
      } else {
        alert('Credenciais inválidas');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setCredentials({ email: user.email, password: user.password });
    onLogin({
      email: user.email,
      password: user.password,
      role: user.role
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">AgendaPro</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        <Card className="shadow-custom-lg">
          <CardHeader>
            <CardTitle className="text-center">Fazer Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Sua senha"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou use uma conta demo
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {demoUsers.map((user, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin(user)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{user.name}</span>
                    <Badge variant="secondary">{user.label}</Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Para conectar autenticação real, configure o Supabase
          </p>
        </div>
      </div>
    </div>
  );
};