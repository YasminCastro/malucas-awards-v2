# Malucas Awards 2026

Plataforma de votação e awards para um grupo de amigos, inspirada na estética dos VMAs e MTV dos anos 2000.

## 🚀 Tecnologias

- **Next.js 16** com App Router
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- Armazenamento em arquivo JSON (pode ser migrado para banco de dados)

## 📋 Funcionalidades Implementadas

### Sistema de Autenticação ✅

- **Pré-cadastro**: Usuários devem ser pré-cadastrados antes de usar o sistema
- **Login** (`/login`): Login com Instagram e senha
- **Signup** (`/signup`): Primeiro acesso para definir senha (apenas para usuários pré-cadastrados)
- Autenticação via JWT armazenado em cookies HTTP-only
- Senhas criptografadas com bcrypt
- Middleware de proteção de rotas
- Logout funcional

## 🛠️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
JWT_SECRET=sua-chave-secreta-aqui
```

Para gerar uma chave segura:

```bash
openssl rand -base64 32
```

### Instalação

```bash
npm install
```

### Executar em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
├── app/
│   ├── api/auth/        # API routes de autenticação
│   ├── login/           # Página de login
│   ├── signup/          # Página de signup
│   └── page.tsx         # Página principal (protegida)
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   └── logout-button.tsx
├── lib/
│   ├── auth.ts          # Utilitários de autenticação
│   └── db.ts            # Gerenciamento de dados (JSON)
├── scripts/
│   ├── pre-register-users.ts  # Script para pré-cadastrar usuários
│   └── README.md        # Documentação dos scripts
├── data/                # Armazenamento de usuários (JSON)
└── proxy.ts             # Proxy de autenticação (Next.js 16)
```

## 🔐 Como Usar

### Para Administradores (Pré-cadastrar Usuários)

1. Edite o arquivo `scripts/pre-register-users.ts` e adicione os Instagrams dos usuários
2. Execute o script de pré-cadastro:
   ```bash
   npm run pre-register
   ```

### Para Usuários

1. **Primeiro acesso**: Acesse `/signup` e defina sua senha (você deve estar pré-cadastrado)
2. **Login**: Faça login em `/login` com seu Instagram e senha
3. Acesse a página principal (protegida por autenticação)
4. Use o botão "SAIR" para fazer logout

**Importante:** Usuários não podem criar contas por conta própria. Eles devem ser pré-cadastrados por um administrador primeiro.

## 📝 Próximos Passos

- Sistema de votação
- Categorias de premiação
- Visualização de resultados
- Design inspirado nos VMAs/MTV anos 2000

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
