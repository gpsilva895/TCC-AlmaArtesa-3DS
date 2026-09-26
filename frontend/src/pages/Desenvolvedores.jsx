import React from 'react';
import { desenvolvedores } from '../data/mockData.js';
import IconePessoa from '../components/IconePessoa.jsx';

export default function Desenvolvedores() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">Desenvolvedores</h1>
      <div className="grid sm:grid-cols-3 gap-5">
        {desenvolvedores.map((dev, i) => (
          <div key={i} className="bg-white border border-bege rounded-lg p-6 text-center">
            <div className="w-28 h-28 mx-auto flex items-center justify-center text-marrom-escuro mb-4">
              <IconePessoa tamanho={80} />
            </div>
            <p className="font-semibold">{dev.nome}</p>
            <p className="text-xs text-terracota font-medium mb-2">{dev.papel}</p>
            <p className="text-sm text-marrom/70">{dev.bio}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
