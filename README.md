# Практичне 9 — генератор факторіалу з CI на GitHub Actions

Невеликий застосунок на Node.js, який обчислює факторіал довільного числа (точність — `BigInt`), має веб-інтерфейс, CLI, 22 автотести та налаштований CI-pipeline.

## Стек

- Node.js 18+ (перевірено на 20.20.2), ES-модулі.
- Тести — вбудований раннер `node:test` + `node:assert/strict`. **Нуль сторонніх залежностей**, тому CI не залежить від доступності npm-реєстру.
- HTTP-сервер — вбудований модуль `node:http` (без Express).
- CI — GitHub Actions (`.github/workflows/ci.yml`).

## Структура

```text
Practical9_Factorial_CI/
├── .github/workflows/ci.yml   # пайплайн: тести (матриця 18/20/22) → артефакт
├── src/
│   ├── factorial.js           # чиста логіка: factorial, factorialString, factorialDigitCount
│   ├── cli.js                 # консольний запуск: node src/cli.js 20
│   └── server.js              # HTTP-сервер + веб-сторінка + /api/factorial
├── test/
│   ├── factorial.test.js      # 18 тестів логіки та валідації
│   └── server.test.js         # 4 тести API та HTTP-маршрутів
├── package.json
└── README.md
```

## Запуск

```bash
npm install        # створює node_modules (залежностей немає, потрібно лише для npm ci у CI)
npm test           # 22 тести
npm start          # http://localhost:3000 — веб-інтерфейс
node src/cli.js 20 # CLI: 20! = 2432902008176640000
```

Приклади API:

```bash
curl "http://localhost:3000/api/factorial?n=100"
# {"n":100,"value":"9332...0000","digits":158}
curl http://localhost:3000/healthz
# {"status":"ok"}
```

## Що покривають тести

**Логіка (`test/factorial.test.js`)**

1. `0! = 1` та `1! = 1` — граничні випадки.
2. `5! = 120`, `10! = 3628800`.
3. `20!`, `21!`, `50!`, `100!` — точні великі значення (BigInt).
4. `100!` має 158 цифр і 24 нулі в кінці.
5. `factorialDigitCount` узгоджується з довжиною рядка.
6. Рекурентність `n! = (n−1)! · n` для n = 2…40.
7. Приймання `BigInt` як аргументу.
8. Помилки: від’ємне, дробове, `NaN`, `Infinity`, значення > `MAX_N` → `RangeError`; рядок, `null`, `undefined` → `TypeError`.

**HTTP (`test/server.test.js`)**

9. `buildFactorialResponse` повертає значення, 400 без `n` і для від’ємного `n`.
10. Реальний сервер на випадковому порту: сторінка `/`, `/api/factorial`, `/healthz`, 404.

## Пайплайн

`.github/workflows/ci.yml` складається з двох job:

| Job | Що робить | Умова запуску |
| --- | --- | --- |
| `test` | checkout → setup-node (матриця 18.x / 20.x / 22.x) → `npm ci` → `npm test` → smoke-запуск CLI | кожен push, pull request, ручний запуск |
| `package` | checkout → setup-node 20.x → `npm ci` → повторний `npm test` → zip-архів без `node_modules` → upload-artifact | лише після успішного `test` (`needs: test`) |

`fail-fast: false` дозволяє побачити результат усіх трьох версій Node.js, навіть якщо одна впала. Якщо `test` падає, `package` не запускається — саме це гарантує, що зламаний код не потрапить далі.

## Як перевірити роботу CI

1. Створіть репозиторій на GitHub і завантажте вміст цієї папки (файл `.github/workflows/ci.yml` має зберегтися — це прихована папка).
2. Вкладка **Actions** → workflow **CI — тести та збірка артефакту** → запуск із зеленим статусом.
3. Відкрийте запуск → job `Tests (Node 20.x)` → крок **Run tests**, у логах буде `# pass 22`.
4. Щоб продемонструвати «червоний» сценарій: зламайте один тест, зробіть push, побачте червоний хрестик і те, що job `package` пропущено; потім поверніть код назад.

## Локальний запуск GitHub Actions без GitHub

```bash
# потрібен Docker
act push
```

`act` (nektos/act) читає той самий `.github/workflows/ci.yml` і виконує кроки в контейнері локально.
