/**
 * Smoke-тест собранной PWA.
 *
 * Скрипт сам поднимает `vite preview`, проверяет ключевые файлы и гасит процесс.
 * Запуск: node scripts/smoke-preview.mjs [base-url]
 *
 * Проверяет: index.html, manifest.json, service-worker.js, offline.html, иконку.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const BASE_URL = (process.argv[2] ?? 'http://127.0.0.1:4173/candys-paradise/').replace(/\/?$/, '/');

const CHECKS = [
  { name: 'index.html', path: '', expect: 'Кондитерский Рай' },
  { name: 'manifest.json', path: 'manifest.json', expect: '"start_url"' },
  { name: 'service-worker.js', path: 'service-worker.js', expect: 'SKIP_WAITING' },
  { name: 'offline.html', path: 'offline.html', expect: 'Нет подключения' },
  { name: 'icon-512.png', path: 'icons/icon-512.png', expect: null },
];

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function waitForServer(timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return true;
    } catch {
      // сервер ещё стартует
    }
    await sleep(400);
  }
  return false;
}

function stopProcess(child) {
  if (!child || child.killed) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

function spawnPreview() {
  if (process.platform === 'win32') {
    return spawn(
      'cmd.exe',
      ['/c', 'npm run preview -w @candys/extension -- --host 127.0.0.1'],
      { cwd: REPO_ROOT, stdio: 'ignore' },
    );
  }

  return spawn('npm', ['run', 'preview', '-w', '@candys/extension', '--', '--host', '127.0.0.1'], {
    cwd: REPO_ROOT,
    stdio: 'ignore',
  });
}

const preview = spawnPreview();

let failed = 0;

try {
  const ready = await waitForServer();
  if (!ready) {
    console.log(`FAIL preview-сервер не ответил за 15 с (${BASE_URL})`);
    process.exitCode = 1;
  } else {
    console.log(`preview: ${BASE_URL}\n`);

    for (const check of CHECKS) {
      const response = await fetch(`${BASE_URL}${check.path}`);
      const body = check.path.endsWith('.png') ? '' : await response.text();
      const okBody = check.expect ? body.includes(check.expect) : true;
      const ok = response.ok && okBody;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${response.status} ${check.name}`);
      if (!ok) failed += 1;
    }

    console.log(failed === 0 ? '\nSMOKE PREVIEW: OK' : `\nSMOKE PREVIEW: FAILED (${failed})`);
    process.exitCode = failed === 0 ? 0 : 1;
  }
} catch (error) {
  console.error('SMOKE PREVIEW: FAILED —', error.message);
  process.exitCode = 1;
} finally {
  stopProcess(preview);
  await sleep(300);
}
