import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatarPreco } from '../utils/formatar.js';

export default function ProdutoCard({ produto }) {
  const { adicionarAoCarrinho, alternarDesejo, desejos } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const favoritado = desejos?.some((p) => p.id_produto === produto.id_produto);
  // Um artesão não pode comprar (nem colocar no carrinho) o próprio produto.
  const ehProprioProduto =
    !!usuario && !!produto.artesao_usuario_id && usuario.id_usuario === produto.artesao_usuario_id;

  function handleDesejo() {
    if (!usuario) {
      navigate('/login');
      return;
    }
    alternarDesejo(produto);
  }

  return (
    <div className="bg-white rounded-lg border border-bege overflow-hidden flex flex-col relative">
      <button
        type="button"
        onClick={handleDesejo}
        title={favoritado ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
        aria-label={favoritado ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={favoritado ? '#C1502E' : 'none'}>
          <path
            d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0112 5.5 5.5 5.5 0 0121.5 11c-2.5 4.6-9.5 9-9.5 9z"
            stroke="#C1502E"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <Link to={`/produto/${produto.id_produto}`} className="block aspect-square bg-white">
        <img
          src={produto.imagem || `https://placehold.co/300x300/EFE1CC/4A2F22?text=${encodeURIComponent(produto.nome)}`}
          alt={produto.nome}
          className="w-full h-full object-cover"
        />
      </Link>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link to={`/produto/${produto.id_produto}`} className="text-sm font-medium hover:text-terracota line-clamp-2">
          {produto.nome}
        </Link>
        <p className="font-semibold">R${formatarPreco(produto.preco)}</p>
        {ehProprioProduto ? (
          <p className="text-xs text-marrom/60 text-center mt-auto py-2">Este produto é da sua loja</p>
        ) : (
          <button
            onClick={() => adicionarAoCarrinho(produto, 1)}
            className="btn-primario text-sm mt-auto py-2"
          >
            Adicionar ao carrinho
          </button>
        )}
      </div>
    </div>
  );
}
