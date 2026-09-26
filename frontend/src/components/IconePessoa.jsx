import React from 'react';

/**
 * Ícone genérico de pessoa (avatar placeholder), no mesmo estilo
 * sólido/preto usado nos wireframes do Alma Artesã.
 */
export default function IconePessoa({ tamanho = 64, className = '' }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="30" r="18" fill="currentColor" />
      <path d="M18 92c0-24 14-37 32-37s32 13 32 37" fill="currentColor" />
    </svg>
  );
}
