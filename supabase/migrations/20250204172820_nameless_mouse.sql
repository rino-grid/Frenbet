/*
  # Remove authentication requirements

  1. Changes
    - Drop existing tables
    - Recreate tables without auth dependencies
    - Add player_name columns
    - Update RLS policies for public access

  2. New Schema
    - betting_sessions
      - id (uuid)
      - title (text)
      - option1_name (text)
      - option2_name (text)
      - total_pool (decimal)
      - created_at (timestamptz)
      - op_name (text)
      - slug (text)
    
    - bets
      - id (uuid)
      - session_id (uuid)
      - player_name (text)
      - option_index (integer)
      - amount (decimal)
      - created_at (timestamptz)
*/

-- Drop existing tables
DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS betting_sessions;

-- Recreate betting_sessions table
CREATE TABLE betting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  option1_name text NOT NULL,
  option2_name text NOT NULL,
  total_pool decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  op_name text NOT NULL,
  slug text UNIQUE NOT NULL
);

-- Recreate bets table
CREATE TABLE bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES betting_sessions(id) ON DELETE CASCADE,
  player_name text NOT NULL,
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

CREATE POLICY "Anyone can create betting sessions"
  ON betting_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for bets
CREATE POLICY "Anyone can read bets"
  ON bets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can place bets"
  ON bets
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to update total pool
CREATE OR REPLACE FUNCTION update_total_pool()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE betting_sessions
  SET total_pool = (
    SELECT COALESCE(SUM(amount), 0)
    FROM bets
    WHERE session_id = NEW.session_id
  )
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total pool when bets change
CREATE TRIGGER update_total_pool_trigger
AFTER INSERT OR UPDATE OR DELETE ON bets
FOR EACH ROW
EXECUTE FUNCTION update_total_pool();