# Biblioteca JWT — API

API do Trabalho Integrador da ADS Unipar. Node.js, Express, Sequelize, SQLite, bcrypt e JWT. Use junto com o projeto `jwt-app`, que tem a interface Next.js.

## Instalação no Windows

Use Node.js 24 LTS e Git. Abra o PowerShell nesta pasta.

```powershell
npm.cmd ci
Copy-Item .envex .env
node -e "const c=require('node:crypto'); for(let i=0;i<2;i++) console.log(c.randomBytes(32).toString('hex'))"
notepad .env
```

Preencha `JWT_SECRET` e `JWT_REFRESH_SECRET` com as duas linhas geradas, uma diferente da outra. Escolha uma `ADMIN_PASSWORD` de pelo menos seis caracteres para o teste. Salve o arquivo e rode:

```powershell
npm.cmd start
```

| Variável | Uso |
| --- | --- |
| `PORT` | Porta da API. O padrão é 3000. |
| `FRONTEND_URL` | Origem liberada pelo CORS. O padrão é http://localhost:3001. |
| `JWT_SECRET` | Chave de assinatura do access token. |
| `JWT_REFRESH_SECRET` | Chave de assinatura do refresh token. |
| `ADMIN_EMAIL` | E-mail do primeiro administrador, por padrão admin@biblioteca.com. |
| `ADMIN_PASSWORD` | Senha inicial do administrador. |
| `ACCESS_TOKEN_TTL` | Prazo do access token. Use 15m no trabalho e 30s para a gravação. |
| `DB_FILE` | Opcional. Arquivo do banco, por padrão database.sqlite. |

Na primeira inicialização, a API cria as tabelas e o administrador com usuário `admin`. Alterar o .env depois disso só muda as credenciais do seed em um banco novo. A pasta já vem preparada para gerar um banco limpo.

## Como testar no Postman

1. Importe `Biblioteca.postman_collection.json`. Abra **Variables** na coleção e preencha `adminEmail` e `adminPassword` com os valores locais.
2. Execute as pastas na ordem do número, começando pelo login. A coleção guarda os tokens e os IDs das respostas. Use dados novos se já tiver preenchido o banco pela interface, pois nome de categoria, ISBN, CPF e e-mail de usuário são únicos.
3. Confira o cadastro e a edição dos registros, o filtro do acervo e o movimento de estoque. As exclusões de registros vinculados retornam 409. O relatório é exclusivo do administrador e retorna 403 com o token do atendente.
4. Na pasta **Renovação e logout**, confira que a API troca o par de tokens e que repetir o refresh antigo revoga o novo. Faça o novo login indicado na coleção antes de testar o logout.
5. Para ver multa no Postman, registre um empréstimo e execute o comando abaixo com o ID da resposta antes de enviar **Devolver**. Use somente num empréstimo de demonstração.

```powershell
npm.cmd run demo:atraso -- 1
```

O roteiro completo de gravação e entrega acompanha os dois projetos.

## Decisões

- Cada módulo usa router, controller, service e model quando há tabela. As associações ficam em `models/index.js`, incluindo a tabela intermediária BookAuthor. O relatório consulta os modelos existentes.
- O access token tem 15 minutos e vai no header Authorization. O refresh JWT tem sete dias, fica na tabela RefreshToken e é rotacionado em transação. Reuso de um refresh revogado encerra os refresh tokens daquele usuário.
- A antiga tabela de bloqueio do access token foi removida. O logout revoga o refresh da sessão. Um access token emitido continua sujeito ao seu prazo curto e à verificação de conta ativa nas rotas protegidas.
- O administrador cria e desativa atendentes. O administrador inicial é criado pelo seed. Qualquer tentativa de cadastrar um administrador pela rota de atendentes cria uma conta de atendente.
- Empréstimo e devolução alteram estoque na mesma transação. O prazo é de sete dias corridos e o status de atraso é calculado pela data. Empréstimo devolvido guarda a multa de R$ 1,00 por dia de atraso. O histórico impede exclusão de livros já emprestados.
- O relatório conta títulos cadastrados, separa os empréstimos vigentes dos atrasados e soma multas registradas nas devoluções.
- A API usa placeholders em `.envex`. O `.env` e o SQLite local ficam fora do Git.

[Enunciado da Unipar](https://github.com/ADS-Unipar/jwt-api/blob/main/README.md)
