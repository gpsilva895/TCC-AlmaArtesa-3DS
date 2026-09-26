import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { produtos as produtosExemplo, categorias } from '../data/mockData.js';
import ProdutoCard from '../components/ProdutoCard.jsx';

export default function Busca() {
  const [params] = useSearchParams();
  const termo = params.get('q') || '';
  const idCategoria = params.get('categoria');

  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    const filtros = {};
    if (termo) filtros.busca = termo;
    if (idCategoria) filtros.categoria = idCategoria;

    api
      .listarProdutos(filtros)
      .then((dados) => {
        if (ativo) setProdutos(dados);
      })
      .catch(() => {
        if (!ativo) return;
        setOffline(true);
        const filtrado = produtosExemplo.filter((p) => {
          const combinaTermo = termo ? p.nome.toLowerCase().includes(termo.toLowerCase()) : true;
          const combinaCategoria = idCategoria ? String(p.id_categoria) === idCategoria : true;
          return combinaTermo && combinaCategoria;
        });
        setProdutos(filtrado);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [termo, idCategoria]);

  const nomeCategoria = useMemo(
    () => categorias.find((c) => String(c.id_categoria) === idCategoria)?.nome,
    [idCategoria]
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-2">
        {termo && `Buscando resultado para: ${termo}`}
        {!termo && nomeCategoria && `Categoria: ${nomeCategoria}`}
        {!termo && !nomeCategoria && 'Todos os produtos'}
      </h1>
      {offline && (
        <p className="text-xs text-terracota mb-4">
          Não foi possível conectar à API/MySQL — exibindo catálogo de exemplo offline.
        </p>
      )}

      {carregando ? (
        <p className="text-marrom/70">Carregando...</p>
      ) : produtos.length === 0 ? (
        <p className="text-marrom/70">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtos.map((p) => (
            <ProdutoCard key={p.id_produto} produto={p} />
          ))}
        </div>
      )}
    </main>
  );
}
