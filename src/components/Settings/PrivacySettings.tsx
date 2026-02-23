/**
 * PrivacySettings Component
 *
 * Componente simplificado para gerenciar configurações de privacidade do usuário.
 * Permite exportar dados e solicitar exclusão de conta.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Download, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/Auth/AuthContext';
import { useConsent } from '@/hooks/useConsent';
import { exportUserData, deleteUserData } from '@/services/lgpd.service';
import { useToast } from '@/hooks/use-toast';
import type { ConsentType } from '@/services/lgpd.service';

export const PrivacySettings = () => {
  const { user, signOut } = useAuth();
  const { hasConsent, grantConsent, revokeConsent, loading: consentsLoading } = useConsent();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConsentToggle = async (consentType: ConsentType, currentValue: boolean) => {
    if (currentValue) {
      await revokeConsent(consentType);
    } else {
      await grantConsent(consentType);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setExporting(true);
    try {
      const data = await exportUserData(user.id);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus-dados-agendapro-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Dados exportados',
        description: 'Seus dados foram baixados com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar seus dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      await deleteUserData(user.id);
      
      toast({
        title: 'Conta excluída',
        description: 'Seus dados foram removidos. Você será desconectado.',
      });

      setTimeout(async () => {
        await signOut();
      }, 2000);
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir sua conta. Tente novamente.',
        variant: 'destructive',
      });
      setDeleting(false);
    }
  };

  if (consentsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Privacidade e Dados</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus dados pessoais e preferências de comunicação
          </p>
        </div>
      </div>

      {/* O que fazemos com seus dados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sobre seus dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Seus dados pessoais (nome, e-mail, telefone e informações profissionais) são usados
            <strong> apenas para o funcionamento do sistema de agendamento</strong>.
          </p>
          <p>
            Não compartilhamos nem vendemos seus dados para terceiros. Seus dados são protegidos 
            com criptografia e controle de acesso.
          </p>
        </CardContent>
      </Card>

      {/* Comunicações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comunicações</CardTitle>
          <CardDescription>
            Escolha se deseja receber comunicações opcionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 pr-4">
              <Label className="font-medium">E-mails informativos</Label>
              <p className="text-sm text-muted-foreground">
                Receber novidades e dicas sobre o sistema
              </p>
            </div>
            <Switch
              checked={hasConsent('marketing')}
              onCheckedChange={(checked) => handleConsentToggle('marketing', !checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seus Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seus Dados</CardTitle>
          <CardDescription>
            Você pode exportar ou excluir seus dados a qualquer momento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exportar dados */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportar meus dados</p>
              <p className="text-sm text-muted-foreground">
                Baixe uma cópia de todos os seus dados pessoais
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Zona de Perigo */}
          <div className="pt-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Excluir conta</AlertTitle>
              <AlertDescription>
                A exclusão da conta remove permanentemente todos os seus dados. 
                Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full mt-4" disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir minha conta
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Esta ação <strong>não pode ser desfeita</strong>. Isso excluirá permanentemente:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Seu perfil e dados pessoais</li>
                      <li>Todos os seus agendamentos</li>
                      <li>Suas configurações e preferências</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, excluir minha conta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Dúvidas sobre seus dados? Entre em contato: <strong>privacidade@agendapro.com.br</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
