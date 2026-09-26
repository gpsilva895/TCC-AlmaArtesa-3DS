import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatarPreco } from '../utils/formatar.js';

export default function Carrinho() {
  const { itens, alterarQuantidade, removerDoCarrinho, total } = useCart();

  if (itens.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-semibold mb-2">Seu carrinho está vazio</h1>
        <p className="text-marrom/70 mb-6">Explore o catálogo e encontre peças feitas à mão.</p>
        <Link to="/" className="btn-primario inline-block">Ver produtos</Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[1fr_280px] gap-6">
      <div className="flex flex-col gap-3">
        {itens.map((item) => (
          <div key={item.id_produto} className="bg-white border border-bege rounded-lg p-3 flex items-center gap-4">
            <img
              src={item.imagem || `https://placehold.co/80x80/EFE1CC/4A2F22?text=${encodeURIComponent(item.nome)}`}
              alt={item.nome}
              className="w-16 h-16 rounded object-cover bg-creme"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{item.nome}</p>
              <p className="text-sm text-marrom/70">R${formatarPreco(item.preco)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => alterarQuantidade(item.id_produto, 1)} className="w-7 h-7 rounded-full border border-bege bg-white">+</button>
              <span>{item.quantidade}</span>
              <button onClick={() => alterarQuantidade(item.id_produto, -1)} className="w-7 h-7 rounded-full border border-bege bg-white">−</button>
            </div>
            <button
              onClick={() => removerDoCarrinho(item.id_produto)}
              className="text-xs text-marrom/50 hover:text-terracota ml-2"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <aside className="bg-white border border-bege rounded-lg p-5 h-fit flex flex-col gap-4">
        <p className="text-lg font-semibold">Total: R${formatarPreco(total)}</p>
        <Link to="/checkout" className="btn-primario text-center">Checkout</Link>
      </aside>
    </main>
  );
}
