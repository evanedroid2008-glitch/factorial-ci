import test from 'node:test';
import assert from 'node:assert/strict';
import { factorial, factorialString, factorialDigitCount, MAX_N } from '../src/factorial.js';

test('0! = 1', () => {
  assert.equal(factorial(0), 1n);
});

test('1! = 1', () => {
  assert.equal(factorial(1), 1n);
});

test('5! = 120', () => {
  assert.equal(factorial(5), 120n);
});

test('10! = 3628800', () => {
  assert.equal(factorial(10), 3628800n);
});

test('20! обчислюється точно (BigInt, а не Number)', () => {
  assert.equal(factorial(20).toString(), '2432902008176640000');
});

test('21! перевищує безпечний діапазон Number, але обчислюється точно', () => {
  const expected = '51090942171709440000';

  assert.equal(factorial(21).toString(), expected);
  assert.ok(factorial(21) > BigInt(Number.MAX_SAFE_INTEGER));

  // Для порівняння: той самий добуток у звичайних Number уже втрачає точність.
  const naive = Array.from({ length: 22 }, (_, index) => index + 1).reduce((a, b) => a * b, 1);
  assert.notEqual(String(naive), factorialString(22));
});

test('50! відповідає відомому значенню', () => {
  assert.equal(
    factorialString(50),
    '30414093201713378043612608166064768844377641568960512000000000000'
  );
});

test('100! має 158 цифр і 24 нулі в кінці', () => {
  const value = factorialString(100);
  assert.equal(value.length, 158);
  assert.equal(value.endsWith('0'.repeat(24)), true);
  // Кількість нулів у кінці n! = ⌊n/5⌋ + ⌊n/25⌋ + … = 20 + 4 = 24.
  assert.equal(24, Math.floor(100 / 5) + Math.floor(100 / 25));
});

test('factorialDigitCount узгоджується з довжиною рядка', () => {
  for (const n of [0, 1, 5, 10, 25, 100]) {
    assert.equal(factorialDigitCount(n), factorialString(n).length);
  }
});

test('рекурентне співвідношення n! = (n-1)! · n виконується', () => {
  for (let n = 2; n <= 40; n += 1) {
    assert.equal(factorial(n), factorial(n - 1) * BigInt(n));
  }
});

test('приймає BigInt як аргумент', () => {
  assert.equal(factorial(21n).toString(), '51090942171709440000');
});

test('від\'ємне число викликає RangeError', () => {
  assert.throws(() => factorial(-1), RangeError);
});

test('дробове число викликає RangeError', () => {
  assert.throws(() => factorial(5.5), RangeError);
});

test('рядок замість числа викликає TypeError', () => {
  assert.throws(() => factorial('5'), TypeError);
});

test('null і undefined викликають TypeError', () => {
  assert.throws(() => factorial(null), TypeError);
  assert.throws(() => factorial(undefined), TypeError);
});

test('NaN та Infinity викликають RangeError', () => {
  assert.throws(() => factorial(Number.NaN), RangeError);
  assert.throws(() => factorial(Number.POSITIVE_INFINITY), RangeError);
});

test('значення понад MAX_N відхиляється', () => {
  assert.throws(() => factorial(MAX_N + 1), RangeError);
});

test('граничне значення MAX_N обчислюється без помилки', () => {
  const value = factorial(MAX_N);
  assert.equal(typeof value, 'bigint');
  assert.ok(value.toString().startsWith('2'), 'перша цифра 10000! має бути 2');
});
