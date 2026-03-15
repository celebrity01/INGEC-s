import { supabase } from '../lib/supabase.js';

export async function submitCitizenReport(req, res) {
  try {
    const { projectId, type, description, lga } = req.body;

    const { data, error } = await supabase
      .from('citizen_reports')
      .insert({
        project_id: projectId,
        report_type: type, // e.g. 'ABANDONED'
        description: description,
        reporter_lga: lga,
      });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
}
