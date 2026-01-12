# Scripts de Administração

## Pré-cadastrar Usuários

Para pré-cadastrar usuários no sistema (antes deles definirem suas senhas):

1. Edite o arquivo `scripts/pre-register-users.ts` e adicione os Instagrams dos usuários na lista `usersToRegister`
2. Execute o script:

```bash
npx tsx scripts/pre-register-users.ts
```

Ou adicione ao `package.json`:

```json
{
  "scripts": {
    "pre-register": "tsx scripts/pre-register-users.ts"
  }
}
```

Depois execute:
```bash
npm run pre-register
```

**Importante:** Os usuários pré-cadastrados precisarão acessar `/signup` para definir suas senhas antes de poderem fazer login.
