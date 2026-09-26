import React from 'react';

/**
 * Ícones de redes sociais em SVG (linha, estilo simples),
 * no mesmo espírito minimalista usado no rodapé dos wireframes.
 */
export function IconTwitter({ tamanho = 20, className = '' }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 00-7 3.7A11.6 11.6 0 013 4.9a4.1 4.1 0 001.3 5.5c-.6 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.6 3.3 4a4.2 4.2 0 01-1.9.1 4.1 4.1 0 003.9 2.9A8.3 8.3 0 012 18.6a11.7 11.7 0 006.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconForum({ tamanho = 20, className = '' }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 5.5h16a1 1 0 011 1V15a1 1 0 01-1 1H9l-4.5 3.8a.5.5 0 01-.8-.4V16H4a1 1 0 01-1-1V6.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconInstagram({ tamanho = 20, className = '' }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 8.5A3.5 3.5 0 017.5 5h9A3.5 3.5 0 0120 8.5v7a3.5 3.5 0 01-3.5 3.5h-9A3.5 3.5 0 014 15.5v-7z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" />
    </svg>
  );
}
