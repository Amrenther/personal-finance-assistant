import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

// Manually read .env.local
const envContent = readFileSync(".env.local", "utf-8")
const dbUrl = envContent.match(/DATABASE_URL_UNPOOLED="([^"]+)"/)?.[1] ||
              envContent.match(/DATABASE_URL="([^"]+)"/)?.[1]

if (!dbUrl) {
  console.error("❌ Could not find DATABASE_URL in .env.local")
  process.exit(1)
}

const sql = neon(dbUrl)

async function runMigration() {
  console.log("🚀 Running FinTrack v2 migration...")

  try {
    // Goals Tracker
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(12,2) NOT NULL,
        current_amount DECIMAL(12,2) DEFAULT 0,
        deadline DATE,
        icon VARCHAR(50) DEFAULT 'target',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log("✅ Goals table ready")

    // Bill Reminders
    await sql`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        due_date DATE NOT NULL,
        is_paid BOOLEAN DEFAULT FALSE,
        category VARCHAR(100),
        is_recurring BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log("✅ Bills table ready")

    // Net Worth Tracker
    await sql`
      CREATE TABLE IF NOT EXISTS net_worth_entries (
        id SERIAL PRIMARY KEY,
        entry_date DATE NOT NULL UNIQUE,
        assets DECIMAL(12,2) DEFAULT 0,
        liabilities DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
    console.log("✅ Net worth entries table ready")

    // Add is_recurring to transactions if not exists
    const colExists = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name='transactions' AND column_name='is_recurring'
    `
    if (colExists.length === 0) {
      await sql`ALTER TABLE transactions ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE`
      console.log("✅ Added is_recurring column to transactions")
    } else {
      console.log("✅ is_recurring column already exists in transactions")
    }

    console.log("\n🎉 Migration complete! All v2 tables are ready.")
  } catch (err) {
    console.error("❌ Migration failed:", err)
    process.exit(1)
  }
}

runMigration()
