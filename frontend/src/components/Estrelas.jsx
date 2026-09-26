import React from 'react';

export default function Estrelas({ media = 0, tamanho = 14 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${media} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={tamanho}
          height={tamanho}
          viewBox="0 0 24 24"
          fill={n <= Math.round(media) ? '#B5623B' : 'none'}
          stroke="#B5623B"
          strokeWidth="1.5"
        >
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
        </svg>
      ))}
    </div>
  );
}
