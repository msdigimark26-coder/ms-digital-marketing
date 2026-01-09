import { supabaseAdmin } from '../../src/lib/supabaseServerClient';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ limit: 1 });
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.status(200).json({ ok: true, users: data.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}