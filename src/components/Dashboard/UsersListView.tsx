import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ListedUser {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  created_at: string;
}

export const UsersListView = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<ListedUser[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('list_all_users');

        if (error) {
          throw error;
        }

        setUsers((data as ListedUser[]) || []);
      } catch (error) {
        console.error('Erro ao carregar usuarios:', error);
        toast({
          title: 'Erro ao carregar usuarios',
          description:
            error instanceof Error
              ? error.message
              : 'Nao foi possivel listar os usuarios.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [toast]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(term)
        || user.email.toLowerCase().includes(term)
        || user.role.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, users]);

  const adminCount = users.filter((user) => user.role === 'admin').length;
  const teacherCount = users.filter((user) => user.role === 'teacher').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuarios do Sistema</h1>
        <p className="text-muted-foreground">Lista completa de administradores e professores</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle>{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Administradores</CardDescription>
            <CardTitle>{adminCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Professores</CardDescription>
            <CardTitle>{teacherCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Todos os usuarios
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail ou perfil..."
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredUsers.map((user) => (
                <Card key={user.user_id} className="border border-border/70">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{user.name || 'Sem nome'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email || 'Sem e-mail'}
                        </p>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrador' : 'Professor'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              ))}

              {!filteredUsers.length && (
                <div className="col-span-full py-10 text-center text-muted-foreground">
                  Nenhum usuario encontrado para o filtro informado.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
