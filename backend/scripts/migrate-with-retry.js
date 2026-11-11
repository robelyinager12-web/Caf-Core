const { spawn } = require('node:child_process');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const retryDelaysMs = [1000, 2000, 4000, 8000, 15000, 20000, 20000, 20000, 20000];
const maxAttempts = retryDelaysMs.length + 1;
const prismaCli = require.resolve('prisma');

function getMigrationEnvironment() {
  if (process.env.DATABASE_URL_UNPOOLED) {
    return process.env;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be configured before running migrations.');
  }

  let directUrl;
  try {
    directUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(directUrl.protocol)) {
    throw new Error('DATABASE_URL must use the PostgreSQL protocol.');
  }

  if (directUrl.hostname.includes('-pooler')) {
    directUrl.hostname = directUrl.hostname.replace('-pooler', '');
    console.warn(
      'DATABASE_URL_UNPOOLED is not set; using the direct Neon endpoint derived from DATABASE_URL for migrations.'
    );
  } else {
    console.warn(
      'DATABASE_URL_UNPOOLED is not set; using DATABASE_URL as the direct migration URL.'
    );
  }

  return {
    ...process.env,
    DATABASE_URL_UNPOOLED: directUrl.toString(),
  };
}

function deployMigrations() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [prismaCli, 'migrate', 'deploy'],
      {
        cwd: path.resolve(__dirname, '..'),
        env: getMigrationEnvironment(),
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

if (require.main === module) {
  main().catch((error) => {
    console.error('Failed to run Prisma migrations:', error);
    process.exitCode = 1;
  });
}

module.exports = { getMigrationEnvironment };
