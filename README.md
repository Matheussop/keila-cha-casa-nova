# Site da Keila

Site de cha de casa nova com:

- lista de presentes compartilhada online
- bloqueio de item reservado
- opcao de desmarcar item usando nome e WhatsApp da reserva
- chave Pix com botao para copiar
- area administrativa escondida para editar itens e textos
- deploy pensado para Vercel

## Stack

- Next.js 16
- React 19
- Supabase
- Tailwind CSS 4

## Variaveis de ambiente

Crie um arquivo `.env.local` com:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SALT=
```

`ADMIN_SESSION_SALT` pode ser qualquer texto longo e privado.

## Banco no Supabase

Execute o SQL do arquivo `supabase/schema.sql`.

Esse script cria:

- tabela `gift_items`
- tabela `site_settings`
- itens padrao do cha de casa nova
- configuracao inicial com o nome `Keila`

## Rodando localmente

```bash
npm install
npm run dev
```

Site publico:

```text
http://localhost:3000
```

Painel escondido:

```text
http://localhost:3000/acesso-keila
```

## Deploy na Vercel

1. Suba este projeto para um repositorio Git.
2. Importe o repositorio na Vercel.
3. Adicione as mesmas variaveis de ambiente do `.env.local`.
4. Garanta que o banco do Supabase ja recebeu o `supabase/schema.sql`.
5. Publique.

## Observacoes

- Sem Supabase configurado, o layout abre com dados de exemplo, mas reservas e edicoes nao sao salvas online.
- A rota administrativa nao aparece no site publico.
