// pages/api/rsvp.js
const rsvps = global._rsvps || [];
global._rsvps = rsvps;

export default function handler(req, res) {

  // ── POST: new RSVP submission ──
  if (req.method === 'POST') {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: 'Name and email are required.' });

    const normalName  = name.trim().toLowerCase();
    const normalEmail = email.trim().toLowerCase();

    const dupEmail = rsvps.find(r => r.email.toLowerCase() === normalEmail);
    if (dupEmail)
      return res.status(409).json({
        duplicate: true, field: 'email',
        message: `This email has already been registered under "${dupEmail.name}".`,
      });

    const dupName = rsvps.find(r => r.name.trim().toLowerCase() === normalName);
    if (dupName)
      return res.status(409).json({
        duplicate: true, field: 'name',
        message: `"${dupName.name}" has already confirmed their attendance.`,
      });

    const entry = {
      id:          Date.now().toString(),
      name:        name.trim(),
      email:       normalEmail,
      status:      'pending',   // pending | confirmed | declined
      archived:    false,
      submittedAt: new Date().toISOString(),
    };
    rsvps.push(entry);
    return res.status(200).json({ success: true, entry });
  }

  // ── GET: fetch all RSVPs ──
  if (req.method === 'GET') {
    const active   = rsvps.filter(r => !r.archived);
    const archived = rsvps.filter(r => r.archived);
    return res.status(200).json({
      rsvps:     active,
      archived,
      total:     active.length,
      confirmed: active.filter(r => r.status === 'confirmed').length,
      declined:  active.filter(r => r.status === 'declined').length,
      pending:   active.filter(r => r.status === 'pending').length,
    });
  }

  // ── PATCH: update status (confirm / decline) ──
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    const entry = rsvps.find(r => r.id === id);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    if (!['confirmed', 'declined', 'pending'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    entry.status = status;
    return res.status(200).json({ success: true, entry });
  }

  // ── DELETE: archive an entry ──
  if (req.method === 'DELETE') {
    const { id } = req.body;
    const entry = rsvps.find(r => r.id === id);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    entry.archived = true;
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
