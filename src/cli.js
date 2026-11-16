#!/usr/bin/env node
import { factorial, factorialDigitCount } from './factorial.js';

const rawValue = process.argv[2];

if (rawValue === undefined) {
  console.error('Використання: node src/cli.js <n>   (наприклад: node src/cli.js 20)');
  process.exit(1);
}

const n = Number(rawValue);

try {
  const value = factorial(n);
  console.log(`${n}! = ${value}`);
  console.log(`Кількість цифр: ${factorialDigitCount(n)}`);
} catch (error) {
  console.error(`Помилка: ${error.message}`);
  process.exit(1);
}
