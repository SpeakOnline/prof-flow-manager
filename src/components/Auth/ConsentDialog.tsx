/**
 * ConsentDialog Component
 *
 * Dialog de consentimento exibido no primeiro acesso do professor ao sistema.
 * O usuário precisa aceitar os termos de uso e tratamento de dados para continuar.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Loader2 } from 'lucide-react';

interface ConsentDialogProps {
  open: boolean;
  onAccept: () => Promise<void>;
  onDecline: () => void;
}

export const ConsentDialog = ({ open, onAccept, onDecline }: ConsentDialogProps) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[520px] max-h-[90vh]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Bem-vindo ao AgendaPro</DialogTitle>
          </div>
          <DialogDescription>
            Antes de continuar, leia e aceite os termos de uso dos seus dados.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-1">Quais dados coletamos</h3>
              <p>
                Coletamos seu nome, e-mail, telefone (opcional) e informações profissionais
                como nível de experiência e certificações. Também armazenamos seus horários
                de aula e disponibilidade.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-foreground mb-1">Como usamos seus dados</h3>
              <p>
                Seus dados são usados exclusivamente para o funcionamento do sistema de agendamento:
                organizar horários, gerenciar aulas e manter sua conta ativa.
                <strong> Não compartilhamos nem vendemos seus dados para terceiros.</strong>
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-foreground mb-1">Seus direitos</h3>
              <p>
                Você pode a qualquer momento acessar, corrigir, exportar ou solicitar a exclusão
                dos seus dados pessoais. Basta acessar as configurações de privacidade dentro do sistema.
              </p>
            </section>

            <Separator />

            <section>
              <h3 className="font-semibold text-foreground mb-1">Segurança</h3>
              <p>
                Seus dados são protegidos com criptografia e controle de acesso.
                Apenas você e os administradores autorizados têm acesso às suas informações.
              </p>
            </section>
          </div>
        </ScrollArea>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              Li e aceito os termos de uso e autorizo o tratamento dos meus dados pessoais
              conforme descrito acima.
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onDecline}
              disabled={loading}
            >
              Não aceito
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={!accepted || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Aceitar e continuar'
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Você pode alterar suas preferências a qualquer momento nas configurações de privacidade.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
