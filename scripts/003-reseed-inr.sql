-- Clear existing data and re-seed with INR amounts
DELETE FROM transactions;
DELETE FROM budgets;

-- Seed transactions with realistic Indian student finance data (last 3 months)
INSERT INTO transactions (type, category, amount, description, date) VALUES
  -- January 2026
  ('income', 'Salary', 15000.00, 'Part-time campus job', '2026-01-05'),
  ('income', 'Freelance', 8000.00, 'Web design project', '2026-01-12'),
  ('expense', 'Rent', 7500.00, 'Monthly PG/apartment rent', '2026-01-01'),
  ('expense', 'Groceries', 3200.00, 'Weekly groceries', '2026-01-08'),
  ('expense', 'Groceries', 2800.00, 'Weekly groceries', '2026-01-22'),
  ('expense', 'Transport', 1500.00, 'Monthly metro/bus pass', '2026-01-03'),
  ('expense', 'Entertainment', 800.00, 'Movie tickets & snacks', '2026-01-15'),
  ('expense', 'Entertainment', 499.00, 'Streaming subscriptions', '2026-01-20'),
  ('expense', 'Education', 2500.00, 'Textbooks', '2026-01-10'),
  ('expense', 'Utilities', 1800.00, 'Electric & internet', '2026-01-06'),
  ('expense', 'Dining Out', 1200.00, 'Restaurant meals', '2026-01-18'),

  -- February 2026
  ('income', 'Salary', 15000.00, 'Part-time campus job', '2026-02-05'),
  ('income', 'Freelance', 12000.00, 'Logo design work', '2026-02-18'),
  ('expense', 'Rent', 7500.00, 'Monthly PG/apartment rent', '2026-02-01'),
  ('expense', 'Groceries', 3500.00, 'Weekly groceries', '2026-02-07'),
  ('expense', 'Groceries', 2900.00, 'Weekly groceries', '2026-02-21'),
  ('expense', 'Transport', 1500.00, 'Monthly metro/bus pass', '2026-02-03'),
  ('expense', 'Entertainment', 3000.00, 'Concert tickets', '2026-02-14'),
  ('expense', 'Entertainment', 499.00, 'Streaming subscriptions', '2026-02-20'),
  ('expense', 'Education', 1200.00, 'Online course', '2026-02-10'),
  ('expense', 'Utilities', 2000.00, 'Electric & internet', '2026-02-06'),
  ('expense', 'Dining Out', 2500.00, 'Valentines dinner & cafes', '2026-02-14'),
  ('expense', 'Shopping', 2499.00, 'New headphones', '2026-02-22'),

  -- March 2026 (partial)
  ('income', 'Salary', 15000.00, 'Part-time campus job', '2026-03-05'),
  ('expense', 'Rent', 7500.00, 'Monthly PG/apartment rent', '2026-03-01'),
  ('expense', 'Groceries', 3100.00, 'Weekly groceries', '2026-03-06'),
  ('expense', 'Transport', 1500.00, 'Monthly metro/bus pass', '2026-03-03'),
  ('expense', 'Entertainment', 1200.00, 'Gaming subscription & movie', '2026-03-08'),
  ('expense', 'Utilities', 1900.00, 'Electric & internet', '2026-03-06'),
  ('expense', 'Dining Out', 850.00, 'Cafe visits', '2026-03-10')
ON CONFLICT DO NOTHING;

-- Seed budgets with reasonable Indian student limits (in INR)
INSERT INTO budgets (category, monthly_limit) VALUES
  ('Rent', 8000.00),
  ('Groceries', 6000.00),
  ('Transport', 2000.00),
  ('Entertainment', 2500.00),
  ('Education', 3000.00),
  ('Utilities', 2500.00),
  ('Dining Out', 2000.00),
  ('Shopping', 2000.00)
ON CONFLICT (category) DO NOTHING;
