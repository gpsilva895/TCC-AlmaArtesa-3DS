/**
 * Formata um valor monetário no padrão brasileiro (R$40,00).
 * Aceita number ou string — colunas DECIMAL do MySQL chegam via
 * PDO/JSON como string, então sempre convertemos com Number() antes.
 */
export function formatarPreco(valor) {
  return Number(valor).toFixed(2).replace('.', ',');
}

/**
 * Formata telefone enquanto o usuário digita: (xx) xxxxx-xxxx (celular, 9 dígitos)
 * ou (xx) xxxx-xxxx (fixo, 8 dígitos). Remove qualquer caractere que não seja número.
 */
export function formatarTelefone(valor) {
  const digitos = (valor || '').replace(/\D/g, '').slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** Um telefone válido tem 10 (fixo) ou 11 (celular) dígitos, além do DDD. */
export function telefoneValido(valor) {
  const digitos = (valor || '').replace(/\D/g, '');
  return digitos.length === 10 || digitos.length === 11;
}

/** Formata CEP enquanto o usuário digita: 00000-000. */
export function formatarCEP(valor) {
  const digitos = (valor || '').replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 5) return digitos;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

/** Formata CPF enquanto o usuário digita: 000.000.000-00. */
export function formatarCPF(valor) {
  const digitos = (valor || '').replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

export function cpfValido(valor) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor || '');
}

export function cepValido(valor) {
  return /^\d{5}-\d{3}$/.test(valor || '');
}

/** Sigla de estado: só letras, maiúsculas, 2 caracteres (ex.: SP). */
export function formatarEstado(valor) {
  return (valor || '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
}

export function estadoValido(valor) {
  return /^[A-Z]{2}$/.test(valor || '');
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor || '');
}
