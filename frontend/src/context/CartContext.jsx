import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

// O carrinho existe também para visitantes (sem login), então tem uma "gaveta"
// própria para convidado. Já a lista de desejos exige login, então cada
// usuário tem a sua — assim ela nunca aparece para outra conta ou deslogado.
function chaveCarrinho(idUsuario) {
  return idUsuario ? `alma_artesa_carrinho_${idUsuario}` : 'alma_artesa_carrinho_convidado';
}
function chaveDesejos(idUsuario) {
  return `alma_artesa_desejos_${idUsuario}`;
}

function lerLista(chave) {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { usuario } = useAuth();
  const idUsuario = usuario?.id_usuario || null;

  const [itens, setItens] = useState(() => lerLista(chaveCarrinho(idUsuario)));
  const [desejos, setDesejos] = useState(() => (idUsuario ? lerLista(chaveDesejos(idUsuario)) : []));

  // Antes, o carrinho e a lista de desejos ficavam numa única chave global do
  // localStorage, compartilhada por qualquer sessão no navegador. Por isso um
  // produto favoritado em uma conta continuava aparecendo como favoritado
  // mesmo depois de sair ou entrar com outra conta. Agora, sempre que o
  // usuário logado muda (login, logout ou troca de conta), recarregamos os
  // dados da "gaveta" certa.
  useEffect(() => {
    setItens(lerLista(chaveCarrinho(idUsuario)));
    setDesejos(idUsuario ? lerLista(chaveDesejos(idUsuario)) : []);
  }, [idUsuario]);

  useEffect(() => {
    localStorage.setItem(chaveCarrinho(idUsuario), JSON.stringify(itens));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itens]);

  useEffect(() => {
    if (!idUsuario) return;
    localStorage.setItem(chaveDesejos(idUsuario), JSON.stringify(desejos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desejos]);

  function adicionarAoCarrinho(produto, quantidade = 1) {
    const preco = Number(produto.preco);
    setItens((atual) => {
      const existente = atual.find((i) => i.id_produto === produto.id_produto);
      if (existente) {
        return atual.map((i) =>
          i.id_produto === produto.id_produto ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [...atual, { ...produto, preco, quantidade }];
    });
  }

  function alterarQuantidade(idProduto, delta) {
    setItens((atual) =>
      atual
        .map((i) =>
          i.id_produto === idProduto ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i
        )
        .filter((i) => i.quantidade > 0)
    );
  }

  function removerDoCarrinho(idProduto) {
    setItens((atual) => atual.filter((i) => i.id_produto !== idProduto));
  }

  function limparCarrinho() {
    setItens([]);
  }

  function alternarDesejo(produto) {
    setDesejos((atual) => {
      const existe = atual.some((p) => p.id_produto === produto.id_produto);
      return existe
        ? atual.filter((p) => p.id_produto !== produto.id_produto)
        : [...atual, produto];
    });
  }

  const total = useMemo(
    () => itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0),
    [itens]
  );
  const quantidadeTotal = useMemo(
    () => itens.reduce((soma, i) => soma + i.quantidade, 0),
    [itens]
  );

  return (
    <CartContext.Provider
      value={{
        itens,
        desejos,
        total,
        quantidadeTotal,
        adicionarAoCarrinho,
        alterarQuantidade,
        removerDoCarrinho,
        limparCarrinho,
        alternarDesejo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
