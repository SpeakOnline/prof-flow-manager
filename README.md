# 🗓️ ProfFlow Manager (AgendaPro)

> Sistema completo de gerenciamento de professores e agendamentos com autenticação real, integração Supabase e documentação otimizada para IA.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

## 📋 Sobre o Projeto

Sistema web moderno para gerenciamento de professores, horários e agendamentos de aulas, desenvolvido com React, TypeScript e Supabase. Inclui autenticação real, cache inteligente com React Query, e documentação completa otimizada para LLMs.

**Status Atual**: ✅ MVP Funcional - Autenticação e CRUD implementados

## ✨ Features Principais

### Implementadas ✅

- 🔐 **Autenticação Real** - Supabase Auth com Context API
- 👨‍🏫 **Gestão de Professores** - CRUD completo com React Query
- 📅 **Gestão de Agenda** - Visualização em grade, reservas, status
- 🎨 **UI Moderna** - shadcn/ui + Tailwind CSS
- 🌓 **Tema Dark/Light** - Sistema de temas completo
- 📱 **Responsivo** - Mobile-first design
- ✅ **Validação Zod** - Type-safe form validation
- 🔒 **Segurança** - RLS policies + variáveis de ambiente
- 📚 **Documentação Completa** - 3.175+ linhas para LLMs

### Em Desenvolvimento 🚧

- 📱 **WhatsApp Messaging** - Lembretes automáticos (documentação completa criada)
- 🧪 **Testes Automatizados** - Vitest + React Testing Library
- 🌐 **Internacionalização** - i18n support

### Planejadas 📋

- 📊 **Relatórios e Analytics** - Dashboard de métricas
- 👥 **Gestão de Alunos** - CRUD completo
- 💰 **Sistema de Pagamentos** - Integração financeira
- 📧 **Notificações Email** - Lembretes por email

## 🏗️ Stack Tecnológico

### Frontend
```
React 18.3.1        UI Library
TypeScript 5.6.2    Type Safety
Vite 6.0.1          Build Tool & Dev Server
TailwindCSS 3.4.17  Utility-first CSS
shadcn/ui           Accessible Components
```

### State Management
```
TanStack Query 5.62  Server State (Cache, Sync, Mutations)
React Context        Client State (Auth, Theme)
```

### Backend (Supabase)
```
PostgreSQL          Relational Database
Supabase Auth       Authentication & Authorization
Row Level Security  Database-level Security
Edge Functions      Serverless Functions (Deno)
Realtime           WebSocket Subscriptions (futuro)
```

