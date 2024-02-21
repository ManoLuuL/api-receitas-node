# API de Receitas

Bem-vindo à API de Receitas! Esta API permite buscar receitas por nome, ingredientes e restrições alimentares. Além disso, oferece funcionalidades de cadastro de usuário e login para acesso aos recursos protegidos.

## Tecnologias Utilizadas
- Node.js
- Express.js
- Postgres (ou qualquer outro banco de dados de sua escolha para persistência de dados de usuários e receitas)

## Instalação
1. Clone este repositório: `git clone https://github.com/ManoLuuL/api-receitas-node.git`
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente conforme descrito em `db-connection.js`
4. Inicie o servidor: `npm start`
   
## Rotas

### Autenticação
- `POST /user`: Cadastrar um novo usuário.
  - Corpo da requisição: `{ "nome": "example", "email": "exemple", "senha": "password", "idade": "number", "diabetico": "boolean", "vegetariano": "boolean", "vegano": "boolean", "alergico_a_lactose": "boolean" }`
- `POST /login`: Autenticar usuário e obter token de acesso.
  - Corpo da requisição: `{ "email": "example", "senha": "password" }`

### Receitas

#### Buscar todas as receitas
- Método: `GET`
- Endpoint: `/receitas`

#### Buscar receitas por ingredientes
- Método: `POST`
- Endpoint: `/receitas`
- Corpo da requisição: `{ "ingredientes_ids": [1, 2, 3] }`

#### Buscar receitas por ingredientes e restrições
- Método: `POST`
- Endpoint: `/receitas/buscar_por_ingredientes_e_restricoes`
- Corpo da requisição: `{ "ingredientes_ids": [1, 2, 3], "restricoes": ["diabetico", "vegetariano"] }`

#### Buscar receitas por nome
- Método: `GET`
- Endpoint: `/receitas/buscar?nome=nome_da_receita`

## Contribuindo
Contribuições são bem-vindas! Se você tem sugestões, correções ou melhorias, por favor, abra uma issue ou envie um pull request.

## Licença
Este projeto está licenciado sob a MIT License.