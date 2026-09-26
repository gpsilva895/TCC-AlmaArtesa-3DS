import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';

export default function ListaDesejos() {
  const { desejos } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) navigate('/login');
  }, [usuario, navigate]);

  if (!usuario) return null;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-6">Lista de Desejos</h1>
      {desejos.length === 0 ? (
        <p className="text-marrom/70">Você ainda não adicionou produtos à sua lista de desejos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {desejos.map((p) => (
            <ProdutoCard key={p.id_produto} produto={p} />
          ))}
        </div>
      )}
    </main>
  );
}
