import React from 'react';
import { IconTwitter, IconForum, IconInstagram } from './IconesSociais.jsx';

export default function Footer() {
  return (
    <footer className="bg-terracota text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 sm:grid-cols-3 text-sm divide-y divide-white/25 sm:divide-y-0">
        <div className="sm:pr-8">
          <h3 className="font-semibold mb-2">Atendimento</h3>
          <p className="text-white/85">(11) 0000-0000</p>
        </div>
        <div className="sm:border-l sm:border-white/25 sm:pl-8 sm:pr-8 pt-6 sm:pt-0">
          <h3 className="font-semibold mb-2">Redes Sociais</h3>
          <div className="flex gap-4 text-white/85">
            <IconTwitter />
            <IconForum />
            <IconInstagram />
          </div>
        </div>
        <div className="sm:border-l sm:border-white/25 sm:pl-8 pt-6 sm:pt-0">
          <h3 className="font-semibold mb-2">Sobre nós</h3>
          <p className="text-white/85">
            Conectamos artesãos de pequeno porte da cidade de São Paulo a quem valoriza
            peças feitas à mão, apoiando o trabalho decente e o crescimento econômico local.
          </p>
        </div>
      </div>
      <div className="border-t border-white/15 text-center text-xs text-white/70 py-3">
        © {new Date().getFullYear()} Alma Artesã. Todos os direitos reservados.
      </div>
    </footer>
  );
}
