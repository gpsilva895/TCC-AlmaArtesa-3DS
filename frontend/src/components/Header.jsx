import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { categorias } from '../data/mockData.js';

export default function Header() {
  const [busca, setBusca] = useState('');
  const [menuCategorias, setMenuCategorias] = useState(false);
  const { quantidadeTotal } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  function handleBuscar(e) {
    e.preventDefault();
    if (busca.trim()) navigate(`/busca?q=${encodeURIComponent(busca.trim())}`);
  }

  return (
    <header className="bg-terracota text-white sticky top-0 z-30 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
        <Link to="/" className="flex items-center shrink-0">
          <img src="/logo-alma-artesa.png" alt="Alma Artesã" className="h-12 w-auto" />
        </Link>

        {/* Busca + navegação agrupadas na mesma largura, alinhadas uma sob a outra */}
        <div className="w-full max-w-xl flex flex-col gap-3">
          <form onSubmit={handleBuscar} className="w-full">
            <div className="flex items-center bg-white/95 rounded-full px-3.5 py-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-terracota shrink-0">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar produtos"
                className="w-full bg-transparent outline-none text-marrom-escuro px-2 text-sm"
              />
            </div>
          </form>

          <nav className="w-full flex items-center justify-between text-sm font-medium relative">
            <div
              className="relative"
              onMouseEnter={() => setMenuCategorias(true)}
              onMouseLeave={() => setMenuCategorias(false)}
            >
              <button className="flex items-center gap-1">
                Departamentos
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {menuCategorias && (
                <div className="absolute top-full left-0 bg-white text-marrom-escuro rounded-md shadow-lg py-2 w-52 z-10">
                  {categorias.map((c) => (
                    <Link
                      key={c.id_categoria}
                      to={`/busca?categoria=${c.id_categoria}`}
                      className="block px-4 py-2 hover:bg-creme text-sm"
                    >
                      {c.nome}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/">Início</Link>
            <Link to="/desenvolvedores">Desenvolvedores</Link>
            <Link to="/carrinho" className="flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h8.6a2 2 0 002-1.6L21 8H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1.4" fill="white" />
                <circle cx="18" cy="20" r="1.4" fill="white" />
              </svg>
              Carrinho{quantidadeTotal > 0 && ` (${quantidadeTotal})`}
            </Link>
          </nav>
        </div>

        <Link
          to={usuario ? '/perfil' : '/login'}
          className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0 overflow-hidden"
          title={usuario ? usuario.nome : 'Entrar'}
        >
          {usuario?.foto_perfil ? (
            <img src={usuario.foto_perfil} alt={usuario.nome} className="w-full h-full object-cover" />
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
              <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </Link>
      </div>
    </header>
  );
}
