#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const shouldApply = args.has("--apply");
const sqlPath = resolve(process.cwd(), "supabase/master.sql");

function printMasterSql() {
  const sql = readFileSync(sqlPath, "utf8");
  process.stdout.write(sql.endsWith("\n") ? sql : `${sql}\n`);
}

if (!shouldApply) {
  printMasterSql();
  process.exit(0);
}

try {
  execFileSync("supabase", ["db", "execute", "--file", sqlPath], { stdio: "inherit" });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(
    `Failed to apply ${sqlPath} with Supabase CLI.\n` +
      `Make sure Supabase CLI is installed and linked to your project.\n` +
      `Original error: ${message}\n`,
  );
  process.exit(1);
}
