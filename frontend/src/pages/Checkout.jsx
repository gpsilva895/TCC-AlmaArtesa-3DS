import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatarPreco, formatarTelefone, telefoneValido, formatarCEP, cepValido } from '../utils/formatar.js';

export default function Checkout() {
  const { itens, total, limparCarrinho } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    cpf: '',
    telefone: usuario?.telefone || '',
    cep: usuario?.cep || '',
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    let valorFormatado = value;
    if (name === 'telefone') valorFormatado = formatarTelefone(value);
    if (name === 'cep') valorFormatado = formatarCEP(value);
    setForm({ ...form, [name]: valorFormatado });
  }

  async function finalizarCompra(e) {
    e.preventDefault();
    if (!usuario) {
      navigate('/login');
      return;
    }
    setErro('');
    if (!telefoneValido(form.telefone)) {
      setErro('Informe um telefone válido, no formato (xx) xxxxx-xxxx.');
      return;
    }
    if (!cepValido(form.cep)) {
      setErro('Informe um CEP válido, no formato 00000-000.');
      return;
    }
    setEnviando(true);
    try {
      await api.criarPedido({
        id_usuario: usuario.id_usuario,
        itens: itens.map((i) => ({ id_produto: i.id_produto, quantidade: i.quantidade })),
        forma_pagamento: 'pix',
      });
      limparCarrinho();
      navigate('/');
      alert('Pedido registrado com sucesso! Acompanhe o status em "Meus Pedidos".');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (itens.length === 0) {
    return <main className="max-w-6xl mx-auto px-4 py-16 text-center">Seu carrinho está vazio.</main>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[1fr_280px] gap-6">
      <form onSubmit={finalizarCompra} className="bg-white border border-bege rounded-lg p-5 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Nome:</label>
          <input name="nome" value={form.nome} onChange={handleChange} className="campo-input mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">Email:</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="campo-input mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">CPF:</label>
          <input name="cpf" value={form.cpf} onChange={handleChange} className="campo-input mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">Telefone:</label>
          <input
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            placeholder="(xx) xxxxx-xxxx"
            maxLength={15}
            className="campo-input mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">CEP:</label>
          <input
            name="cep"
            value={form.cep}
            onChange={handleChange}
            placeholder="00000-000"
            maxLength={9}
            className="campo-input mt-1"
            required
          />
        </div>
        {erro && (
          <p className="text-sm text-red-600">
            {erro}
            {erro.toLowerCase().includes('endereço') && (
              <>
                {' '}
                <Link to="/perfil" className="underline font-medium">Completar endereço no Perfil</Link>
              </>
            )}
          </p>
        )}
      </form>

      <aside className="bg-white border border-bege rounded-lg p-5 h-fit flex flex-col gap-4">
        <p className="text-lg font-semibold">Total: R${formatarPreco(total)}</p>
        <button onClick={finalizarCompra} disabled={enviando} className="btn-primario">
          {enviando ? 'Processando...' : 'Finalizar Compra'}
        </button>
      </aside>
    </main>
  );
}
