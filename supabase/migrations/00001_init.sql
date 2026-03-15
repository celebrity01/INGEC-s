-- INGEC Projects Registry
CREATE TABLE IF NOT EXISTS projects (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name    TEXT NOT NULL,
  sector          TEXT CHECK (sector IN (
    'Infrastructure','Health','Education','Energy',
    'Water','Digital','Housing','Agriculture','Security','Social'
  )),
  mda             TEXT NOT NULL,
  state           TEXT NOT NULL,
  lga             TEXT NOT NULL,
  contractor      TEXT NOT NULL,
  approved_budget BIGINT NOT NULL,
  actual_spend    BIGINT DEFAULT 0,
  completion_pct  DECIMAL(5,2) DEFAULT 0,
  status          TEXT DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE','COMPLETED','ABANDONED','SUSPENDED','PROTECTED'
  )),
  administration  TEXT NOT NULL,
  start_date      DATE NOT NULL,
  target_date     DATE,
  actual_end_date DATE,
  latitude        DECIMAL(10,7),
  longitude       DECIMAL(10,7),
  blockchain_hash TEXT,
  citizen_flags   INTEGER DEFAULT 0,
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-protect projects >= 50% complete
CREATE OR REPLACE FUNCTION protect_at_fifty()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completion_pct >= 50 AND NEW.status = 'ACTIVE' THEN
    NEW.status := 'PROTECTED';
  END IF;
  NEW.last_updated := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_project
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION protect_at_fifty();

-- Citizen Reports Table
CREATE TABLE IF NOT EXISTS citizen_reports (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  report_type  TEXT CHECK (report_type IN (
    'GHOST_PROJECT','ABANDONED','OVERPRICED','WRONG_LOCATION','OTHER'
  )),
  description  TEXT NOT NULL,
  reporter_lga TEXT,
  evidence_url TEXT,
  reviewed     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Contractors & Blacklist Tables
CREATE TABLE IF NOT EXISTS contractors (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name    TEXT NOT NULL UNIQUE,
  rc_number       TEXT UNIQUE,
  blacklisted     BOOLEAN DEFAULT FALSE,
  blacklist_reason TEXT,
  blacklist_date  DATE,
  total_contracts INTEGER DEFAULT 0,
  avg_completion  DECIMAL(5,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Link projects to contractors
ALTER TABLE projects
ADD COLUMN contractor_id UUID REFERENCES contractors(id);

-- Auto-increment citizen flags on new report
CREATE OR REPLACE FUNCTION increment_flags_on_report()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET citizen_flags = citizen_flags + 1
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_citizen_flags
AFTER INSERT ON citizen_reports
FOR EACH ROW EXECUTE FUNCTION increment_flags_on_report();

-- Enable RLS on all tables
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors      ENABLE ROW LEVEL SECURITY;

-- PUBLIC: anyone can READ projects (no login needed)
CREATE POLICY public_read_projects ON projects
  FOR SELECT USING (true);

-- PUBLIC: anyone can INSERT citizen reports
CREATE POLICY public_insert_reports ON citizen_reports
  FOR INSERT WITH CHECK (true);

-- PUBLIC: anyone can READ contractors
CREATE POLICY public_read_contractors ON contractors
  FOR SELECT USING (true);

-- STAFF ONLY: update/insert projects (requires auth role)
CREATE POLICY staff_write_projects ON projects
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
