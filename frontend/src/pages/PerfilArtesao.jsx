import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { artesaos as artesaosExemplo, produtos as produtosExemplo } from '../data/mockData.js';
import Estrelas from '../components/Estrelas.jsx';
import IconePessoa from '../components/IconePessoa.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';

export default function PerfilArtesao() {
  const { id } = useParams();
  const [artesao, setArtesao] = useState(null);
  const [produtosDoArtesao, setProdutosDoArtesao] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    Promise.all([api.obterArtesao(id), api.listarProdutos({ artesao: id })])
      .then(([dadosArtesao, dadosProdutos]) => {
        if (!ativo) return;
        setArtesao(dadosArtesao);
        setProdutosDoArtesao(dadosProdutos);
      })
      .catch(() => {
        if (!ativo) return;
        const local = artesaosExemplo.find((a) => String(a.id_artesao) === id) || artesaosExemplo[0];
        setArtesao(local);
        setProdutosDoArtesao(produtosExemplo.filter((p) => p.id_artesao === local.id_artesao));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return <main className="max-w-6xl mx-auto px-4 py-8">Carregando...</main>;
  }
  if (!artesao) {
    return <main className="max-w-6xl mx-auto px-4 py-8">Artesão não encontrado.</main>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white border border-bege rounded-lg p-6 flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-28 h-28 rounded-full bg-creme flex items-center justify-center text-marrom-escuro shrink-0 overflow-hidden">
          {artesao.foto_perfil ? (
            <img src={artesao.foto_perfil} alt={artesao.nome_loja} className="w-full h-full object-cover" />
          ) : (
            <IconePessoa tamanho={64} />
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{artesao.nome_loja}</h1>
          <div className="mt-1"><Estrelas media={4.5} /></div>
          <p className="text-sm text-marrom/80 mt-3 leading-relaxed max-w-2xl">{artesao.biografia}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-4">Produtos do artesão</h2>
      {produtosDoArtesao.length === 0 ? (
        <p className="text-marrom/70">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtosDoArtesao.map((p) => (
            <ProdutoCard key={p.id_produto} produto={p} />
          ))}
        </div>
      )}
    </main>
  );
}
