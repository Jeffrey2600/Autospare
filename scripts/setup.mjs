#!/usr/bin/env node
/**
 * One-command project setup.
 *
 * Creates .env with a real AUTH_SECRET, applies migrations, generates the
 * Prisma client and seeds the demo catalogue — in the order Prisma needs,
 * so nobody has to remember that `generate` must run before `db seed`.
 */
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const MIN_NODE = [22, 12];

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function heading(text) {
  console.log(`\n${c.bold}${c.cyan}${text}${c.reset}`);
}
function ok(text) {
  console.log(`${c.green}  ✓${c.reset} ${text}`);
}
function info(text) {
  console.log(`${c.dim}    ${text}${c.reset}`);
}
function fail(text) {
  console.log(`\n${c.red}${c.bold}  ✗ ${text}${c.reset}`);
}

function checkNode() {
  heading("1/4  Checking Node.js");
  const [major, minor] = process.versions.node.split(".").map(Number);
  const tooOld = major < MIN_NODE[0] || (major === MIN_NODE[0] && minor < MIN_NODE[1]);

  if (tooOld) {
    fail(`Node.js ${process.versions.node} is too old.`);
    console.log(`
  This project needs Node.js ${MIN_NODE.join(".")} or newer.

  ${c.bold}How to fix:${c.reset}
    1. Go to  ${c.cyan}https://nodejs.org${c.reset}
    2. Download the "LTS" version and install it
    3. Close this window, open a new one, and run this setup again
`);
    process.exit(1);
  }
  ok(`Node.js ${process.versions.node}`);
}

function createEnv() {
  heading("2/4  Creating configuration file (.env)");
  const envPath = path.join(root, ".env");

  if (existsSync(envPath)) {
    ok(".env already exists — leaving it untouched");
    return;
  }

  const examplePath = path.join(root, ".env.example");
  if (!existsSync(examplePath)) {
    fail(".env.example is missing — cannot create .env automatically.");
    process.exit(1);
  }

  const secret = randomBytes(48).toString("base64");
  const env = readFileSync(examplePath, "utf8").replace(
    /^AUTH_SECRET=.*$/m,
    `AUTH_SECRET="${secret}"`
  );

  writeFileSync(envPath, env, "utf8");
  ok(".env created with a freshly generated security key");
}

function run(label, command) {
  info(label);
  execSync(command, { cwd: root, stdio: "inherit" });
}

function setupDatabase() {
  heading("3/4  Setting up the database");
  try {
    // migrate -> generate -> seed. `generate` must come before `seed`,
    // since Prisma 7 no longer runs it automatically after a migration.
    run("Applying database structure…", "npx prisma migrate deploy");
    run("Generating database client…", "npx prisma generate");
    run("Loading demo products…", "npx prisma db seed");
    ok("Database ready with demo products, categories and banners");
  } catch {
    fail("Database setup failed.");
    console.log(`
  Try running these one at a time to see the error:
    ${c.cyan}npx prisma migrate deploy${c.reset}
    ${c.cyan}npx prisma generate${c.reset}
    ${c.cyan}npx prisma db seed${c.reset}
`);
    process.exit(1);
  }
}

function showCredentials() {
  heading("4/4  Done");

  const env = readFileSync(path.join(root, ".env"), "utf8");
  const read = (key) => env.match(new RegExp(`^${key}="?([^"\n]*)"?`, "m"))?.[1] ?? "(not set)";

  console.log(`
${c.bold}  Start the website with:${c.reset}  ${c.cyan}npm run dev${c.reset}
${c.dim}  (Windows: just double-click START.bat instead)${c.reset}

${c.bold}  Then open:${c.reset}
    Shop           ${c.cyan}http://localhost:3000${c.reset}
    Admin panel    ${c.cyan}http://localhost:3000/admin/login${c.reset}

${c.bold}  Admin login:${c.reset}
    Email          ${read("ADMIN_EMAIL")}
    Password       ${read("ADMIN_PASSWORD")}

${c.yellow}  Keep the terminal window open while using the site.${c.reset}
${c.dim}  Closing it stops the website.${c.reset}
`);
}

checkNode();
createEnv();
setupDatabase();
showCredentials();
