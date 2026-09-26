import React, { useState } from 'react';

/**
 * Campo de senha com botão para mostrar/ocultar o texto digitado.
 * Uso: <CampoSenha name="senha" value={form.senha} onChange={handleChange} />
 */
export default function CampoSenha({
  value,
  onChange,
  name = 'senha',
  placeholder,
  required = false,
  className = 'campo-input',
  minLength,
}) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="relative">
      <input
        type={mostrar ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={`${className} pr-16 w-full`}
      />
      <button
        type="button"
        onClick={() => setMostrar((m) => !m)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-marrom/60 hover:text-terracota"
        tabIndex={-1}
      >
        {mostrar ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
