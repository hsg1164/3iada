import { lookup } from "node:dns/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const supabasePackagePath = pathToFileURL(
  path.resolve(rootDir, "artifacts/api-server/node_modules/@supabase/supabase-js/dist/index.mjs"),
).href;

const SUPABASE_URL = "https://eoezxxbrpsbyfaivnmem.supabase.co";
const SUPABASE_SECRET_KEY = "REMOVED_SECRET";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7CyhV7OftachGKTdKpFRsg_zIu441nA";
const SUPABASE_JWKS_URL = "https://eoezxxbrpsbyfaivnmem.supabase.co/auth/v1/.well-known/jwks.json";
const CONNECTION_HOST = "db.eoezxxbrpsbyfaivnmem.supabase.co";

function log(label, ok, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ": " + detail : ""}`);
}

async function checkDns(host, label) {
  try {
    const result = await lookup(host);
    log(label, true, `${result.address} (${result.family === 4 ? "IPv4" : "IPv6"})`);
    return true;
  } catch (err) {
    log(label, false, err.message);
    return false;
  }
}

async function checkHttp(url, label) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    log(label, res.ok, `status ${res.status}, body length ${text.length}`);
    return res.ok;
  } catch (err) {
    log(label, false, err.message);
    return false;
  }
}

async function main() {
  console.log("=== Verifying Supabase credentials ===\n");

  await checkDns("eoezxxbrpsbyfaivnmem.supabase.co", "Supabase API host DNS");
  await checkDns(CONNECTION_HOST, "Postgres host DNS");
  await checkHttp(SUPABASE_JWKS_URL, "JWKS endpoint");

  try {
    const { createClient } = await import(supabasePackagePath);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false },
    });

    const { count, error: patientsError } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true });

    if (patientsError) {
      log("Supabase secret key query", false, patientsError.message);
    } else {
      log("Supabase secret key query", true, `patients count = ${count ?? "unknown"}`);
    }

    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (usersError) {
      log("Supabase admin auth", false, usersError.message);
    } else {
      log("Supabase admin auth", true, `users response ok (total ${users.users.length})`);
    }
  } catch (err) {
    log("Supabase client setup", false, err.message);
  }

  if (SUPABASE_PUBLISHABLE_KEY) {
    const parts = SUPABASE_PUBLISHABLE_KEY.split("_");
    log(
      "Publishable key format",
      parts[0] === "sb" && parts[1] === "publishable",
      `${parts[0]}_${parts[1]}...`,
    );
  }
}

main();
