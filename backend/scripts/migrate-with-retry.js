const { spawn } = require('node:child_process');
const path = require('node:path');

const maxAttempts = 6;
const retryDelaysMs = [1000, 2000, 4000, 8000, 15000];
const prismaCli = require.resolve('prisma');

function deployMigrations() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [prismaCli, 'migrate', 'deploy'],
      {
        cwd: path.resolve(__dirname, '..'),
        env: process.env,
        stdio: ['inherit', 'pipe', 'pipe'],
      }
    );
    let output = '';

    for (const stream of [child.stdout, child.stderr]) {
      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        output += chunk;
        (stream === child.stdout ? process.stdout : process.stderr).write(chunk);
      });
    }

    child.once('error', reject);
    child.once('close', (code) => resolve({ code, output }));
  });
}

async function main() {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await deployMigrations();

    if (result.code === 0) {
      return;
    }

    const retryDelayMs = retryDelaysMs[attempt - 1];
    if (!result.output.includes('P1001') || retryDelayMs === undefined) {
      process.exitCode = result.code ?? 1;
      return;
    }

    console.warn(
      `Neon is not reachable yet (attempt ${attempt}/${maxAttempts}); retrying in ${retryDelayMs}ms.`
    );
    await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
  }
}

main().catch((error) => {
  console.error('Failed to run Prisma migrations:', error);
  process.exitCode = 1;
});
