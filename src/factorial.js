/**
 * Обчислення факторіалу.
 *
 * Використовується BigInt, оскільки вже 21! = 51090942171709440000 не
 * поміщається у звичайний Number без втрати точності (2^53 - 1 ≈ 9.007e15).
 */

/** Верхня межа, щоб випадковий великий запит не «підвісив» сервер. */
export const MAX_N = 10000;

/**
 * Перевіряє вхідне значення та приводить його до невід'ємного цілого BigInt.
 * @param {number|bigint} value
 * @returns {bigint}
 */
function toPositiveInteger(value) {
  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new RangeError('Факторіал визначений лише для невід\'ємних чисел.');
    }
    if (value > BigInt(MAX_N)) {
      throw new RangeError(`Значення не може перевищувати ${MAX_N}.`);
    }
    return value;
  }

  if (typeof value !== 'number') {
    throw new TypeError('Аргумент має бути числом (number) або BigInt.');
  }
  if (!Number.isFinite(value)) {
    throw new RangeError('Аргумент має бути скінченним числом.');
  }
  if (!Number.isInteger(value)) {
    throw new RangeError('Факторіал визначений лише для цілих чисел.');
  }
  if (value < 0) {
    throw new RangeError('Факторіал визначений лише для невід\'ємних чисел.');
  }
  if (value > MAX_N) {
    throw new RangeError(`Значення не може перевищувати ${MAX_N}.`);
  }

  return BigInt(value);
}

/**
 * Обчислює n! і повертає результат типом BigInt.
 * @param {number|bigint} n невід'ємне ціле число, не більше MAX_N
 * @returns {bigint}
 */
export function factorial(n) {
  const limit = toPositiveInteger(n);

  // Ітеративний варіант: без рекурсії, тому немає ризику переповнення стека.
  let result = 1n;
  for (let i = 2n; i <= limit; i += 1n) {
    result *= i;
  }
  return result;
}

/**
 * Те саме, але результат у вигляді рядка — зручно для виводу у CLI та JSON.
 * @param {number|bigint} n
 * @returns {string}
 */
export function factorialString(n) {
  return factorial(n).toString();
}

/**
 * Кількість десяткових цифр у n! (без побудови рядка цілком).
 * @param {number|bigint} n
 * @returns {number}
 */
export function factorialDigitCount(n) {
  return factorial(n).toString().length;
}
