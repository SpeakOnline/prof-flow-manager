# ProfFlow Manager - Índice de Documentação

> **Documentação Otimizada para LLMs** - Este documento serve como ponto de entrada para modelos de linguagem implementarem features no projeto.

## 📋 Informações do Projeto

- **Nome**: ProfFlow Manager (AgendaPro)
- **Versão**: 1.0.0
- **Stack**: React + TypeScript + Supabase + TailwindCSS + shadcn/ui
- **Gerenciamento de Estado**: React Query (TanStack Query)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (Supabase)

## 🗂️ Estrutura de Documentação

### 1. Features

#### Features Implementadas ✅
- [Autenticação e Autorização](./features/implemented/01-authentication.md)
- [Gestão de Professores](./features/implemented/02-teachers-management.md)
- [Gestão de Agenda/Horários](./features/implemented/03-schedule-management.md)
- [Dashboard e Interface](./features/implemented/04-dashboard.md)

#### Features Planejadas 🚧
- [WhatsApp Messaging](./features/planned/01-whatsapp-messaging.md)
- [Notificações Automáticas](./features/planned/02-notifications.md)
- [Relatórios e Analytics](./features/planned/03-reports-analytics.md)
- [Gestão de Alunos](./features/planned/04-students-management.md)
- [Sistema de Pagamentos](./features/planned/05-payments.md)

### 2. User Stories

#### Por Módulo
- [Autenticação](./user-stories/authentication/README.md)
- [Gestão de Professores](./user-stories/teachers/README.md)
- [Gestão de Agenda](./user-stories/schedules/README.md)
- [WhatsApp](./user-stories/whatsapp/README.md)
- [Notificações](./user-stories/notifications/README.md)
- [Relatórios](./user-stories/reports/README.md)

### 3. Documentação Técnica

#### Arquitetura
- [Visão Geral da Arquitetura](./technical/architecture/overview.md)
- [Padrões de Código](./technical/architecture/code-patterns.md)
- [Estrutura de Pastas](./technical/architecture/folder-structure.md)

#### API e Integrações
- [Supabase Client](./technical/api/supabase-client.md)
- [Services Layer](./technical/api/services.md)
- [React Query Hooks](./technical/api/react-query-hooks.md)

#### Banco de Dados
- [Schema](./technical/database/schema.md)
- [Migrations](./technical/database/migrations.md)
- [Row Level Security](./technical/database/rls-policies.md)

### 4. Documentação Existente

- [Revisão Completa do Projeto](./REVISAO-COMPLETA.md)
- [Implementações Realizadas](./IMPLEMENTACOES-REALIZADAS.md)
- [WhatsApp Messaging - Arquitetura Completa](./whatsapp-messaging/)

## 🎯 Como Usar Esta Documentação (Para LLMs)

### Para Implementar uma Nova Feature

1. **Leia o contexto do projeto**:
   - Comece por [Visão Geral da Arquitetura](./technical/architecture/overview.md)
   - Revise [Padrões de Código](./technical/architecture/code-patterns.md)

2. **Entenda a feature**:
   - Leia a documentação em `features/planned/[nome-da-feature].md`
   - Revise as user stories relacionadas

3. **Consulte implementações similares**:
   - Veja features implementadas em `features/implemented/`
   - Use como referência para padrões e estruturas

4. **Implemente seguindo os padrões**:
   - Use os services layer (`src/services/`)
   - Crie hooks React Query (`src/hooks/`)
   - Aplique validação Zod (`src/lib/validators.ts`)
   - Use componentes shadcn/ui

5. **Atualize a documentação**:
   - Mova a feature de `planned/` para `implemented/`
   - Marque user stories como concluídas

### Para Corrigir Bugs

1. **Identifique o módulo** afetado
2. **Leia a documentação** da feature em `features/implemented/`
3. **Consulte o código** referenciado na documentação
4. **Aplique a correção** seguindo os padrões estabelecidos

### Para Entender o Código Existente

1. **Comece pelo índice** de features implementadas
2. **Navegue pela documentação** específica
3. **Use os exemplos de código** como referência

## 📊 Status Atual do Projeto

### Implementado ✅

- [x] Autenticação com Supabase Auth
- [x] CRUD de Professores com React Query
- [x] CRUD de Agenda/Horários
- [x] Dashboard responsivo
- [x] Validação de formulários com Zod
- [x] Sistema de cores e utilidades centralizadas
- [x] TypeScript strict mode
- [x] Segurança: variáveis de ambiente

### Em Progresso 🚧

- [ ] WhatsApp Messaging (documentação completa criada)
- [ ] Testes automatizados
- [ ] Internacionalização (i18n)

### Planejado 📋

- [ ] Notificações automáticas por email
- [ ] Relatórios e analytics
- [ ] Gestão completa de alunos
- [ ] Sistema de pagamentos
- [ ] Aplicativo móvel (React Native)

## 🔑 Conceitos Chave do Projeto

### Arquitetura em Camadas

```
┌─────────────────────────────────────┐
│     Components (UI Layer)           │
│  - Dashboard, Forms, Views          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   React Query Hooks (State)         │
│  - useTeachers, useSchedules        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Services Layer (Data Access)      │
│  - teacher.service.ts               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Supabase Client (Backend)         │
│  - PostgreSQL + Auth + Storage      │
└─────────────────────────────────────┘
```

### Padrões de Nomenclatura

- **Components**: PascalCase - `TeachersView.tsx`
- **Hooks**: camelCase com 'use' - `useTeachers.ts`
- **Services**: camelCase com '.service' - `teacher.service.ts`
- **Types**: PascalCase - `Teacher`, `Schedule`
- **Utils**: camelCase - `getLevelColor`

### Convenções de Commit

```
feat: adicionar nova funcionalidade
fix: corrigir bug
refactor: refatorar código sem mudar funcionalidade
docs: atualizar documentação
test: adicionar ou modificar testes
chore: tarefas de manutenção
```

## 🛠️ Ferramentas e Dependências Principais

### Frontend
- **React** 18.3.1 - UI Library
- **TypeScript** 5.6.2 - Type Safety
- **Vite** 6.0.1 - Build Tool
- **TailwindCSS** 3.4.17 - Styling
- **shadcn/ui** - Component Library

### State Management
- **TanStack Query** 5.62.11 - Server State
- **React Context** - Client State (Auth)

### Backend (Supabase)
- **PostgreSQL** - Database
- **Supabase Auth** - Authentication
- **Row Level Security** - Authorization
- **Edge Functions** - Serverless Functions

### Validação e Utilidades
- **Zod** 3.24.1 - Schema Validation
- **date-fns** - Date Manipulation
- **lucide-react** - Icons

## 📚 Recursos Adicionais

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contribuindo

Ao adicionar novas features:

1. Crie a documentação em `docs/features/planned/`
2. Defina as user stories em `docs/user-stories/[modulo]/`
3. Implemente seguindo os padrões estabelecidos
4. Mova a documentação para `docs/features/implemented/`
5. Atualize este índice

---

**Última Atualização**: 2025-11-17
**Mantido por**: Equipe de Desenvolvimento ProfFlow Manager
