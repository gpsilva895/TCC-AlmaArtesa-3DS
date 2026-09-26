import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CampoSenha from '../components/CampoSenha.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { entrar, erro } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await entrar(email, senha);
    if (ok) navigate('/');
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <form onSubmit={handleSubmit} className="bg-white border border-bege rounded-lg p-6 flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-center mb-2">Entrar</h1>
        <div>
          <label className="text-sm font-medium">Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="campo-input mt-1" required />
        </div>
        <div>
          <label className="text-sm font-medium">Senha:</label>
          <div className="mt-1">
            <CampoSenha value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
        </div>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button type="submit" className="btn-primario mt-2">Logar</button>
        <p className="text-sm text-center text-marrom/70">
          Não tem conta? <Link to="/cadastro" className="text-terracota font-medium">Cadastre-se</Link>
        </p>
      </form>
    </main>
  );
}
