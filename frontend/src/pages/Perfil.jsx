import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import IconePessoa from '../components/IconePessoa.jsx';
import CampoSenha from '../components/CampoSenha.jsx';
import { categorias } from '../data/mockData.js';
import {
  formatarPreco, formatarTelefone, telefoneValido,
  formatarCEP, cepValido, formatarEstado, estadoValido, emailValido,
} from '../utils/formatar.js';

const CAMPO_VAZIO = {
  nome: '', email: '', estado: '', cidade: '', cep: '', numero: '', bairro: '',
  complemento: '', logradouro: '', tipo_residencia: '', telefone: '', senha: '', foto_perfil: '',
};

const ARTESAO_VAZIO = { nome_loja: '', biografia: '', foto_perfil: '', chave_pix: '' };

const PRODUTO_VAZIO = {
  nome: '', descricao: '', preco: '', id_categoria: categorias[0]?.id_categoria || '', imagem: '', estoque: '1',
};

const STATUS_PEDIDO = {
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  enviado: 'Enviado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

function formatarDataPedido(data) {
  if (!data) return '';
  const d = new Date(data.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return data;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Perfil() {
  const { usuario, setUsuario, sair } = useAuth();
  const navigate = useNavigate();
  const ehArtesao = usuario?.tipo_usuario === 'artesao';

  // --- Dados pessoais ---
  const [form, setForm] = useState(CAMPO_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');

  // --- Meus pedidos (usuário comum e artesão, como comprador) ---
  const [pedidos, setPedidos] = useState([]);
  const [pedidosCarregando, setPedidosCarregando] = useState(true);
  const [pedidosErro, setPedidosErro] = useState('');
  const [pedidoAberto, setPedidoAberto] = useState(null);
  const [itensPorPedido, setItensPorPedido] = useState({});
  const [itensCarregandoId, setItensCarregandoId] = useState(null);

  // --- Dados da loja (somente artesão) ---
  const [idArtesao, setIdArtesao] = useState(null);
  const [artesaoForm, setArtesaoForm] = useState(ARTESAO_VAZIO);
  const [artesaoCarregando, setArtesaoCarregando] = useState(ehArtesao);
  const [artesaoSalvando, setArtesaoSalvando] = useState(false);
  const [artesaoSalvo, setArtesaoSalvo] = useState(false);
  const [artesaoErro, setArtesaoErro] = useState('');

  // --- Cadastro de produtos (somente artesão) ---
  const [produtoForm, setProdutoForm] = useState(PRODUTO_VAZIO);
  const [meusProdutos, setMeusProdutos] = useState([]);
  const [produtoSalvando, setProdutoSalvando] = useState(false);
  const [produtoSalvo, setProdutoSalvo] = useState(false);
  const [produtoErro, setProdutoErro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    let ativo = true;
    api
      .obterUsuario(usuario.id_usuario)
      .then((dados) => {
        if (!ativo) return;
        setForm({
          nome: dados.nome || '',
          email: dados.email || '',
          estado: dados.estado || '',
          cidade: dados.cidade || '',
          cep: dados.cep || '',
          numero: dados.numero || '',
          bairro: dados.bairro || '',
          complemento: dados.complemento || '',
          logradouro: dados.logradouro || '',
          tipo_residencia: dados.tipo_endereco || '',
          telefone: dados.telefone || '',
          senha: '',
          foto_perfil: dados.foto_perfil || '',
        });
      })
      .catch((e) => setErro(e.message))
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [usuario, navigate]);

  useEffect(() => {
    if (!usuario) return;
    let ativo = true;
    setPedidosCarregando(true);
    api
      .listarPedidos(usuario.id_usuario)
      .then((lista) => {
        if (ativo) setPedidos(lista || []);
      })
      .catch((e) => {
        if (ativo) setPedidosErro(e.message);
      })
      .finally(() => {
        if (ativo) setPedidosCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [usuario]);

  async function handleAlternarPedido(idPedido) {
    if (pedidoAberto === idPedido) {
      setPedidoAberto(null);
      return;
    }
    setPedidoAberto(idPedido);
    if (itensPorPedido[idPedido]) return;
    setItensCarregandoId(idPedido);
    try {
      const itensDoPedido = await api.obterItensPedido(idPedido);
      setItensPorPedido((atual) => ({ ...atual, [idPedido]: itensDoPedido }));
    } catch (e) {
      setPedidosErro(e.message);
    } finally {
      setItensCarregandoId(null);
    }
  }

  useEffect(() => {
    if (!usuario || !ehArtesao) return;
    let ativo = true;
    api
      .obterArtesaoPorUsuario(usuario.id_usuario)
      .then((dados) => {
        if (!ativo) return;
        setIdArtesao(dados.id_artesao);
        setArtesaoForm({
          nome_loja: dados.nome_loja || '',
          biografia: dados.biografia || '',
          foto_perfil: dados.foto_perfil || '',
          chave_pix: dados.chave_pix || '',
        });
        return api.listarProdutos({ artesao: dados.id_artesao });
      })
      .then((lista) => {
        if (ativo && lista) setMeusProdutos(lista);
      })
      .catch((e) => setArtesaoErro(e.message))
      .finally(() => {
        if (ativo) setArtesaoCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [usuario, ehArtesao]);

  function handleSair() {
    sair();
    navigate('/login');
  }

  function handleChange(e) {
    const { name, value } = e.target;
    let valorFormatado = value;
    if (name === 'telefone') valorFormatado = formatarTelefone(value);
    if (name === 'cep') valorFormatado = formatarCEP(value);
    if (name === 'estado') valorFormatado = formatarEstado(value);
    setForm({ ...form, [name]: valorFormatado });
  }

  function handleFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setForm((f) => ({ ...f, foto_perfil: leitor.result }));
    leitor.readAsDataURL(arquivo);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    if (!emailValido(form.email)) {
      setErro('Informe um e-mail válido.');
      return;
    }
    if (form.telefone && !telefoneValido(form.telefone)) {
      setErro('Informe um telefone válido, no formato (xx) xxxxx-xxxx.');
      return;
    }
    if (form.cep && !cepValido(form.cep)) {
      setErro('Informe um CEP válido, no formato 00000-000.');
      return;
    }
    if (form.estado && !estadoValido(form.estado)) {
      setErro('Informe a sigla do estado com 2 letras, ex.: SP.');
      return;
    }
    if (form.senha && form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSalvando(true);
    try {
      // Envia todos os campos; a senha só é atualizada se digitada de novo.
      const payload = { ...form };
      if (!payload.senha) delete payload.senha;
      await api.atualizarPerfil(usuario.id_usuario, payload);
      setUsuario((u) => ({ ...u, nome: form.nome, telefone: form.telefone, foto_perfil: form.foto_perfil }));
      setForm((f) => ({ ...f, senha: '' }));
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  function handleChangeArtesao(e) {
    setArtesaoForm({ ...artesaoForm, [e.target.name]: e.target.value });
  }

  function handleFotoArtesao(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setArtesaoForm((f) => ({ ...f, foto_perfil: leitor.result }));
    leitor.readAsDataURL(arquivo);
  }

  async function handleSubmitArtesao(e) {
    e.preventDefault();
    setArtesaoErro('');
    setArtesaoSalvando(true);
    try {
      await api.atualizarArtesao(usuario.id_usuario, artesaoForm);
      setArtesaoSalvo(true);
      setTimeout(() => setArtesaoSalvo(false), 2500);
    } catch (e) {
      setArtesaoErro(e.message);
    } finally {
      setArtesaoSalvando(false);
    }
  }

  function handleChangeProduto(e) {
    setProdutoForm({ ...produtoForm, [e.target.name]: e.target.value });
  }

  function handleImagemProduto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setProdutoForm((f) => ({ ...f, imagem: leitor.result }));
    leitor.readAsDataURL(arquivo);
  }

  async function handleSubmitProduto(e) {
    e.preventDefault();
    setProdutoErro('');
    if (!produtoForm.nome.trim()) {
      setProdutoErro('Informe o nome do produto.');
      return;
    }
    if (!(Number(produtoForm.preco) > 0)) {
      setProdutoErro('Informe um preço válido, maior que zero.');
      return;
    }
    if (Number(produtoForm.estoque) < 0 || Number.isNaN(Number(produtoForm.estoque))) {
      setProdutoErro('Informe um estoque válido.');
      return;
    }
    setProdutoSalvando(true);
    try {
      const payload = {
        id_artesao: idArtesao,
        nome: produtoForm.nome.trim(),
        descricao: produtoForm.descricao,
        preco: Number(produtoForm.preco),
        id_categoria: Number(produtoForm.id_categoria),
        imagem: produtoForm.imagem || null,
        estoque: Number(produtoForm.estoque) || 0,
      };
      if (editandoId) {
        await api.atualizarProduto(editandoId, payload);
        setMeusProdutos((atual) =>
          atual.map((p) => (p.id_produto === editandoId ? { ...payload, id_produto: editandoId } : p))
        );
        setEditandoId(null);
      } else {
        const resultado = await api.criarProduto(payload);
        setMeusProdutos((atual) => [{ ...payload, id_produto: resultado.id_produto }, ...atual]);
      }
      setProdutoForm(PRODUTO_VAZIO);
      setProdutoSalvo(true);
      setTimeout(() => setProdutoSalvo(false), 2500);
    } catch (e) {
      setProdutoErro(e.message);
    } finally {
      setProdutoSalvando(false);
    }
  }

  function handleEditarProduto(produto) {
    setEditandoId(produto.id_produto);
    setProdutoForm({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco: String(produto.preco ?? ''),
      id_categoria: produto.id_categoria || categorias[0]?.id_categoria || '',
      imagem: produto.imagem || '',
      estoque: String(produto.estoque ?? '1'),
    });
    setProdutoErro('');
    window.scrollTo({ top: document.body.scrollHeight * 0.6, behavior: 'smooth' });
  }

  function handleCancelarEdicaoProduto() {
    setEditandoId(null);
    setProdutoForm(PRODUTO_VAZIO);
    setProdutoErro('');
  }

  async function handleExcluirProduto(idProduto) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    setExcluindoId(idProduto);
    setProdutoErro('');
    try {
      await api.removerProduto(idProduto);
      setMeusProdutos((atual) => atual.filter((p) => p.id_produto !== idProduto));
      if (editandoId === idProduto) handleCancelarEdicaoProduto();
    } catch (e) {
      setProdutoErro(e.message);
    } finally {
      setExcluindoId(null);
    }
  }

  const campos = [
    ['nome', 'Nome'], ['email', 'Email'], ['estado', 'Estado'], ['cidade', 'Cidade'],
    ['cep', 'CEP'], ['numero', 'Número'], ['bairro', 'Bairro'], ['complemento', 'Complemento'],
    ['logradouro', 'Logradouro'], ['tipo_residencia', 'Tipo de residência'], ['telefone', 'Telefone'],
  ];

  if (!usuario) return null;
  if (carregando) {
    return <main className="max-w-2xl mx-auto px-4 py-10 text-center text-marrom/70">Carregando perfil...</main>;
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="bg-white border border-bege rounded-lg p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-24 h-24 rounded-full bg-creme flex items-center justify-center text-marrom-escuro overflow-hidden">
            {form.foto_perfil ? (
              <img src={form.foto_perfil} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <IconePessoa tamanho={56} />
            )}
          </div>
          <label className="btn-secundario text-sm px-3 py-1.5 cursor-pointer">
            Alterar foto de perfil
            <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
          </label>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            <Link to="/desejos" className="btn-secundario text-sm px-3 py-1.5">
              Acessar lista de desejos
            </Link>
            <button
              type="button"
              onClick={handleSair}
              className="text-sm px-3 py-1.5 rounded-md border border-terracota text-terracota hover:bg-terracota hover:text-white transition-colors"
            >
              Sair do perfil
            </button>
          </div>
        </div>
                {campos.map(([nome, rotulo]) =>
          nome === 'tipo_residencia' ? (
            <div key={nome} className="grid grid-cols-[140px_1fr] items-center gap-2">
              <label className="text-sm font-medium text-right">{rotulo}:</label>
              <select
                name={nome}
                value={form[nome] || 'residencial'}
                onChange={handleChange}
                className="campo-input"
              >
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          ) : (
            <div key={nome} className="grid grid-cols-[140px_1fr] items-center gap-2">
              <label className="text-sm font-medium text-right">{rotulo}:</label>
              <input
                name={nome}
                value={form[nome]}
                onChange={handleChange}
                disabled={nome === 'email'}
                placeholder={nome === 'telefone' ? '(xx) xxxxx-xxxx' : nome === 'cep' ? '00000-000' : nome === 'estado' ? 'SP' : undefined}
                maxLength={nome === 'telefone' ? 15 : nome === 'cep' ? 9 : nome === 'estado' ? 2 : undefined}
                className="campo-input disabled:opacity-60"
              />
            </div>
          )
        )}
        <div className="grid grid-cols-[140px_1fr] items-center gap-2">
          <label className="text-sm font-medium text-right">Senha:</label>
          <CampoSenha value={form.senha} onChange={handleChange} placeholder="Deixe em branco para manter" minLength={6} />
        </div>
        {erro && <p className="text-sm text-red-600 text-center">{erro}</p>}
        <button type="submit" disabled={salvando} className="btn-primario self-center mt-2 px-8">
          {salvando ? 'Salvando...' : 'Salvar mudanças'}
        </button>
        {salvo && <p className="text-sm text-green-700 text-center">Alterações salvas no banco de dados!</p>}
      </form>

      {/* Meus pedidos: acompanhamento de compras, disponível para todo mundo
          que compra na loja (usuário comum ou artesão comprando de outro). */}
      <section className="bg-white border border-bege rounded-lg p-6 flex flex-col gap-3">
        <h2 className="text-base font-semibold text-center">Meus pedidos</h2>
        {pedidosCarregando ? (
          <p className="text-sm text-marrom/70 text-center">Carregando pedidos...</p>
        ) : pedidosErro ? (
          <p className="text-sm text-red-600 text-center">{pedidosErro}</p>
        ) : pedidos.length === 0 ? (
          <p className="text-sm text-marrom/70 text-center">Você ainda não fez nenhum pedido.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pedidos.map((p) => {
              const aberto = pedidoAberto === p.id_pedido;
              const itensDoPedido = itensPorPedido[p.id_pedido];
              return (
                <li key={p.id_pedido} className="border border-bege rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleAlternarPedido(p.id_pedido)}
                    className="w-full flex flex-wrap items-center justify-between gap-2 text-sm px-3 py-2 bg-creme/50 text-left"
                  >
                    <span className="font-medium">Pedido #{p.id_pedido}</span>
                    <span className="text-marrom/70">{formatarDataPedido(p.data_pedido)}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-terracota/10 text-terracota font-medium">
                      {STATUS_PEDIDO[p.status] || p.status}
                    </span>
                    <span className="font-semibold">R${formatarPreco(p.valor_total)}</span>
                  </button>
                  {aberto && (
                    <div className="px-3 py-2 border-t border-bege">
                      {itensCarregandoId === p.id_pedido ? (
                        <p className="text-sm text-marrom/70">Carregando itens...</p>
                      ) : itensDoPedido && itensDoPedido.length > 0 ? (
                        <ul className="flex flex-col gap-1">
                          {itensDoPedido.map((item) => (
                            <li key={item.id_item_pedido} className="flex items-center justify-between text-sm">
                              <span>{item.quantidade}x {item.nome}</span>
                              <span className="text-marrom/80">R${formatarPreco(item.subtotal)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-marrom/70">Nenhum item encontrado para este pedido.</p>
                      )}
                      {p.codigo_rastreio && (
                        <p className="text-sm text-marrom/80 mt-2">Código de rastreio: {p.codigo_rastreio}</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {ehArtesao && (
        <>
          {/* Dados exclusivos de artesão (loja) */}
          <form onSubmit={handleSubmitArtesao} className="bg-white border border-bege rounded-lg p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-center">Dados da minha loja</h2>
            {artesaoCarregando ? (
              <p className="text-sm text-marrom/70 text-center">Carregando dados da loja...</p>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full bg-creme flex items-center justify-center overflow-hidden">
                    {artesaoForm.foto_perfil ? (
                      <img src={artesaoForm.foto_perfil} alt="Foto da loja" className="w-full h-full object-cover" />
                    ) : (
                      <IconePessoa tamanho={44} />
                    )}
                  </div>
                  <label className="btn-secundario text-sm px-3 py-1.5 cursor-pointer">
                    Alterar foto da loja
                    <input type="file" accept="image/*" onChange={handleFotoArtesao} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">Nome da loja:</label>
                  <input name="nome_loja" value={artesaoForm.nome_loja} onChange={handleChangeArtesao} className="campo-input" required />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-2">
                  <label className="text-sm font-medium text-right pt-2">Biografia:</label>
                  <textarea name="biografia" value={artesaoForm.biografia} onChange={handleChangeArtesao} className="campo-input min-h-[80px]" />
                </div>
                <div className="grid grid-cols-[140px_1fr] items-center gap-2">
                  <label className="text-sm font-medium text-right">Chave PIX:</label>
                  <input name="chave_pix" value={artesaoForm.chave_pix} onChange={handleChangeArtesao} className="campo-input" />
                </div>
                {artesaoErro && <p className="text-sm text-red-600 text-center">{artesaoErro}</p>}
                <button type="submit" disabled={artesaoSalvando} className="btn-primario self-center mt-2 px-8">
                  {artesaoSalvando ? 'Salvando...' : 'Salvar dados da loja'}
                </button>
                {artesaoSalvo && <p className="text-sm text-green-700 text-center">Dados da loja salvos!</p>}
              </>
            )}
          </form>

          {/* Cadastro de novos produtos */}
          <form onSubmit={handleSubmitProduto} className="bg-white border border-bege rounded-lg p-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-center">
              {editandoId ? 'Editar produto' : 'Colocar produto à venda'}
            </h2>
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <label className="text-sm font-medium text-right">Nome:</label>
              <input name="nome" value={produtoForm.nome} onChange={handleChangeProduto} className="campo-input" required />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-start gap-2">
              <label className="text-sm font-medium text-right pt-2">Descrição:</label>
              <textarea name="descricao" value={produtoForm.descricao} onChange={handleChangeProduto} className="campo-input min-h-[70px]" />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <label className="text-sm font-medium text-right">Preço (R$):</label>
              <input type="number" step="0.01" min="0" name="preco" value={produtoForm.preco} onChange={handleChangeProduto} className="campo-input" required />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <label className="text-sm font-medium text-right">Categoria:</label>
              <select name="id_categoria" value={produtoForm.id_categoria} onChange={handleChangeProduto} className="campo-input">
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <label className="text-sm font-medium text-right">Estoque:</label>
              <input type="number" min="0" name="estoque" value={produtoForm.estoque} onChange={handleChangeProduto} className="campo-input" />
            </div>
            <div className="grid grid-cols-[140px_1fr] items-center gap-2">
              <label className="text-sm font-medium text-right">Foto do produto:</label>
              <input type="file" accept="image/*" onChange={handleImagemProduto} className="text-sm" />
            </div>
            {produtoForm.imagem && (
              <img src={produtoForm.imagem} alt="Prévia do produto" className="w-24 h-24 rounded-md object-cover self-center" />
            )}
            {produtoErro && <p className="text-sm text-red-600 text-center">{produtoErro}</p>}
            <div className="flex items-center justify-center gap-3 mt-2">
              <button type="submit" disabled={produtoSalvando} className="btn-primario px-8">
                {produtoSalvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Publicar produto'}
              </button>
              {editandoId && (
                <button type="button" onClick={handleCancelarEdicaoProduto} className="btn-secundario px-6">
                  Cancelar edição
                </button>
              )}
            </div>
            {produtoSalvo && (
              <p className="text-sm text-green-700 text-center">
                {editandoId ? 'Produto atualizado com sucesso!' : 'Produto publicado com sucesso!'}
              </p>
            )}

            {meusProdutos.length > 0 && (
              <div className="border-t border-bege pt-4 mt-2">
                <h3 className="text-sm font-semibold mb-2">Meus produtos</h3>
                <ul className="flex flex-col gap-2">
                  {meusProdutos.map((p) => (
                    <li key={p.id_produto} className="flex items-center justify-between gap-2 text-sm bg-creme/50 rounded-md px-3 py-2">
                      <span className="flex-1 truncate">{p.nome}</span>
                      <span className="font-medium whitespace-nowrap">R${formatarPreco(p.preco)}</span>
                      <button
                        type="button"
                        onClick={() => handleEditarProduto(p)}
                        className="text-xs px-2 py-1 rounded border border-terracota text-terracota hover:bg-terracota hover:text-white transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirProduto(p.id_produto)}
                        disabled={excluindoId === p.id_produto}
                        className="text-xs px-2 py-1 rounded border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {excluindoId === p.id_produto ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </>
      )}
    </main>
  );
}
