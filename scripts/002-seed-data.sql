-- Seed transactions with realistic student finance data (last 3 months)
INSERT INTO transactions (type, category, amount, description, date) VALUES
  -- January 2026
  ('income', 'Salary', 1800.00, 'Part-time campus job', '2026-01-05'),
  ('income', 'Freelance', 350.00, 'Web design project', '2026-01-12'),
  ('expense', 'Rent', 750.00, 'Monthly apartment rent', '2026-01-01'),
  ('expense', 'Groceries', 220.00, 'Weekly groceries', '2026-01-08'),
  ('expense', 'Groceries', 185.00, 'Weekly groceries', '2026-01-22'),
  ('expense', 'Transport', 65.00, 'Monthly bus pass', '2026-01-03'),
  ('expense', 'Entertainment', 45.00, 'Movie tickets & snacks', '2026-01-15'),
  ('expense', 'Entertainment', 30.00, 'Streaming subscriptions', '2026-01-20'),
  ('expense', 'Education', 120.00, 'Textbooks', '2026-01-10'),
  ('expense', 'Utilities', 95.00, 'Electric & internet', '2026-01-06'),
  ('expense', 'Dining Out', 80.00, 'Restaurant meals', '2026-01-18'),

  -- February 2026
  ('income', 'Salary', 1800.00, 'Part-time campus job', '2026-02-05'),
  ('income', 'Freelance', 500.00, 'Logo design work', '2026-02-18'),
  ('expense', 'Rent', 750.00, 'Monthly apartment rent', '2026-02-01'),
  ('expense', 'Groceries', 240.00, 'Weekly groceries', '2026-02-07'),
  ('expense', 'Groceries', 195.00, 'Weekly groceries', '2026-02-21'),
  ('expense', 'Transport', 65.00, 'Monthly bus pass', '2026-02-03'),
  ('expense', 'Entertainment', 120.00, 'Concert tickets', '2026-02-14'),
  ('expense', 'Entertainment', 30.00, 'Streaming subscriptions', '2026-02-20'),
  ('expense', 'Education', 45.00, 'Online course', '2026-02-10'),
  ('expense', 'Utilities', 105.00, 'Electric & internet', '2026-02-06'),
  ('expense', 'Dining Out', 135.00, 'Valentines dinner & cafes', '2026-02-14'),
  ('expense', 'Shopping', 89.00, 'New headphones', '2026-02-22'),

  -- March 2026 (partial)
  ('income', 'Salary', 1800.00, 'Part-time campus job', '2026-03-05'),
  ('expense', 'Rent', 750.00, 'Monthly apartment rent', '2026-03-01'),
  ('expense', 'Groceries', 210.00, 'Weekly groceries', '2026-03-06'),
  ('expense', 'Transport', 65.00, 'Monthly bus pass', '2026-03-03'),
  ('expense', 'Entertainment', 55.00, 'Gaming subscription & movie', '2026-03-08'),
  ('expense', 'Utilities', 98.00, 'Electric & internet', '2026-03-06'),
  ('expense', 'Dining Out', 42.00, 'Cafe visits', '2026-03-10')
ON CONFLICT DO NOTHING;

-- Seed budgets with reasonable student limits
INSERT INTO budgets (category, monthly_limit) VALUES
  ('Rent', 800.00),
  ('Groceries', 400.00),
  ('Transport', 80.00),
  ('Entertainment', 100.00),
  ('Education', 150.00),
  ('Utilities', 120.00),
  ('Dining Out', 100.00),
  ('Shopping', 75.00)
ON CONFLICT (category) DO NOTHING;
