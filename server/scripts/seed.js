import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // load from root
dotenv.config(); // fallback

const supabaseUrl = process.env.SUPABASE_URL || 'https://nfpjfgvqvzhlfggloglb.supabase.co';
// MUST use Service Role key to bypass RLS in a seed script!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error("Missing Supabase Service Key. RLS will block inserts if using public key.");
  console.error("Please ensure SUPABASE_SERVICE_KEY is set in your .env file before running seed.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleContractors = [
  { company_name: "Julius Berger Nigeria Plc", rc_number: "RC-4503", total_contracts: 12, avg_completion: 85.5 },
  { company_name: "Dantata & Sawoe Construction", rc_number: "RC-12944", total_contracts: 8, avg_completion: 92.0 },
  { company_name: "RCC (Reynolds Construction)", rc_number: "RC-8812", total_contracts: 5, avg_completion: 78.2 },
  { company_name: "Setraco Nigeria Limited", rc_number: "RC-55231", total_contracts: 9, avg_completion: 88.4 },
  { company_name: "Arab Contractors", rc_number: "RC-10022", total_contracts: 3, avg_completion: 60.0, blacklisted: true, blacklist_reason: "Chronic abandonment of water projects in the North East." }
];

const sampleProjects = [
  {
    project_name: "Rehabilitation of Kano-Maiduguri Road Section I",
    sector: "Infrastructure", mda: "Federal Ministry of Works", state: "Kano", lga: "Kano Municipal",
    administration: "Buhari", approved_budget: 45000000000, actual_spend: 38000000000, completion_pct: 85,
    status: "ACTIVE", start_date: "2018-04-15", target_date: "2024-12-31", latitude: 12.0022, longitude: 8.5920,
    blockchain_hash: "0x8f2a...c3b4", citizen_flags: 0
  },
  {
    project_name: "Construction of Primary Health Center, Bwari",
    sector: "Health", mda: "NPHCDA", state: "FCT - Abuja", lga: "Bwari",
    administration: "Tinubu", approved_budget: 250000000, actual_spend: 50000000, completion_pct: 20,
    status: "ACTIVE", start_date: "2023-11-01", target_date: "2024-06-30", latitude: 9.2833, longitude: 7.3833,
    blockchain_hash: "0x1a9b...f4e2", citizen_flags: 0
  },
  {
    project_name: "Mambilla Hydroelectric Power Project Site Prep",
    sector: "Energy", mda: "Ministry of Power", state: "Taraba", lga: "Sardauna",
    administration: "Jonathan", approved_budget: 120000000000, actual_spend: 8500000000, completion_pct: 5,
    status: "ABANDONED", start_date: "2014-02-10", target_date: "2020-12-31", latitude: 6.7000, longitude: 11.2500,
    blockchain_hash: "0x4c5d...e6f7", citizen_flags: 142
  },
  {
    project_name: "Zungeru Hydropower Plant Completion",
    sector: "Energy", mda: "Ministry of Power", state: "Niger", lga: "Wushishi",
    administration: "Buhari", approved_budget: 85000000000, actual_spend: 85000000000, completion_pct: 100,
    status: "COMPLETED", start_date: "2015-08-20", target_date: "2023-05-29", actual_end_date: "2023-05-15", latitude: 9.8167, longitude: 6.0500,
    blockchain_hash: "0x7d8e...a1b2", citizen_flags: 0
  },
  {
    project_name: "Provision of Solar Boreholes in Rural Enugu",
    sector: "Water", mda: "Federal Ministry of Water Resources", state: "Enugu", lga: "Udi",
    administration: "Tinubu", approved_budget: 150000000, actual_spend: 150000000, completion_pct: 45,
    status: "ABANDONED", start_date: "2023-08-10", target_date: "2024-02-10", latitude: 6.3167, longitude: 7.4167,
    blockchain_hash: "0x2e3f...c4d5", citizen_flags: 12
  },
  {
    project_name: "Lagos-Ibadan Expressway Section II Completion",
    sector: "Infrastructure", mda: "Federal Ministry of Works", state: "Ogun", lga: "Sagamu",
    administration: "Buhari", approved_budget: 90000000000, actual_spend: 88000000000, completion_pct: 98,
    status: "PROTECTED", start_date: "2016-01-15", target_date: "2024-05-30", latitude: 6.8333, longitude: 3.6500,
    blockchain_hash: "0x9f0a...b1c2", citizen_flags: 3
  },
  {
    project_name: "Federal University Gashua Library Complex",
    sector: "Education", mda: "TETFund", state: "Yobe", lga: "Bade",
    administration: "Buhari", approved_budget: 850000000, actual_spend: 600000000, completion_pct: 70,
    status: "ACTIVE", start_date: "2021-03-12", target_date: "2024-09-30", latitude: 12.8719, longitude: 11.0394,
    blockchain_hash: "0x5a6b...c7d8", citizen_flags: 0
  },
  {
    project_name: "Port Harcourt Refinery Rehabilitation Phase 1",
    sector: "Energy", mda: "NNPC", state: "Rivers", lga: "Eleme",
    administration: "Buhari", approved_budget: 150000000000, actual_spend: 120000000000, completion_pct: 80,
    status: "PROTECTED", start_date: "2021-05-01", target_date: "2024-12-31", latitude: 4.7936, longitude: 7.1122,
    blockchain_hash: "0x3b4c...d5e6", citizen_flags: 45
  },
  {
    project_name: "National Digital Innovation Hub",
    sector: "Digital", mda: "NITDA", state: "Lagos", lga: "Yaba",
    administration: "Tinubu", approved_budget: 2000000000, actual_spend: 500000000, completion_pct: 25,
    status: "ACTIVE", start_date: "2023-10-15", target_date: "2025-06-30", latitude: 6.5081, longitude: 3.3762,
    blockchain_hash: "0x8c9d...e0f1", citizen_flags: 0
  },
  {
    project_name: "Owerri Urban Water Scheme Upgrade",
    sector: "Water", mda: "Federal Ministry of Water Resources", state: "Imo", lga: "Owerri Municipal",
    administration: "Buhari", approved_budget: 3500000000, actual_spend: 3000000000, completion_pct: 65,
    status: "SUSPENDED", start_date: "2019-11-20", target_date: "2022-12-31", latitude: 5.4833, longitude: 7.0333,
    blockchain_hash: "0x1d2e...f3a4", citizen_flags: 88
  }
];

async function seed() {
  console.log("Starting INGEC database seeding...");

  console.log("Seeding contractors...");
  const { data: insertedContractors, error: cError } = await supabase
    .from('contractors')
    .upsert(sampleContractors, { onConflict: 'company_name' })
    .select();

  if (cError) {
    console.error("Error seeding contractors:", cError);
    return;
  }

  const projectsToInsert = sampleProjects.map((p, index) => {
     const assignedContractor = insertedContractors[index % insertedContractors.length];
     return {
        ...p,
        contractor: assignedContractor.company_name,
        contractor_id: assignedContractor.id
     };
  });

  console.log("Seeding projects...");
  const { error: pError } = await supabase
    .from('projects')
    .insert(projectsToInsert);

  if (pError) {
    console.error("Error seeding projects:", pError);
    return;
  }

  console.log(`Successfully seeded ${sampleContractors.length} contractors and ${sampleProjects.length} projects!`);
}

seed();
