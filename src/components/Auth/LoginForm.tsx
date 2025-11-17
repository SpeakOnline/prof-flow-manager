import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/lib/validators";
import { z } from "zod";

export const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  const { signIn } = useAuth();
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validar credenciais com Zod
      const validatedData = loginSchema.parse({
        email: credentials.email,
        password: credentials.password,
      });

      // Autenticação real com Supabase
      await signIn(validatedData.email, validatedData.password);

      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao AgendaPro!',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Erros de validação
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        // Erros de autenticação
        toast({
          title: 'Erro no login',
          description: error.message || 'Credenciais inválidas',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (user: typeof demoUsers[0]) => {
    setCredentials({ email: user.email, password: user.password });
    setIsLoading(true);

    try {
      await signIn(user.email, user.password);
      toast({
        title: 'Login demo realizado',
        description: `Bem-vindo, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: 'Erro no login demo',
        description: error instanceof Error ? error.message : 'Erro ao fazer login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">AgendaPro</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Sistema de Gestão</p>
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
                  onChange={(e) => {
                    setCredentials(prev => ({ ...prev, email: e.target.value }));
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="seu@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => {
                    setCredentials(prev => ({ ...prev, password: e.target.value }));
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  placeholder="Sua senha"
                  className={errors.password ? 'border-destructive' : ''}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
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
              <p className="text-sm text-center text-muted-foreground">Ou faça login com uma conta demo:</p>
              <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
                {demoUsers.map(user => (
                  <Button
                    key={user.email}
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDemoLogin(user)}
                  >
                    {user.label}
                    <Badge variant="secondary" className="ml-2">{user.role === 'admin' ? 'Admin' : 'Prof'}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Autenticação integrada com Supabase
          </p>
        </div>
      </div>
    </div>
  );
};