import { db } from "@workspace/db";
import { systemUsersTable } from "@workspace/db/src/schema/users";
import { rolesTable } from "@workspace/db/src/schema/roles";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const username = "116116";
    const password = "116116";
    const clinicId = 1;

    console.log("Looking for admin role...");
    const adminRole = await db.select().from(rolesTable).where(eq(rolesTable.name, "admin")).limit(1);
    
    if (adminRole.length === 0) {
      console.log("No admin role found, please make sure the db has roles.");
      process.exit(1);
    }

    const roleId = adminRole[0].id;
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("Creating or updating user 116116...");
    
    // Check if user exists
    const existingUser = await db.select().from(systemUsersTable).where(eq(systemUsersTable.username, username)).limit(1);

    if (existingUser.length > 0) {
      await db.update(systemUsersTable)
        .set({ 
          passwordHash, 
          isSuperadmin: true,
          roleId
        })
        .where(eq(systemUsersTable.id, existingUser[0].id));
      console.log("User updated to superadmin!");
    } else {
      await db.insert(systemUsersTable).values({
        clinicId,
        name: "مدير المنصة",
        username,
        passwordHash,
        roleId,
        isSuperadmin: true,
        branch: "الفرع الرئيسي"
      });
      console.log("Superadmin user created successfully!");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
