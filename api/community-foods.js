export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: 'Community foods not configured' });
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  if (req.method === 'GET') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/community_foods?approved=eq.true&order=created_at.desc`,
      { headers }
    );
    const data = await r.json();
    return res.status(r.status).json(data);
  }

  if (req.method === 'POST') {
    const { name, brand, category, cal, protein, carbs, fat, fiber, submitted_by } = req.body;
    if (!name || !category || cal == null || protein == null || carbs == null || fat == null) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const r = await fetch(`${SUPABASE_URL}/rest/v1/community_foods`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name, brand: brand||'', category, cal: +cal, protein: +protein, carbs: +carbs, fat: +fat, fiber: +(fiber||0), submitted_by: submitted_by||'Anónimo' }),
    });
    const data = await r.json();
    return res.status(r.ok ? 201 : r.status).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
