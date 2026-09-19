-- FinTrack v2 Database Migration
-- Run this against your Neon DB to add new features

-- Goals Tracker
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  icon VARCHAR(50) DEFAULT 'target',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill Reminders
CREATE TABLE IF NOT EXISTS bills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Net Worth Tracker
CREATE TABLE IF NOT EXISTS net_worth_entries (
  id SERIAL PRIMARY KEY,
  entry_date DATE NOT NULL UNIQUE,
  assets DECIMAL(12,2) DEFAULT 0,
  liabilities DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring flag on transactions (safe to run even if column exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='transactions' AND column_name='is_recurring'
  ) THEN
    ALTER TABLE transactions ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
