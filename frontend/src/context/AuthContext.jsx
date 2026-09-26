import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('alma_artesa_usuario');
    return salvo ? JSON.parse(salvo) : null;
  });
  const [erro, setErro] = useState('');

  // Mantém o localStorage sempre sincronizado com o estado em memória.
  // Antes, telas como Perfil atualizavam `usuario` via setUsuario mas o
  // localStorage ficava com os dados antigos (ex.: foto de perfil), então
  // ao recarregar a página ou navegar a foto "sumia" de novo.
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('alma_artesa_usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('alma_artesa_usuario');
    }
  }, [usuario]);

  async function entrar(email, senha) {
    setErro('');
    try {
      const { usuario: dados } = await api.login({ email, senha });
      setUsuario(dados);
      return true;
    } catch (e) {
      setErro(e.message);
      return false;
    }
  }

  async function cadastrar(dados) {
    setErro('');
    try {
      await api.cadastrar(dados);
      return await entrar(dados.email, dados.senha);
    } catch (e) {
      setErro(e.message);
      return false;
    }
  }

  function sair() {
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, entrar, cadastrar, sair, erro }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
