import bcrypt from "bcrypt";

async function run() {
  const hash = await bcrypt.hash("116116", 10);
  console.log("=================== SQL COMMAND ===================");
  console.log(`INSERT INTO system_users (clinic_id, name, username, password_hash, role_id, is_superadmin) VALUES (1, 'Super Admin', '116116', '${hash}', 1, true) ON CONFLICT (username) DO UPDATE SET password_hash = '${hash}', is_superadmin = true;`);
  console.log("===================================================");
}
run();
