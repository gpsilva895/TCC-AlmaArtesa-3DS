/**
 * Alma Artesã — Cliente de API
 * Centraliza as chamadas ao back-end PHP.
 *
 * Em desenvolvimento (`npm run dev`), o Vite faz proxy de "/api" para o
 * back-end (veja vite.config.js) — não precisa mudar nada aqui.
 * Se preferir apontar direto para o XAMPP (ex.: build de produção servido
 * fora do Vite), defina VITE_API_BASE_URL no arquivo `.env` do front-end,
 * ex.: VITE_API_BASE_URL=http://localhost/alma-artesa/backend/api
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.erro || 'Erro na requisição.');
  }
  return data;
}

export const api = {
  // Produtos
  listarProdutos: (params = {}) =>
    request(`produtos.php?${new URLSearchParams(params)}`),
  obterProduto: (id) => request(`produtos.php?id=${id}`),

  // Usuário
  cadastrar: (dados) =>
    request('usuarios.php?acao=cadastro', { method: 'POST', body: JSON.stringify(dados) }),
  login: (dados) =>
    request('usuarios.php?acao=login', { method: 'POST', body: JSON.stringify(dados) }),
  obterUsuario: (id) => request(`usuarios.php?id=${id}`),
  atualizarPerfil: (id, dados) =>
    request(`usuarios.php?id=${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  // Carrinho
  obterCarrinho: (idUsuario) => request(`carrinho.php?id_usuario=${idUsuario}`),
  adicionarAoCarrinho: (dados) =>
    request('carrinho.php', { method: 'POST', body: JSON.stringify(dados) }),
  atualizarItemCarrinho: (idItem, quantidade) =>
    request(`carrinho.php?id_item=${idItem}`, { method: 'PUT', body: JSON.stringify({ quantidade }) }),
  removerItemCarrinho: (idItem) =>
    request(`carrinho.php?id_item=${idItem}`, { method: 'DELETE' }),

  // Artesão
  obterArtesao: (id) => request(`artesaos.php?id=${id}`),
  obterArtesaoPorUsuario: (idUsuario) => request(`artesaos.php?id_usuario=${idUsuario}`),
  atualizarArtesao: (idUsuario, dados) =>
    request(`artesaos.php?id_usuario=${idUsuario}`, { method: 'PUT', body: JSON.stringify(dados) }),
  listarArtesaos: () => request('artesaos.php'),

  // Produtos do artesão (área logada)
  criarProduto: (dados) =>
    request('produtos.php', { method: 'POST', body: JSON.stringify(dados) }),
  atualizarProduto: (id, dados) =>
    request(`produtos.php?id=${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  removerProduto: (id) =>
    request(`produtos.php?id=${id}`, { method: 'DELETE' }),

  // Pedido
  criarPedido: (dados) =>
    request('pedidos.php', { method: 'POST', body: JSON.stringify(dados) }),
  listarPedidos: (idUsuario) => request(`pedidos.php?id_usuario=${idUsuario}`),
  obterItensPedido: (idPedido) => request(`pedidos.php?id=${idPedido}`),

  // Pagamento
  obterPagamento: (idPedido) => request(`pagamentos.php?id_pedido=${idPedido}`),
  confirmarPagamento: (idPedido, dados) =>
    request(`pagamentos.php?id_pedido=${idPedido}`, { method: 'PUT', body: JSON.stringify(dados) }),

  // Avaliações
  listarAvaliacoes: (idProduto, idUsuario) =>
    request(`avaliacoes.php?id_produto=${idProduto}${idUsuario ? `&id_usuario=${idUsuario}` : ''}`),
  criarAvaliacao: (dados) =>
    request('avaliacoes.php', { method: 'POST', body: JSON.stringify(dados) }),
};