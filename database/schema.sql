-- =========================================================
-- Alma Artesã — Schema MySQL
-- E-commerce de produtos artesanais (São Paulo)
-- =========================================================

CREATE DATABASE IF NOT EXISTS alma_artesa
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE alma_artesa;

-- ---------------------------------------------------------
-- USUARIO
-- ---------------------------------------------------------
CREATE TABLE usuario (
  id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(150)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  senha           VARCHAR(255)  NOT NULL,       -- hash (password_hash)
  cpf             VARCHAR(14)   UNIQUE,
  telefone        VARCHAR(20),
  tipo_usuario    ENUM('cliente','artesao','admin') NOT NULL DEFAULT 'cliente',
  foto_perfil     LONGTEXT,
  status          ENUM('ativo','inativo','bloqueado') NOT NULL DEFAULT 'ativo',
  data_cadastro   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ENDERECO
-- ---------------------------------------------------------
CREATE TABLE endereco (
  id_endereco     INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  logradouro      VARCHAR(150) NOT NULL,
  numero          VARCHAR(10)  NOT NULL,
  complemento     VARCHAR(100),
  bairro          VARCHAR(100) NOT NULL,
  cidade          VARCHAR(100) NOT NULL DEFAULT 'São Paulo',
  estado          VARCHAR(2)   NOT NULL DEFAULT 'SP',
  cep             VARCHAR(9)   NOT NULL,
  tipo_endereco   ENUM('residencial','comercial','outro') DEFAULT 'residencial',
  principal       BOOLEAN NOT NULL DEFAULT 0,
  CONSTRAINT fk_endereco_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ARTESAO (perfil de loja de um usuário do tipo 'artesao')
-- ---------------------------------------------------------
CREATE TABLE artesao (
  id_artesao      INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL UNIQUE,
  nome_loja       VARCHAR(150) NOT NULL,
  biografia       TEXT,
  foto_perfil     LONGTEXT,
  chave_pix       VARCHAR(150),
  status          ENUM('ativo','inativo','em_analise') NOT NULL DEFAULT 'em_analise',
  data_cadastro   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_artesao_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CATEGORIA
-- ---------------------------------------------------------
CREATE TABLE categoria (
  id_categoria    INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(100) NOT NULL UNIQUE,
  descricao       TEXT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PRODUTO
-- ---------------------------------------------------------
CREATE TABLE produto (
  id_produto      INT AUTO_INCREMENT PRIMARY KEY,
  id_artesao      INT NOT NULL,
  id_categoria    INT NOT NULL,
  nome            VARCHAR(150) NOT NULL,
  descricao       TEXT,
  preco           DECIMAL(10,2) NOT NULL,
  imagem          LONGTEXT,
  estoque         INT NOT NULL DEFAULT 0,
  status          ENUM('ativo','inativo','esgotado') NOT NULL DEFAULT 'ativo',
  data_cadastro   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_produto_artesao FOREIGN KEY (id_artesao)
    REFERENCES artesao(id_artesao) ON DELETE CASCADE,
  CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria)
    REFERENCES categoria(id_categoria)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CARRINHO / ITEM_CARRINHO
-- ---------------------------------------------------------
CREATE TABLE carrinho (
  id_carrinho     INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  data_criacao    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status          ENUM('aberto','finalizado') NOT NULL DEFAULT 'aberto',
  CONSTRAINT fk_carrinho_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE item_carrinho (
  id_item_carrinho INT AUTO_INCREMENT PRIMARY KEY,
  id_carrinho     INT NOT NULL,
  id_produto      INT NOT NULL,
  quantidade      INT NOT NULL DEFAULT 1,
  preco_unitario  DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  CONSTRAINT fk_item_carrinho_carrinho FOREIGN KEY (id_carrinho)
    REFERENCES carrinho(id_carrinho) ON DELETE CASCADE,
  CONSTRAINT fk_item_carrinho_produto FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PEDIDO / ITEM_PEDIDO
-- ---------------------------------------------------------
CREATE TABLE pedido (
  id_pedido       INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  id_endereco     INT NOT NULL,
  data_pedido     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status          ENUM('aguardando_pagamento','pago','enviado','concluido','cancelado') NOT NULL DEFAULT 'aguardando_pagamento',
  subtotal        DECIMAL(10,2) NOT NULL,
  frete           DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total     DECIMAL(10,2) NOT NULL,
  codigo_rastreio VARCHAR(60),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario),
  CONSTRAINT fk_pedido_endereco FOREIGN KEY (id_endereco)
    REFERENCES endereco(id_endereco)
) ENGINE=InnoDB;

CREATE TABLE item_pedido (
  id_item_pedido  INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido       INT NOT NULL,
  id_produto      INT NOT NULL,
  quantidade      INT NOT NULL,
  preco_unitario  DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  CONSTRAINT fk_item_pedido_pedido FOREIGN KEY (id_pedido)
    REFERENCES pedido(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_item_pedido_produto FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PAGAMENTO
-- ---------------------------------------------------------
CREATE TABLE pagamento (
  id_pagamento    INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido       INT NOT NULL,
  forma_pagamento ENUM('pix','cartao_credito','cartao_debito','boleto') NOT NULL,
  status_pagamento ENUM('pendente','aprovado','recusado','estornado') NOT NULL DEFAULT 'pendente',
  valor           DECIMAL(10,2) NOT NULL,
  data_pagamento  TIMESTAMP NULL,
  codigo_transacao VARCHAR(100),
  CONSTRAINT fk_pagamento_pedido FOREIGN KEY (id_pedido)
    REFERENCES pedido(id_pedido) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- AVALIACAO
-- ---------------------------------------------------------
CREATE TABLE avaliacao (
  id_avaliacao    INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  id_produto      INT NOT NULL,
  nota            TINYINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario      TEXT,
  data_avaliacao  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_avaliacao_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_avaliacao_produto FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto) ON DELETE CASCADE,
  UNIQUE KEY uq_avaliacao_usuario_produto (id_usuario, id_produto)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- LISTA_DESEJOS / ITEM_LISTA_DESEJOS
-- ---------------------------------------------------------
CREATE TABLE lista_desejos (
  id_lista_desejos INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL UNIQUE,
  data_criacao    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lista_desejos_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE item_lista_desejos (
  id_item_lista   INT AUTO_INCREMENT PRIMARY KEY,
  id_lista_desejos INT NOT NULL,
  id_produto      INT NOT NULL,
  data_adicao     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_item_lista_lista FOREIGN KEY (id_lista_desejos)
    REFERENCES lista_desejos(id_lista_desejos) ON DELETE CASCADE,
  CONSTRAINT fk_item_lista_produto FOREIGN KEY (id_produto)
    REFERENCES produto(id_produto) ON DELETE CASCADE,
  UNIQUE KEY uq_lista_produto (id_lista_desejos, id_produto)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- NOTIFICACAO
-- ---------------------------------------------------------
CREATE TABLE notificacao (
  id_notificacao  INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  titulo          VARCHAR(150) NOT NULL,
  mensagem        TEXT NOT NULL,
  tipo            ENUM('pedido','pagamento','sistema','promocao') NOT NULL DEFAULT 'sistema',
  data_envio      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lida            BOOLEAN NOT NULL DEFAULT 0,
  CONSTRAINT fk_notificacao_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Índices auxiliares de busca
-- ---------------------------------------------------------
CREATE INDEX idx_produto_nome ON produto(nome);
CREATE INDEX idx_produto_categoria ON produto(id_categoria);
CREATE INDEX idx_produto_artesao ON produto(id_artesao);

-- ---------------------------------------------------------
-- Seed mínimo de categorias
-- ---------------------------------------------------------
INSERT INTO categoria (nome, descricao) VALUES
 ('Cerâmica', 'Peças de barro e cerâmica artesanal'),
 ('Vestuário', 'Roupas e acessórios de vestir feitos à mão'),
 ('Joias e Bijuterias', 'Colares, brincos e acessórios artesanais'),
 ('Decoração', 'Itens decorativos para casa'),
 ('Têxteis', 'Tapetes, almofadas e tecidos');

-- ---------------------------------------------------------
-- Seed de demonstração: usuário artesão + loja + produtos reais
-- (imagens em /public/produtos/ no front-end React)
-- ---------------------------------------------------------
INSERT INTO usuario (nome, email, senha, telefone, tipo_usuario, status) VALUES
 ('Ateliê Terra & Barro', 'contato@terraebarro.com.br',
  '$2y$10$92IxUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hash de exemplo, trocar no cadastro real
  '(11) 90000-0000', 'artesao', 'ativo');

INSERT INTO artesao (id_usuario, nome_loja, biografia, status) VALUES
 (LAST_INSERT_ID(),
  'Ateliê Terra & Barro',
  'Há 12 anos moldando peças de cerâmica na Zona Leste de São Paulo, unindo técnicas tradicionais herdadas da família a um olhar contemporâneo.',
  'ativo');

SET @id_artesao = LAST_INSERT_ID();
SET @cat_ceramica   = (SELECT id_categoria FROM categoria WHERE nome = 'Cerâmica');
SET @cat_joias      = (SELECT id_categoria FROM categoria WHERE nome = 'Joias e Bijuterias');
SET @cat_decoracao  = (SELECT id_categoria FROM categoria WHERE nome = 'Decoração');
SET @cat_texteis    = (SELECT id_categoria FROM categoria WHERE nome = 'Têxteis');

INSERT INTO produto (id_artesao, id_categoria, nome, descricao, preco, imagem, estoque) VALUES
 (@id_artesao, @cat_ceramica,  'Castiçal de Barro',            'Castiçal modelado à mão em barro queimado, acabamento fosco.',        40.00, '/produtos/castical-de-barro.jpg',            12),
 (@id_artesao, @cat_texteis,   'Tapete de Lã Tecido',           'Tapete tecido em tear manual com lã 100% natural.',                    55.00, '/produtos/tapete-de-la-tecido.jpg',           6),
 (@id_artesao, @cat_joias,     'Colar de Prata de Lei',         'Colar artesanal em prata de lei 925, peça única.',                    150.00, '/produtos/colar-de-prata-de-lei.jpg',          4),
 (@id_artesao, @cat_joias,     'Brincos de Cobre Martelado',    'Brincos de cobre martelado à mão, com acabamento antique.',           100.00, '/produtos/brincos-de-cobre-martelado.jpg',     9),
 (@id_artesao, @cat_ceramica,  'Bandeja de Chá Vidrada',        'Bandeja de cerâmica vidrada, ideal para servir chás e cafés.',         15.00, '/produtos/bandeja-de-cha-vidrada.jpg',        20),
 (@id_artesao, @cat_decoracao, 'Relógio de Bolso',              'Relógio de bolso artesanal com corrente de latão.',                    70.00, '/produtos/relogio-de-bolso.jpg',               3),
 (@id_artesao, @cat_texteis,   'Almofada Bordada',              'Almofada com bordado floral feito à mão em linha natural.',            90.00, '/produtos/almofada-bordada.jpg',               7),
 (@id_artesao, @cat_ceramica,  'Conjunto de Copos de Barro',    'Conjunto com 4 copos de barro, queima tradicional.',                   35.00, '/produtos/conjunto-de-copos-de-barro.jpg',    15);
