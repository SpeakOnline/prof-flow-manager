import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-3xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="shadow-custom-lg">
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6 space-y-6">
            {/* Introdução */}
            <section>
              <p className="text-muted-foreground">
                O <strong>AgendaPro</strong> valoriza a sua privacidade. Esta página explica de forma
                simples e direta como tratamos seus dados pessoais.
              </p>
            </section>

            <Separator />

            {/* Dados Coletados */}
            <section>
              <h2 className="text-lg font-semibold">Quais dados coletamos</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Nome completo e e-mail</li>
                <li>Telefone (opcional)</li>
                <li>Nível de experiência e certificações profissionais</li>
                <li>Horários de aulas e disponibilidade</li>
                <li>Credenciais de acesso (senha criptografada)</li>
              </ul>
            </section>

            <Separator />

            {/* Finalidade */}
            <section>
              <h2 className="text-lg font-semibold">Para que usamos</h2>
              <p className="text-muted-foreground">
                Seus dados são usados exclusivamente para o funcionamento do sistema:
                gerenciar horários, organizar aulas e manter sua conta ativa.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Não vendemos, alugamos ou compartilhamos seus dados com terceiros</strong> para
                fins comerciais.
              </p>
            </section>

            <Separator />

            {/* Seus Direitos */}
            <section>
              <h2 className="text-lg font-semibold">Seus direitos</h2>
              <p className="text-muted-foreground mb-2">
                Você pode a qualquer momento:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Acessar</strong> seus dados pessoais</li>
                <li><strong>Corrigir</strong> informações desatualizadas</li>
                <li><strong>Exportar</strong> uma cópia dos seus dados</li>
                <li><strong>Excluir</strong> sua conta e todos os dados associados</li>
                <li><strong>Revogar</strong> seu consentimento</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Todas essas opções estão disponíveis nas <strong>Configurações de Privacidade</strong> dentro do sistema.
              </p>
            </section>

            <Separator />

            {/* Segurança */}
            <section>
              <h2 className="text-lg font-semibold">Segurança</h2>
              <p className="text-muted-foreground">
                Seus dados são protegidos com criptografia em trânsito (HTTPS) e em repouso.
                As senhas são armazenadas com hash seguro e o acesso ao banco de dados é
                controlado por permissões individuais.
              </p>
            </section>

            <Separator />

            {/* Retenção */}
            <section>
              <h2 className="text-lg font-semibold">Por quanto tempo mantemos seus dados</h2>
              <p className="text-muted-foreground">
                Os dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta,
                todos os dados são removidos permanentemente, exceto quando houver 
                obrigação legal de retenção.
              </p>
            </section>

            <Separator />

            {/* Contato */}
            <section>
              <h2 className="text-lg font-semibold">Dúvidas?</h2>
              <p className="text-muted-foreground">
                Entre em contato pelo e-mail: <strong>privacidade@agendapro.com.br</strong>
              </p>
              <p className="text-muted-foreground mt-1">
                Prazo de resposta: até 15 dias úteis.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            Ao utilizar o AgendaPro, você concorda com os termos desta Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
