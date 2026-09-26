import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CampoSenha from '../components/CampoSenha.jsx';
import { formatarTelefone, telefoneValido, emailValido } from '../utils/formatar.js';

const CAMPOS_ARTESAO = [
  ['nome_loja', 'Nome da loja', 'text'],
  ['biografia', 'Biografia', 'textarea'],
  ['chave_pix', 'Chave PIX', 'text'],
];

export default function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', endereco: '', telefone: '', senha: '' });
  const [souArtesao, setSouArtesao] = useState(false);
  const [dadosArtesao, setDadosArtesao] = useState({ nome_loja: '', biografia: '', foto_perfil: '', chave_pix: '' });
  const [erroLocal, setErroLocal] = useState('');
  const { cadastrar, erro } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'telefone' ? formatarTelefone(value) : value });
  }

  function handleChangeArtesao(e) {
    setDadosArtesao({ ...dadosArtesao, [e.target.name]: e.target.value });
  }

  function handleFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => setDadosArtesao((d) => ({ ...d, foto_perfil: leitor.result }));
    leitor.readAsDataURL(arquivo);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErroLocal('');
    if (!emailValido(form.email)) {
      setErroLocal('Informe um e-mail válido.');
      return;
    }
    if (form.telefone && !telefoneValido(form.telefone)) {
      setErroLocal('Informe um telefone válido, no formato (xx) xxxxx-xxxx.');
      return;
    }
    if (form.senha.length < 6) {
      setErroLocal('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (souArtesao && !dadosArtesao.nome_loja.trim()) {
      setErroLocal('Informe o nome da loja.');
      return;
    }
    const payload = {
      ...form,
      tipo_usuario: souArtesao ? 'artesao' : 'cliente',
      ...(souArtesao ? dadosArtesao : {}),
    };
    const ok = await cadastrar(payload);
    if (ok) navigate('/');
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <form onSubmit={handleSubmit} className="bg-white border border-bege rounded-lg p-6 flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-center mb-2">Criar conta</h1>
        {['nome', 'email', 'endereco', 'telefone'].map((campo) => (
          <div key={campo}>
            <label className="text-sm font-medium capitalize">{campo}:</label>
            <input
              name={campo}
              type={campo === 'email' ? 'email' : 'text'}
              value={form[campo]}
              onChange={handleChange}
              placeholder={campo === 'telefone' ? '(xx) xxxxx-xxxx' : undefined}
              maxLength={campo === 'telefone' ? 15 : undefined}
              className="campo-input mt-1"
              required
            />
          </div>
        ))}
        <div>
          <label className="text-sm font-medium">Senha:</label>
          <div className="mt-1">
            <CampoSenha value={form.senha} onChange={handleChange} required minLength={6} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium border-t border-bege pt-4">
          <input
            type="checkbox"
            checked={souArtesao}
            onChange={(e) => setSouArtesao(e.target.checked)}
            className="w-4 h-4"
          />
          Quero vender meus produtos (sou artesão)
        </label>

        {souArtesao && (
          <div className="flex flex-col gap-4 bg-creme/50 rounded-md p-4">
            {CAMPOS_ARTESAO.map(([campo, rotulo, tipo]) => (
              <div key={campo}>
                <label className="text-sm font-medium">{rotulo}:</label>
                {tipo === 'textarea' ? (
                  <textarea
                    name={campo}
                    value={dadosArtesao[campo]}
                    onChange={handleChangeArtesao}
                    className="campo-input mt-1 min-h-[80px]"
                    required={campo === 'nome_loja'}
                  />
                ) : (
                  <input
                    name={campo}
                    value={dadosArtesao[campo]}
                    onChange={handleChangeArtesao}
                    className="campo-input mt-1"
                    required={campo === 'nome_loja'}
                  />
                )}
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">Foto de perfil da loja:</label>
              <input type="file" accept="image/*" onChange={handleFoto} className="mt-1 text-sm" />
              {dadosArtesao.foto_perfil && (
                <img src={dadosArtesao.foto_perfil} alt="Prévia" className="w-20 h-20 rounded-full object-cover mt-2" />
              )}
            </div>
          </div>
        )}

        {(erroLocal || erro) && <p className="text-sm text-red-600">{erroLocal || erro}</p>}
        <button type="submit" className="btn-primario mt-2">Cadastrar</button>
      </form>
    </main>
  );
}
