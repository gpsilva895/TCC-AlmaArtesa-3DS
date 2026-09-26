import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { produtos as produtosExemplo } from '../data/mockData.js';
import ProdutoCard from '../components/ProdutoCard.jsx';

export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let ativo = true;
    api
      .listarProdutos()
      .then((dados) => {
        if (ativo) setProdutos(dados);
      })
      .catch(() => {
        // Back-end/MySQL fora do ar: mostra o catálogo de exemplo para não travar a navegação.
        if (ativo) {
          setProdutos(produtosExemplo);
          setOffline(true);
        }
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Produtos em destaque</h1>
        <p className="text-marrom/70 text-sm mt-1">
          Peças feitas à mão por pequenos artesãos de São Paulo.
        </p>
        {offline && (
          <p className="text-xs text-terracota mt-2">
            Não foi possível conectar à API/MySQL — exibindo catálogo de exemplo offline.
          </p>
        )}
      </div>

      {carregando ? (
        <p className="text-marrom/70">Carregando produtos...</p>
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
