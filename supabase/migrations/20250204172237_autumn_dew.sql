/*
  # Betting System Schema

  1. New Tables
    - `betting_sessions`
      - `id` (uuid, primary key)
      - `title` (text)
      - `option1_name` (text)
      - `option2_name` (text)
      - `total_pool` (decimal)
      - `created_at` (timestamp)
      - `op_id` (uuid, references auth.users)
      - `slug` (text, unique) - for shareable links
    
    - `bets`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references betting_sessions)
      - `user_id` (uuid, references auth.users)
      - `option_index` (integer) - 0 for option1, 1 for option2
      - `amount` (decimal)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Allow anyone to read betting sessions and bets
    - Only allow authenticated users to create sessions and place bets
*/

-- Create tables
CREATE TABLE betting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  option1_name text NOT NULL,
  option2_name text NOT NULL,
  total_pool decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  op_id uuid REFERENCES auth.users(id),
  slug text UNIQUE NOT NULL
);

CREATE TABLE bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES betting_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  option_index integer CHECK (option_index IN (0, 1)),
  amount decimal NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE betting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Policies for betting_sessions
CREATE POLICY "Anyone can read betting sessions"
  ON betting_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create betting sessions"
  ON betting_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for bets
CREATE POLICY "Anyone can read bets"
  ON bets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can place bets"
  ON bets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);