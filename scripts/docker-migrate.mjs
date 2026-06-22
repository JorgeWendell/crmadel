import { execSync } from "node:child_process";
import pg from "pg";

const user = process.env.POSTGRES_USER ?? "adelcrm";
const password = process.env.POSTGRES_PASSWORD ?? "";
const database = process.env.POSTGRES_DB ?? "adelcrm";
const host = process.env.POSTGRES_HOST ?? "db";
const port = process.env.POSTGRES_PORT ?? "5432";

if (!password) {
  console.error("Erro: POSTGRES_PASSWORD não definida.");
  process.exit(1);
}

const databaseUrl = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
process.env.DATABASE_URL = databaseUrl;
process.env.CI = "true";

console.log(`Conectando em ${host}:${port}/${database} como ${user}...`);

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  await client.query("SELECT 1");
  console.log("Conexão com PostgreSQL OK.");
} catch (error) {
  console.error("Erro ao conectar no PostgreSQL:", error);
  process.exit(1);
} finally {
  await client.end();
}

try {
  console.log("Aplicando migrations (drizzle-kit migrate)...");
  execSync("npx drizzle-kit migrate", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Migrations aplicadas com sucesso.");
} catch (error) {
  console.error("Falha ao aplicar migrations:", error);
  process.exit(1);
}
