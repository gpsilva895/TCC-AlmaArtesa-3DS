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

// Estrelas clicáveis para o usuário escolher a nota antes de enviar.
function SeletorNota({ valor, onEscolher }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onEscolher(n)}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          className="p-0.5"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={n <= valor ? '#B5623B' : 'none'} stroke="#B5623B" strokeWidth="1.5">
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function formatarDataAvaliacao(data) {
  if (!data) return '';
  const d = new Date(data.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return data;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { itens, adicionarAoCarrinho, alternarDesejo, desejos } = useCart();
  const { usuario } = useAuth();
  const [quantidade, setQuantidade] = useState(1);

  const [produto, setProduto] = useState(null);
  const [outros, setOutros] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // --- Avaliações (comentários + nota) ---
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [podeAvaliar, setPodeAvaliar] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);
  const [avaliacoesCarregando, setAvaliacoesCarregando] = useState(true);
  const [avaliacoesErro, setAvaliacoesErro] = useState('');
  const [notaForm, setNotaForm] = useState(0);
  const [comentarioForm, setComentarioForm] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');

  function carregarAvaliacoes() {
    setAvaliacoesCarregando(true);
    api
      .listarAvaliacoes(id, usuario?.id_usuario)
      .then((dados) => {
        setAvaliacoes(dados.avaliacoes || []);
        setPodeAvaliar(!!dados.pode_avaliar);
        setJaAvaliou(!!dados.ja_avaliou);
      })
      .catch((e) => setAvaliacoesErro(e.message))
      .finally(() => setAvaliacoesCarregando(false));
  }

  useEffect(() => {
    carregarAvaliacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, usuario]);

  async function handleEnviarAvaliacao(e) {
    e.preventDefault();
    setErroAvaliacao('');
    if (notaForm < 1) {
      setErroAvaliacao('Escolha uma nota de 1 a 5 estrelas.');
      return;
    }
    setEnviandoAvaliacao(true);
    try {
      await api.criarAvaliacao({
        id_usuario: usuario.id_usuario,
        id_produto: produto.id_produto,
        nota: notaForm,
        comentario: comentarioForm,
      });
      setNotaForm(0);
      setComentarioForm('');
      carregarAvaliacoes();
      // Recarrega o produto para atualizar a média de estrelas exibida.
      api.obterProduto(id).then((dados) => setProduto(dados)).catch(() => {});
    } catch (e) {
      setErroAvaliacao(e.message);
    } finally {
      setEnviandoAvaliacao(false);
    }
  }

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

      {/* Avaliações e comentários */}
      <section className="bg-white border border-bege rounded-lg p-5 mt-10">
        <h2 className="text-lg font-semibold mb-4">Avaliações</h2>

        {usuario && podeAvaliar && (
          <form onSubmit={handleEnviarAvaliacao} className="border border-bege rounded-md p-4 mb-5 flex flex-col gap-3">
            <p className="text-sm font-medium">Deixe sua avaliação sobre este produto:</p>
            <SeletorNota valor={notaForm} onEscolher={setNotaForm} />
            <textarea
              value={comentarioForm}
              onChange={(e) => setComentarioForm(e.target.value)}
              placeholder="Escreva um comentário (opcional)"
              className="campo-input min-h-[70px]"
            />
            {erroAvaliacao && <p className="text-sm text-red-600">{erroAvaliacao}</p>}
            <button type="submit" disabled={enviandoAvaliacao} className="btn-primario self-start px-6">
              {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </form>
        )}

        {usuario && jaAvaliou && (
          <p className="text-sm text-marrom/70 mb-5">Você já avaliou este produto. Obrigado pelo feedback!</p>
        )}

        {usuario && !podeAvaliar && !jaAvaliou && !avaliacoesCarregando && (
          <p className="text-sm text-marrom/70 mb-5">Só é possível avaliar produtos que você já comprou.</p>
        )}

        {!usuario && (
          <p className="text-sm text-marrom/70 mb-5">
            <Link to="/login" className="text-terracota underline">Entre na sua conta</Link> para avaliar este produto (disponível para quem já comprou).
          </p>
        )}

        {avaliacoesCarregando ? (
          <p className="text-sm text-marrom/70">Carregando avaliações...</p>
        ) : avaliacoesErro ? (
          <p className="text-sm text-red-600">{avaliacoesErro}</p>
        ) : avaliacoes.length === 0 ? (
          <p className="text-sm text-marrom/70">Este produto ainda não tem avaliações.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {avaliacoes.map((av) => (
              <li key={av.id_avaliacao} className="border-t border-bege pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-creme flex items-center justify-center overflow-hidden shrink-0">
                      {av.foto_usuario ? (
                        <img src={av.foto_usuario} alt={av.nome_usuario} className="w-full h-full object-cover" />
                      ) : (
                        <IconePessoa tamanho={16} />
                      )}
                    </span>
                    <span className="text-sm font-medium">{av.nome_usuario}</span>
                  </div>
                  <span className="text-xs text-marrom/60">{formatarDataAvaliacao(av.data_avaliacao)}</span>
                </div>
                <div className="mt-1"><Estrelas media={av.nota} tamanho={14} /></div>
                {av.comentario && <p className="text-sm text-marrom/80 mt-1">{av.comentario}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

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