### Validação & Utilidades
```
Zod 3.24.1         Schema Validation
date-fns           Date Manipulation
lucide-react       Icon System
```

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Conta Supabase** ([Criar conta grátis](https://supabase.com/))

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/msoutole/prof-flow-manager.git
cd prof-flow-manager

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# 4. Edite .env.local com suas credenciais do Supabase
# Obtenha em: https://app.supabase.com/project/_/settings/api

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em **http://localhost:8080**

### Usuários Demo

Para testar a aplicação, use as seguintes credenciais demo:

```
Admin:
  Email: admin@escola.com
  Senha: admin123

Professor:
  Email: professor@escola.com
  Senha: prof123
```

## 📂 Estrutura do Projeto

```
prof-flow-manager/
├── docs/                              # 📚 Documentação (3.175+ linhas)
│   ├── INDEX.md                       # 🎯 Ponto de entrada para LLMs
│   ├── features/
│   │   ├── implemented/               # ✅ Features implementadas
│   │   │   ├── 01-authentication.md
│   │   │   ├── 02-teachers-management.md
│   │   │   └── 03-schedule-management.md
│   │   └── planned/                   # 📋 Features planejadas
│   │       └── 01-whatsapp-messaging.md
│   ├── user-stories/                  # User stories por módulo
│   │   └── authentication/
│   ├── technical/                     # Documentação técnica
│   │   └── architecture/
│   │       └── overview.md
│   └── whatsapp-messaging/            # Docs WhatsApp (5.400+ linhas)
│
├── src/
│   ├── components/                    # Componentes React
│   │   ├── Auth/                      # LoginForm
│   │   ├── Dashboard/                 # TeachersView, ScheduleView
│   │   ├── Schedule/                  # ScheduleGrid
│   │   └── ui/                        # shadcn/ui components
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.tsx                # Hook de autenticação
│   │   ├── useTeachers.ts             # React Query - Teachers
│   │   └── useSchedules.ts            # React Query - Schedules
│   │
│   ├── services/                      # Business Logic Layer
│   │   ├── teacher.service.ts         # Teacher CRUD
│   │   └── schedule.service.ts        # Schedule CRUD
│   │
│   ├── lib/                           # Utilidades
│   │   ├── validators.ts              # Zod schemas
│   │   ├── colors.ts                  # Color helpers
│   │   └── utils.ts                   # General helpers
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts              # Cliente configurado
│   │       └── types.ts               # Types gerados
│   │
│   ├── pages/                         # Route pages
│   │   └── Index.tsx
│   │
│   ├── App.tsx                        # Root component
│   └── main.tsx                       # Entry point
│
├── supabase/
│   ├── functions/                     # Edge Functions (futuro)
│   └── config.toml                    # Supabase config
│
├── .env.example                       # Template de variáveis
├── .env.local                         # Suas credenciais (gitignored)
├── package.json
├── tsconfig.json                      # TypeScript strict mode
├── vite.config.ts
└── tailwind.config.ts
```

## 🗄️ Schema do Banco de Dados

```sql
-- Perfis de usuários (extends auth.users)
profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')),
  ...
)

-- Professores
teachers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  level TEXT CHECK (level IN ('iniciante', 'intermediario', 'avancado', 'nativo')),
  has_certification BOOLEAN,
  ...
)

-- Horários e agendamentos
schedules (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  hour INTEGER CHECK (hour BETWEEN 0 AND 23),
  status TEXT CHECK (status IN ('livre', 'com_aluno', 'indisponivel')),
  student_name TEXT,
  ...
)
```

**Ver schema completo**: [docs/technical/database/schema.md](./docs/technical/database/schema.md) (futuro)

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia dev server (porta 8080)

# Build
npm run build            # Build para produção
npm run preview          # Preview do build

# Qualidade de Código
npm run lint             # ESLint check
npm run type-check       # TypeScript check

# Testes (futuro)
npm run test             # Rodar testes
npm run test:watch       # Testes em watch mode
npm run test:coverage    # Cobertura de testes
```

## 📖 Documentação

O projeto possui **documentação completa** otimizada para humanos e LLMs:

### Para Desenvolvedores

- **[Este README](./README.md)** - Visão geral e quick start
- **[Revisão Completa](./docs/REVISAO-COMPLETA.md)** - Análise detalhada do projeto
- **[Implementações Realizadas](./docs/IMPLEMENTACOES-REALIZADAS.md)** - Guia de código implementado

### Para LLMs (IA)

- **[INDEX.md](./docs/INDEX.md)** - 🎯 **COMECE AQUI** - Ponto de entrada para LLMs
- **[Features Implementadas](./docs/features/implemented/)** - Código e arquitetura
- **[Features Planejadas](./docs/features/planned/)** - Roadmap com exemplos
- **[User Stories](./docs/user-stories/)** - Requisitos detalhados
- **[Arquitetura](./docs/technical/architecture/)** - Padrões e convenções

### WhatsApp Messaging (5.400+ linhas)

Documentação completa para implementação futura:

1. **[Arquitetura](./docs/whatsapp-messaging/01-ARQUITETURA.md)** - Design da solução
2. **[Guia de Implementação](./docs/whatsapp-messaging/02-GUIA-IMPLEMENTACAO.md)** - Passo a passo
3. **[API e Integração](./docs/whatsapp-messaging/03-API-INTEGRACAO.md)** - Endpoints e webhooks
4. **[Configuração](./docs/whatsapp-messaging/04-CONFIGURACAO-DEPLOYMENT.md)** - Deploy e produção
5. **[Alternativas](./docs/whatsapp-messaging/05-ALTERNATIVAS.md)** - Comparação (Chatwoot, WAHA, Evolution API)

## 🔐 Segurança

### Implementações de Segurança ✅

- ✅ **Credenciais em .env** - Não commitadas no git
- ✅ **Row Level Security (RLS)** - Políticas no banco de dados
- ✅ **Validação de Input** - Zod schemas em todos os forms
- ✅ **TypeScript Strict Mode** - Type safety rigoroso
- ✅ **XSS Protection** - React escaping automático
- ✅ **CSRF Protection** - JWT tokens do Supabase

### Variáveis de Ambiente

Crie `.env.local` baseado em `.env.example`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**⚠️ IMPORTANTE**: Nunca commite `.env.local` no git!

## 🧪 Testes (Em Desenvolvimento)

```bash
# Rodar todos os testes
npm run test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

**Meta de Cobertura**: 80%+

## 🚢 Deploy

### Recomendações de Hosting

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Supabase (incluído)
- **Edge Functions**: Supabase Edge Functions

### Build para Produção

```bash
# 1. Build otimizado
npm run build

# 2. Testar build localmente
npm run preview

# 3. Deploy (exemplo com Vercel)
npx vercel --prod
```

## 📊 Status do Projeto

### Completado ✅ (80%)

- [x] Autenticação com Supabase Auth
- [x] CRUD de Professores com React Query
- [x] CRUD de Agenda/Horários
- [x] Dashboard responsivo
- [x] Validação Zod em formulários
- [x] Sistema de cores centralizado
- [x] TypeScript strict mode
- [x] Segurança (env vars + RLS)
- [x] Documentação completa (8.500+ linhas)

### Em Progresso 🚧 (15%)

- [ ] WhatsApp Messaging (documentado)
- [ ] Testes automatizados
- [ ] ProfileView com dados reais
- [ ] SearchView com dados reais

### Planejado 📋 (5%)

- [ ] Gestão de Alunos
- [ ] Sistema de Pagamentos
- [ ] Relatórios e Analytics
- [ ] App Mobile (React Native)

## 🗺️ Roadmap

### Sprint 1-2 (Atual) ✅
- ✅ Autenticação real
- ✅ Integração com Supabase
- ✅ React Query hooks
- ✅ Documentação LLM-friendly

### Sprint 3-4 (Próximos)
- [ ] Testes unitários (Vitest)
- [ ] Componentes restantes com dados reais
- [ ] Limpeza de dependências
- [ ] Melhoria de acessibilidade

### Sprint 5-6 (Futuro)
- [ ] WhatsApp Messaging
- [ ] Notificações automáticas
- [ ] Relatórios básicos
- [ ] Testes E2E

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estes passos:

1. **Fork** o projeto
2. **Crie uma branch** (`git checkout -b feature/nova-feature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adicionar nova feature'`)
4. **Push** para a branch (`git push origin feature/nova-feature`)
5. **Abra um Pull Request**

### Convenções de Commit

```
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração de código
docs: atualização de documentação
test: adição/modificação de testes
chore: tarefas de manutenção
```

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja [LICENSE](./LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento & Documentação** - Equipe ProfFlow Manager
- **Contribuidores** - [Ver contribuidores](https://github.com/msoutole/prof-flow-manager/graphs/contributors)

## 🙏 Agradecimentos

Agradecimentos especiais às tecnologias que tornaram este projeto possível:

- [React](https://react.dev/) - The library for web and native user interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Supabase](https://supabase.com/) - The Open Source Firebase Alternative
- [TanStack Query](https://tanstack.com/query) - Powerful asynchronous state management
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Zod](https://zod.dev/) - TypeScript-first schema validation

## 📞 Suporte

- 📧 **Email**: [Criar issue no GitHub](https://github.com/msoutole/prof-flow-manager/issues)
- 📚 **Documentação**: [docs/INDEX.md](./docs/INDEX.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/msoutole/prof-flow-manager/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/msoutole/prof-flow-manager/discussions)

## 📈 Métricas do Projeto

- **Linhas de Código**: ~15.000+
- **Linhas de Documentação**: 8.500+
- **Componentes React**: 25+
- **Hooks Customizados**: 17+
- **Funções de Serviço**: 20+
- **Zod Schemas**: 5+
- **Tempo de Build**: ~2-3s
- **Bundle Size**: ~350KB (gzipped)

---

<div align="center">

**Última Atualização**: 17 de Novembro de 2025

Feito com ❤️ pela equipe ProfFlow Manager

[⬆ Voltar ao topo](#-profflow-manager-agendapro)

</div>
