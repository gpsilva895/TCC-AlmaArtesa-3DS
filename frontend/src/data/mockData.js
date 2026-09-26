/**
 * Dados de demonstração — usados como fallback quando a API PHP
 * ainda não está rodando, para que a interface seja navegável offline.
 */
export const categorias = [
  { id_categoria: 1, nome: 'Cerâmica' },
  { id_categoria: 2, nome: 'Vestuário' },
  { id_categoria: 3, nome: 'Joias e Bijuterias' },
  { id_categoria: 4, nome: 'Decoração' },
  { id_categoria: 5, nome: 'Têxteis' },
];

export const artesaos = [
  {
    id_artesao: 1,
    nome_loja: 'Ateliê Terra & Barro',
    biografia:
      'Há 12 anos moldando peças de cerâmica na Zona Leste de São Paulo, unindo técnicas tradicionais herdadas da família a um olhar contemporâneo.',
    foto_perfil: null,
  },
];

export const produtos = [
  { id_produto: 1, id_artesao: 1, id_categoria: 1, nome: 'Castiçal de Barro', preco: 40, estoque: 12, imagem: '/produtos/castical-de-barro.jpg', descricao: 'Castiçal modelado à mão em barro queimado, acabamento fosco.' },
  { id_produto: 2, id_artesao: 1, id_categoria: 5, nome: 'Tapete de Lã Tecido', preco: 55, estoque: 6, imagem: '/produtos/tapete-de-la-tecido.jpg', descricao: 'Tapete tecido em tear manual com lã 100% natural.' },
  { id_produto: 3, id_artesao: 1, id_categoria: 3, nome: 'Colar de Prata de Lei', preco: 150, estoque: 4, imagem: '/produtos/colar-de-prata-de-lei.jpg', descricao: 'Colar artesanal em prata de lei 925, peça única.' },
  { id_produto: 4, id_artesao: 1, id_categoria: 3, nome: 'Brincos de Cobre Martelado', preco: 100, estoque: 9, imagem: '/produtos/brincos-de-cobre-martelado.jpg', descricao: 'Brincos de cobre martelado à mão, com acabamento antique.' },
  { id_produto: 5, id_artesao: 1, id_categoria: 1, nome: 'Bandeja de Chá Vidrada', preco: 15, estoque: 20, imagem: '/produtos/bandeja-de-cha-vidrada.jpg', descricao: 'Bandeja de cerâmica vidrada, ideal para servir chás e cafés.' },
  { id_produto: 6, id_artesao: 1, id_categoria: 4, nome: 'Relógio de Bolso', preco: 70, estoque: 3, imagem: '/produtos/relogio-de-bolso.jpg', descricao: 'Relógio de bolso artesanal com corrente de latão.' },
  { id_produto: 7, id_artesao: 1, id_categoria: 5, nome: 'Almofada Bordada', preco: 90, estoque: 7, imagem: '/produtos/almofada-bordada.jpg', descricao: 'Almofada com bordado floral feito à mão em linha natural.' },
  { id_produto: 8, id_artesao: 1, id_categoria: 1, nome: 'Conjunto de Copos de Barro', preco: 35, estoque: 15, imagem: '/produtos/conjunto-de-copos-de-barro.jpg', descricao: 'Conjunto com 4 copos de barro, queima tradicional.' },
];

export const desenvolvedores = [
  { nome: 'Lorem Ipsum', papel: 'Desenvolvedor(a) Front-end', bio: 'Responsável pela interface em React e pela experiência do usuário.' },
  { nome: 'Lorem Ipsum', papel: 'Desenvolvedor(a) Back-end', bio: 'Responsável pelas APIs em PHP e pela modelagem do banco de dados.' },
  { nome: 'Lorem Ipsum', papel: 'Desenvolvedor(a) Mobile', bio: 'Responsável pelo aplicativo Android do Alma Artesã.' },
];
