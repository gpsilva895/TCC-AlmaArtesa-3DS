# Alma Artesã — Plataforma de E-commerce Artesanal

E-commerce de produtos artesanais de pequenos produtores de São Paulo
(ODS 8 — Trabalho Decente e Crescimento Econômico).

## Estrutura do projeto

```
alma-artesa/
├── docker-compose.yml       # Sobe MySQL + API PHP prontos, com um comando
├── database/
│   └── schema.sql            # DDL completo do MySQL (14 tabelas) + seed com os 8 produtos reais
├── backend/                  # API REST em PHP puro (PDO)
│   ├── Dockerfile             # PHP 8.2 + extensão pdo_mysql
│   ├── config/
│   │   ├── database.php       # Conexão PDO (lê host/usuário/senha de variáveis de ambiente)
│   │   └── cors.php           # Headers CORS/JSON, incluído no topo de cada endpoint
│   └── api/
│       ├── usuarios.php       # Cadastro, login, perfil
│       ├── produtos.php       # CRUD de produtos + busca/filtro
│       ├── artesaos.php       # Perfil de um artesão (loja + biografia)
│       ├── carrinho.php       # Adicionar/alterar/remover itens do carrinho
│       └── pedidos.php        # Checkout: cria pedido, pagamento, baixa estoque
└── frontend/                 # React + Vite + Tailwind
    ├── public/
    │   ├── logo-alma-artesa.png   # Logo oficial (agulha + "A")
    │   └── produtos/               # Fotos reais dos 8 produtos do catálogo
    └── src/
        ├── context/          # AuthContext, CartContext (carrinho + lista de desejos)
        ├── services/api.js   # Cliente HTTP para as APIs PHP
        ├── data/mockData.js  # Catálogo de reserva, só usado se a API estiver fora do ar
        ├── utils/formatar.js # Formatação de preço (trata DECIMAL do MySQL, que chega como string)
        ├── components/       # Header, Footer, ProdutoCard, Estrelas, ícones
        └── pages/             # Home, Busca, ProdutoDetalhe, PerfilArtesao, Carrinho,
                                 ListaDesejos, Checkout, Login, Cadastro, Perfil, Desenvolvedores
```

## Catálogo atual

O catálogo (seed do `schema.sql`, servido pela API) contém os **8 produtos
que têm foto real**: Castiçal de Barro, Tapete de Lã Tecido, Colar de Prata
de Lei, Brincos de Cobre Martelado, Bandeja de Chá Vidrada, Relógio de
Bolso, Almofada Bordada e Conjunto de Copos de Barro. Os produtos que só
existiam como placeholder no protótipo (Boné, Vestido, Vaso de Planta,
Ursinho de Pelúcia) foram removidos por não terem foto correspondente.

## Como rodar (só o MySQL no XAMPP, API PHP via `php -S`)

Cenário: você já tem o **XAMPP com o MySQL/MariaDB** rodando, mas prefere
não usar o Apache do XAMPP — a API PHP roda direto pelo servidor embutido
do próprio PHP. Você pode usar o PHP que já vem dentro do XAMPP (não
precisa instalar PHP separado).

### 1. Ligue só o MySQL no XAMPP Control Panel
Clique em "Start" ao lado de **MySQL** (não precisa do Apache).

### 2. Crie o banco com o `schema.sql`
Pelo phpMyAdmin do próprio XAMPP (`http://localhost/phpmyadmin`, que
funciona mesmo sem precisar do Apache "ligado" pra outras coisas — ele
mesmo é servido pelo Apache do XAMPP, então nesse passo específico ligue
o Apache também, só pra importar o schema, depois pode desligar):
1. Acesse `http://localhost/phpmyadmin`.
2. Clique em "Novo" e crie o banco `alma_artesa`.
3. Selecione o banco → aba "Importar" → escolha `database/schema.sql` deste
   projeto → "Executar". Isso cria as 14 tabelas e já popula os 8 produtos,
   categorias, e 1 artesão de demonstração.

Ou pelo terminal, sem precisar do Apache nem do phpMyAdmin:
```bash
# Windows (cmd):
C:\xampp\mysql\bin\mysql.exe -u root < caminho\para\database\schema.sql

# macOS:
/Applications/XAMPP/xamppfiles/bin/mysql -u root < database/schema.sql

# Linux:
/opt/lampp/bin/mysql -u root < database/schema.sql
```

O XAMPP usa por padrão usuário `root`, **sem senha**, porta `3306` — que já
são os valores padrão em `backend/config/database.php`. Se seu XAMPP usa
outra senha/porta, defina as variáveis de ambiente `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASS` antes do passo 3 (ex. `set DB_PASS=minhasenha` no
Windows, ou `export DB_PASS=minhasenha` no macOS/Linux), ou edite os
valores padrão direto no arquivo.

### 3. Suba a API PHP com o servidor embutido
Use o PHP que já vem dentro do XAMPP:
```bash
# Windows:
cd backend
C:\xampp\php\php.exe -S localhost:8000

# macOS:
cd backend
/Applications/XAMPP/xamppfiles/bin/php -S localhost:8000

# Linux:
cd backend
/opt/lampp/bin/php -S localhost:8000
```
(Se você já tem PHP instalado separado do XAMPP, `php -S localhost:8000`
de dentro da pasta `backend/` também funciona normalmente.)

Para conferir se subiu certo e já está lendo do MySQL do XAMPP, acesse:
```
http://localhost:8000/api/produtos.php
```
Deve aparecer um JSON com os 8 produtos. Se aparecer um erro de conexão,
o `detalhe` no JSON de resposta diz exatamente o motivo (senha errada,
banco não existe, MySQL desligado etc.).

### 4. Front-end (React)
```bash
cd frontend
npm install
npm run dev
```
O Vite já tem proxy de `/api` para `http://localhost:8000` por padrão
(`vite.config.js`), que é exatamente onde a API do passo 3 está rodando.
Abra `http://localhost:5173` — produtos, cadastro, login, perfil com
endereço e checkout já leem e gravam no MySQL do XAMPP.

> **Modo offline:** se a API/MySQL não estiverem no ar, a Home e a Busca
> detectam a falha na requisição e caem automaticamente para o catálogo de
> exemplo em `src/data/mockData.js` (aparece um aviso discreto na tela),
> só pra navegação não travar. Com a API e o MySQL do XAMPP no ar, esse
> aviso não deve aparecer.

### Alternativa: servir o PHP pelo Apache do XAMPP também
Se preferir que o Apache do XAMPP sirva a API (em vez do `php -S`), copie
`backend/` para dentro de `htdocs` (ex. `htdocs/alma-artesa/backend`) e
rode o front com:
```bash
VITE_API_PROXY_TARGET=http://localhost/alma-artesa/backend npm run dev
```

### Alternativa: Docker (sem precisar instalar nada)
O projeto também inclui um `docker-compose.yml` que sobe MySQL + API PHP
com um comando (`docker compose up -d`), API em `http://localhost:8000`
(mesma porta usada no passo 3 acima), MySQL em `localhost:3306`, usuário
`root`, senha `alma123`. Nesse caso ajuste `DB_PASS=alma123` se for
comparar com o método do XAMPP.