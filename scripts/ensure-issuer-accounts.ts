/**
 * Script to ensure all projects have issuer accounts
 * Run this in production to fix projects that don't have issuer accounts
 *
 * Usage: npx tsx scripts/ensure-issuer-accounts.ts
 */

import { supabaseServer } from "../src/lib/supabase/server";
import {
  createIssuerAccount,
  getIssuerAccount,
} from "../src/lib/services/issuerAccounts";

async function ensureIssuerAccounts() {
  console.log("🔍 Checking all projects for issuer accounts...\n");

  try {
    // Get all projects
    const { data: projects, error } = await (
      supabaseServer.from("projects") as any
    )
      .select("id, title, owner_id")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching projects:", error);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log("ℹ️  No projects found");
      return;
    }

    console.log(`📊 Found ${projects.length} projects\n`);

    let created = 0;
    let existing = 0;
    let failed = 0;

    for (const project of projects as any[]) {
      console.log(`\n📦 Project: ${project.title} (${project.id})`);

      // Check if issuer account exists
      const issuerResult = await getIssuerAccount(project.id);

      if (issuerResult.account && !issuerResult.error) {
        console.log(
          `   ✅ Issuer account exists: ${issuerResult.account.public_key}`,
        );
        console.log(
          `   💰 Funded: ${issuerResult.account.is_funded ? "Yes" : "No"}`,
        );
        existing++;
      } else {
        console.log("   ⚠️  No issuer account found, creating...");

        const createResult = await createIssuerAccount(project.id);

        if (createResult.error) {
          console.log(`   ❌ Failed to create: ${createResult.error}`);
          failed++;
        } else {
          console.log(
            `   ✅ Created issuer account: ${createResult.publicKey}`,
          );
          created++;
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Summary:");
    console.log(`   ✅ Existing accounts: ${existing}`);
    console.log(`   🆕 Created accounts: ${created}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the script
ensureIssuerAccounts()
  .then(() => {
    console.log("✨ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
