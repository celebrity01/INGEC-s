import { supabase } from '../lib/supabase.js';

export async function getProjects(req, res) {
  try {
    const { state, sector, status } = req.query;

    let query = supabase
      .from('projects')
      .select(`
        *, contractors(company_name, blacklisted)
      `)
      .order('created_at', { ascending: false });

    if (state) query = query.eq('state', state);
    if (sector) query = query.eq('sector', sector);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function searchProjects(req, res) {
    try {
        const { searchTerm } = req.query;
        if (!searchTerm) {
            return res.json([]);
        }

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .or(`project_name.ilike.%${searchTerm}%,lga.ilike.%${searchTerm}%,contractor.ilike.%${searchTerm}%`);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
    }
}
