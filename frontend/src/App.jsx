import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

import Home from './pages/Home.jsx';
import Busca from './pages/Busca.jsx';
import ProdutoDetalhe from './pages/ProdutoDetalhe.jsx';
import PerfilArtesao from './pages/PerfilArtesao.jsx';
import Carrinho from './pages/Carrinho.jsx';
import ListaDesejos from './pages/ListaDesejos.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Perfil from './pages/Perfil.jsx';
import Desenvolvedores from './pages/Desenvolvedores.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/busca" element={<Busca />} />
          <Route path="/produto/:id" element={<ProdutoDetalhe />} />
          <Route path="/artesao/:id" element={<PerfilArtesao />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/desejos" element={<ListaDesejos />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/desenvolvedores" element={<Desenvolvedores />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
