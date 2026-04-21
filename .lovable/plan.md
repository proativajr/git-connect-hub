

## Plano: Aba "Calendário" + aba "Drive" em cada diretoria (Google OAuth)

### Visão geral
Adicionar uma aba global **Calendário** na seção "Planejamento" da sidebar e uma aba **Drive** dentro de cada uma das 4 diretorias (Presidência, Vice-Presidência, Projetos, Comercial). A integração será via **Google OAuth completo**: cada usuário faz login com sua conta Google e vê seus próprios eventos/arquivos. Cada aba "Drive" pode ser configurada por um admin para apontar para uma pasta específica do Google Drive da diretoria correspondente.

### Pré-requisitos do usuário (Google Cloud Console)
Antes de a integração funcionar, você precisará:
1. Criar um projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Ativar as APIs: **Google Calendar API** e **Google Drive API**
3. Configurar a tela de consentimento OAuth (External, com escopos `calendar.readonly`, `calendar.events`, `drive.readonly`, `drive.file`, `userinfo.email`, `userinfo.profile`)
4. No painel do Supabase → Authentication → Providers → Google: ativar o provider e colar Client ID + Client Secret
5. Em Authorized redirect URIs do Google, adicionar a URL do Supabase: `https://iglmchnscxruybdiuseo.supabase.co/auth/v1/callback`

Você fará isso após a aprovação. Eu te dou um passo-a-passo no chat na hora da implementação.

### Estrutura da sidebar (depois)

```text
Visão Geral
DIRETORIAS
 ├─ Presidência
 │   ├─ MEJ
 │   ├─ Relação Institucional
 │   ├─ Parcerias
 │   ├─ Financeiro
 │   ├─ Drive — Presidência         (novo, sem gate)
 │   └─ Monday — Presidência
 ├─ Vice-Presidência
 │   ├─ Financeiro
 │   ├─ Gente e Gestão
 │   ├─ EndoMarketing
 │   ├─ Gamificação
 │   ├─ Drive — VP                  (novo)
 │   └─ Monday — VP
 ├─ Projetos
 │   ├─ Projetos
 │   ├─ Inovação
 │   ├─ Drive — Projetos            (novo)
 │   └─ Monday — Projetos
 └─ Comercial
     ├─ Monday CRM
     ├─ Vendas
     ├─ Marketing
     ├─ Drive — Comercial           (novo)
     └─ Monday — Comercial
PLANEJAMENTO
 ├─ Planejamento Estratégico
 ├─ Identidade & Governança
 ├─ Parcerias
 ├─ Calendário                      (novo)
 ├─ Galeria
 └─ Membros
```

### Páginas a criar

**1. `src/pages/CalendarioPage.tsx`** (rota `/calendario`)
- Banner "Conectar Google" se o usuário ainda não autorizou (botão dispara `supabase.auth.signInWithOAuth({ provider: 'google', scopes: ... })`).
- Após conectado: lista os calendários do usuário (`GET /calendar/v3/users/me/calendarList`) com toggles e mostra eventos do mês corrente em uma grade (`GET /calendar/v3/calendars/{id}/events`).
- Botão "Adicionar evento" abre Dialog com título, data, hora, descrição → `POST` no calendar primário.
- Pode alternar entre vários calendários do Google (é isso que você pediu com "várias APIs do Google Calendar").

**2. `src/pages/DrivePage.tsx`** (rotas `/presidencia/drive`, `/vice-presidencia/drive`, `/projetos/drive`, `/comercial/drive`)
- Componente único parametrizado por prop `diretoria`.
- Banner "Conectar Google" se ainda não autorizou.
- Mostra arquivos da pasta configurada para a diretoria (`GET /drive/v3/files?q='{folderId}' in parents`).
- Suporta navegação em subpastas, abrir arquivo no Google Drive em nova aba, upload simples (`POST /upload/drive/v3/files`).
- Se admin, mostra um campo "ID/URL da pasta do Drive desta diretoria" que salva em `diretoria_drive_config`.

**3. `src/components/google/GoogleConnectButton.tsx`** — botão reutilizável de conexão.

**4. `src/hooks/useGoogleToken.ts`** — extrai e mantém o `provider_token` da sessão Supabase (Google access token), com refresh quando expira.

### Banco de dados

Nova tabela `diretoria_drive_config` para guardar o ID da pasta raiz do Drive de cada diretoria:

| coluna | tipo | nota |
|---|---|---|
| diretoria | text PK | `presidencia`, `vp`, `projetos`, `comercial` |
| folder_id | text | ID da pasta no Google Drive |
| folder_name | text | rótulo amigável |
| updated_at | timestamptz | default now() |

RLS:
- SELECT: qualquer usuário autenticado
- INSERT/UPDATE: apenas admins (`has_role(auth.uid(),'admin')`)

### Configuração do Supabase Auth

Habilitar o provider Google no painel do Supabase (você fará). Não há código de provider para mudar — `signInWithOAuth({ provider: 'google' })` com `scopes` apropriados já basta. O `provider_token` retornado é usado direto contra as APIs do Google.

### Roteamento (`src/App.tsx`)

Adicionar dentro do bloco `DashboardLayout`:
```text
/calendario
/presidencia/drive            (sem PasswordGate, conforme decidido)
/vice-presidencia/drive
/projetos/drive
/comercial/drive
```

### Sidebar (`src/layouts/DashboardLayout.tsx`)

- Em `mainNavItems`: adicionar `{ title: "Calendário", path: "/calendario", icon: Calendar }` antes de "Galeria".
- Em cada um dos 4 grupos de `diretorias`: adicionar `{ title: "Drive — <nome>", path: "...", icon: FolderOpen }` logo antes do item Monday.
- O item Drive da Presidência **não** entra na lógica de gate (decidido nas perguntas).

### Detalhes técnicos (resumo)

- Login Google via `supabase.auth.signInWithOAuth` retorna access token em `session.provider_token`. Usamos `Authorization: Bearer <provider_token>` direto nas chamadas para `googleapis.com`. Sem edge function necessária para começar.
- Quando o token expira (~1h), forçamos novo `signInWithOAuth` silencioso ou exibimos botão "Reconectar".
- Limites de quota do Google são por projeto OAuth do usuário — sem custo para a maioria dos usos.
- Sem PasswordGate em nenhuma aba Drive.

### Arquivos alterados/criados

| Arquivo | Ação |
|---|---|
| `src/pages/CalendarioPage.tsx` | criar |
| `src/pages/DrivePage.tsx` | criar (parametrizado) |
| `src/components/google/GoogleConnectButton.tsx` | criar |
| `src/hooks/useGoogleToken.ts` | criar |
| `src/layouts/DashboardLayout.tsx` | adicionar Calendário + 4 itens Drive |
| `src/App.tsx` | 5 rotas novas |
| migration SQL | tabela `diretoria_drive_config` + RLS |

### O que será pedido na hora da execução
- Te guio passo-a-passo para criar credenciais OAuth no Google Cloud e habilitar o provider Google no Supabase. Sem isso, os botões "Conectar Google" não funcionarão, mas o resto do app continua normal.

