import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { formatarPreco, formatarTelefone, telefoneValido, formatarCEP, cepValido, formatarCPF, cpfValido } from '../utils/formatar.js';

const FORMAS_PAGAMENTO = [
  { valor: 'pix', rotulo: 'PIX' },
  { valor: 'cartao_credito', rotulo: 'Cartão de crédito' },
  { valor: 'cartao_debito', rotulo: 'Cartão de débito' },
  { valor: 'boleto', rotulo: 'Boleto' },
];

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

  // --- Etapa de pagamento (embutida nesta mesma página, sem rota nova) ---
  const [etapa, setEtapa] = useState('dados'); // 'dados' | 'pagamento' | 'concluido'
  const [pedidoCriado, setPedidoCriado] = useState(null); // { id_pedido, valor_total }
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [erroPagamento, setErroPagamento] = useState('');
  const [codigoTransacao, setCodigoTransacao] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    let valorFormatado = value;
    if (name === 'telefone') valorFormatado = formatarTelefone(value);
    if (name === 'cep') valorFormatado = formatarCEP(value);
    if (name === 'cpf') valorFormatado = formatarCPF(value);
    setForm({ ...form, [name]: valorFormatado });
  }

  async function finalizarCompra(e) {
    e.preventDefault();
    if (!usuario) {
      navigate('/login');
      return;
    }
    setErro('');
    if (!cpfValido(form.cpf)) {
      setErro('Informe um CPF válido, no formato 000.000.000-00.');
      return;
    }
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
      const resultado = await api.criarPedido({
        id_usuario: usuario.id_usuario,
        itens: itens.map((i) => ({ id_produto: i.id_produto, quantidade: i.quantidade })),
        forma_pagamento: formaPagamento,
      });
      limparCarrinho();
      setPedidoCriado(resultado);
      setEtapa('pagamento');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleConfirmarPagamento(e) {
    e.preventDefault();
    if (!pedidoCriado) return;
    setErroPagamento('');
    setProcessandoPagamento(true);
    try {
      const resultado = await api.confirmarPagamento(pedidoCriado.id_pedido, {
        id_usuario: usuario.id_usuario,
        forma_pagamento: formaPagamento,
      });
      setCodigoTransacao(resultado.codigo_transacao || '');
      setEtapa('concluido');
    } catch (e) {
      setErroPagamento(e.message);
    } finally {
      setProcessandoPagamento(false);
    }
  }

  if (etapa === 'dados' && itens.length === 0) {
    return <main className="max-w-6xl mx-auto px-4 py-16 text-center">Seu carrinho está vazio.</main>;
  }

  if (etapa === 'concluido') {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-bege rounded-lg p-8 flex flex-col items-center gap-3">
          <h1 className="text-xl font-semibold text-green-700">Pagamento aprovado!</h1>
          <p className="text-marrom/80">
            O pagamento do pedido <strong>#{pedidoCriado?.id_pedido}</strong> foi confirmado com sucesso.
          </p>
          {codigoTransacao && (
            <p className="text-sm text-marrom/60">Código da transação: {codigoTransacao}</p>
          )}
          <div className="flex gap-3 mt-3">
            <Link to="/perfil" className="btn-primario px-6">Ver Meus Pedidos</Link>
            <Link to="/" className="btn-secundario px-6">Voltar à loja</Link>
          </div>
        </div>
      </main>
    );
  }

  if (etapa === 'pagamento' && pedidoCriado) {
    return (
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white border border-bege rounded-lg p-6 flex flex-col gap-5">
          <div className="text-center">
            <h1 className="text-xl font-semibold">Finalizar pagamento</h1>
            <p className="text-sm text-marrom/70 mt-1">Pedido #{pedidoCriado.id_pedido}</p>
          </div>

          <p className="text-lg font-semibold text-center">
            Total a pagar: R${formatarPreco(pedidoCriado.valor_total)}
          </p>

          <form onSubmit={handleConfirmarPagamento} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Forma de pagamento:</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="campo-input mt-1"
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                ))}
              </select>
            </div>

            {formaPagamento === 'pix' && (
              <p className="text-sm text-marrom/70 bg-creme/50 rounded-md p-3">
                Após confirmar, a chave PIX do artesão será exibida para você concluir o pagamento.
              </p>
            )}

            {erroPagamento && <p className="text-sm text-red-600">{erroPagamento}</p>}

            <button type="submit" disabled={processandoPagamento} className="btn-primario">
              {processandoPagamento ? 'Processando...' : 'Confirmar pagamento'}
            </button>
          </form>
        </div>
      </main>
    );
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
          <input
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            maxLength={14}
            className="campo-input mt-1"
            required
          />
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
        <div>
          <label className="text-sm font-medium">Forma de pagamento:</label>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="campo-input mt-1"
          >
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f.valor} value={f.valor}>{f.rotulo}</option>
            ))}
          </select>
        </div>
        <button onClick={finalizarCompra} disabled={enviando} className="btn-primario">
          {enviando ? 'Processando...' : 'Ir para pagamento'}
        </button>
      </aside>
    </main>
  );
}
