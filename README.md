# Controle de Licenças de Software — Web

Frontend em Angular do sistema de Controle de Licenças de Software. Documentação completa do projeto (modelo de domínio, regras de negócio, roteiro de fases) fica em [`../CLAUDE.md`](../CLAUDE.md).

## Stack

- Angular 22 (standalone components, signals, novo control flow `@if`/`@for`)
- TypeScript
- Reactive Forms (formulários) + Template-driven Forms (filtros simples)
- CSS/SCSS puro (sem biblioteca de componentes)

## Estrutura

```text
src/app/
  core/               interceptor e guard de autenticação
  shared/
    icons/             componente de ícone (SVG inline, sem dependência externa)
    pipes/             pipe de data em formato brasileiro (dataBr)
  features/
    auth/              login
    dashboard/         cards + próximos vencimentos
    usuarios/          CRUD de colaboradores
    licencas/          CRUD de licenças
    movimentacoes/      alocar/encerrar licenças
    timeline/          linha do tempo (CSS/HTML puro, sem lib de gráficos)
```

Cada feature segue o mesmo padrão: `entidade.ts` (modelo), `entidade.service.ts` (chamadas HTTP), telas de listagem/formulário/visualização separadas.

## Pré-requisitos

- Node.js 20+
- [`software-license-api`](../software-license-api) rodando em `http://localhost:5289`

## Rodando localmente

```bash
npm install
npm start
```

Abre em `http://localhost:4200`. A URL da API é configurada em `src/environments/environment.development.ts`.

Login necessário para acessar qualquer tela — veja o README da API para criar o usuário administrador local.

## Build

```bash
npm run build
```

Gera os artefatos de produção em `dist/`.

## Padrões do projeto

- **Sem biblioteca de UI** (Angular Material, etc.) — componentes leves em CSS/SCSS puro, por decisão do projeto (ver seção 3 do `CLAUDE.md`).
- **Sem NgRx/gerenciador de estado** — cada tela carrega seus próprios dados via `signal()`.
- Nomes de domínio, rotas e mensagens em português; nomes técnicos (classes, tipos) em inglês.
- Autenticação: token JWT em `localStorage`, anexado automaticamente pelo `authInterceptor` (`core/auth-interceptor.ts`); rotas protegidas por `authGuard` (`core/auth-guard.ts`).
