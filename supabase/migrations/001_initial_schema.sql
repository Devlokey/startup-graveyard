-- Startups table
CREATE TABLE IF NOT EXISTS startups (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  sector        text,
  funding_inr   bigint,          -- stored in lakhs; ₹1 Cr = 100 lakhs
  founded_year  int,
  shutdown_date date,
  reason        text,
  failure_tag   text CHECK (failure_tag IN ('Overfunded', 'Too Early', 'Bad Product', 'Market Shift')),
  source_url    text,
  source_name   text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive name index for deduplication lookups
CREATE INDEX IF NOT EXISTS startups_name_lower ON startups (lower(name));

-- Aggregate view for homepage counters
CREATE OR REPLACE VIEW startup_stats AS
SELECT
  COUNT(*)::int                        AS total_dead,
  COALESCE(SUM(funding_inr) / 100, 0)::bigint AS total_burned_crore
FROM startups;

-- Allow public read access (RLS off — this is public data)
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON startups FOR SELECT USING (true);
