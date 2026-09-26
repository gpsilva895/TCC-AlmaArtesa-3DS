import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { produtos as produtosExemplo, artesaos as artesaosExemplo } from '../data/mockData.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Estrelas from '../components/Estrelas.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';
import IconePessoa from '../components/IconePessoa.jsx';
import { formatarPreco } from '../utils/formatar.js';

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { itens, adicionarAoCarrinho, alternarDesejo, desejos } = useCart();
  const { usuario } = useAuth();
  const [quantidade, setQuantidade] = useState(1);

  const [produto, setProduto] = useState(null);
  const [outros, setOutros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setQuantidade(1);

    api
      .obterProduto(id)
      .then((dados) => {
        if (!ativo) return;
        setProduto(dados);
        return api.listarProdutos().then((lista) => {
          if (ativo) setOutros(lista.filter((p) => String(p.id_produto) !== id).slice(0, 3));
        });
      })
      .catch(() => {
        if (!ativo) return;
        const local = produtosExemplo.find((p) => String(p.id_produto) === id);
        if (local) {
          setProduto({ ...local, nome_loja: artesaosExemplo[0]?.nome_loja, artesao_usuario_id: local.id_artesao });
        }
        setOutros(produtosExemplo.filter((p) => String(p.id_produto) !== id).slice(0, 3));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return <main className="max-w-6xl mx-auto px-4 py-8">Carregando produto...</main>;
  }
  if (!produto) {
    return <main className="max-w-6xl mx-auto px-4 py-8">Produto não encontrado.</main>;
  }

  const favoritado = desejos.some((p) => p.id_produto === produto.id_produto);
  const jaNoCarrinho = itens.some((i) => i.id_produto === produto.id_produto);

  // Se o produto já está no carrinho, "Comprar Agora" só leva para lá (sem
  // duplicar a quantidade). Se ainda não está, adiciona uma vez e então
  // leva para o carrinho — nunca direto para o checkout.
  function handleComprarAgora() {
    if (!jaNoCarrinho) {
      adicionarAoCarrinho(produto, quantidade);
    }
    navigate('/carrinho');
  }
  // Um artesão não pode comprar (nem colocar no carrinho) o próprio produto.
  const ehProprioProduto =
    !!usuario && !!produto.artesao_usuario_id && usuario.id_usuario === produto.artesao_usuario_id;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[1fr_280px] gap-6 items-start">
        {/* Card branco: imagem + informações do produto */}
        <div className="bg-white border border-bege rounded-lg p-5 grid sm:grid-cols-[1fr_1.2fr] gap-6">
          <img
            src={produto.imagem || `https://placehold.co/500x500/EFE1CC/4A2F22?text=${encodeURIComponent(produto.nome)}`}
            alt={produto.nome}
            className="rounded-md w-full aspect-square object-cover"
          />
          <div>
            <h1 className="text-xl font-semibold">{produto.nome}</h1>
            <div className="mt-1"><Estrelas media={produto.media_avaliacao || 4} /></div>
            <p className="text-2xl font-semibold mt-3">R${formatarPreco(produto.preco)}</p>
            <p className="text-sm text-marrom/80 mt-4 leading-relaxed">{produto.descricao}</p>
          </div>
        </div>

        {/* Card branco: quantidade, artesão e ações de compra */}
        <div className="bg-white border border-bege rounded-lg p-4 h-fit flex flex-col gap-3">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantidade((q) => q + 1)}
              className="w-8 h-8 rounded-full border border-bege bg-white"
            >
              +
            </button>
            <span className="font-medium">{quantidade}</span>
            <button
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-bege bg-white"
            >
              −
            </button>
          </div>
          {produto.nome_loja && (
            <Link
              to={`/artesao/${produto.id_artesao}`}
              className="flex items-center justify-center gap-2 text-sm"
            >
              <span className="w-8 h-8 rounded-full bg-creme flex items-center justify-center overflow-hidden shrink-0">
                {produto.artesao_foto ? (
                  <img src={produto.artesao_foto} alt={produto.nome_loja} className="w-full h-full object-cover" />
                ) : (
                  <IconePessoa tamanho={18} />
                )}
              </span>
              Artesão: <span className="text-terracota font-medium hover:underline">{produto.nome_loja}</span>
            </Link>
          )}
          {ehProprioProduto ? (
            <p className="text-sm text-marrom/60 text-center">Este é um produto da sua própria loja.</p>
          ) : (
            <>
              <button onClick={() => adicionarAoCarrinho(produto, quantidade)} className="btn-primario">
                Adicionar ao carrinho
              </button>
              <button onClick={handleComprarAgora} className="btn-secundario text-center">
                Comprar Agora
              </button>
            </>
          )}
          <button
            onClick={() => (usuario ? alternarDesejo(produto) : navigate('/login'))}
            className="text-sm text-terracota underline underline-offset-2"
          >
            {favoritado ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
          </button>
        </div>
      </div>

      {outros.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mt-10 mb-4">Outros produtos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {outros.map((p) => (
              <ProdutoCard key={p.id_produto} produto={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
