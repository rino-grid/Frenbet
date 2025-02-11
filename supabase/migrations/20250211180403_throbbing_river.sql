/*
  # Add bet percentage limits

  1. Changes
    - Add min_bet_percentage column to betting_sessions (default 50%)
    - Add max_bet_percentage column to betting_sessions (default 200%)
    
  2. Purpose
    - Enable configurable betting limits based on first bet amount
    - Prevent unfair betting situations
*/

ALTER TABLE betting_sessions
ADD COLUMN min_bet_percentage integer DEFAULT 50,
ADD COLUMN max_bet_percentage integer DEFAULT 200;