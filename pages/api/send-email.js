// pages/api/send-email.js
// Nodemailer — sends via YOUR Gmail to the guest's email
// Credentials come from environment variables (never hardcoded)

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { guestName, guestEmail } = req.body;

  if (!guestName || !guestEmail) {
    return res.status(400).json({ error: 'Missing guest name or email' });
  }

  // Event details from env
  const babyName  = process.env.EVENT_BABY_NAME  || 'Saiah Alisbo';
  const eventDay  = process.env.EVENT_DAY        || 'Sunday';
  const eventDate = process.env.EVENT_DATE        || 'April 19';
  const eventTime = process.env.EVENT_TIME        || '10 AM';
  const location  = process.env.EVENT_LOCATION   || 'Bagong Parañaque Phase III, Open Court';
  const dresscode = process.env.EVENT_DRESS_CODE || 'Nude Browns & Pastels';

  // Gmail credentials from env
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.warn('GMAIL_USER or GMAIL_PASS not set — skipping email');
    return res.status(200).json({ success: true, skipped: true });
  }

  // Create Nodemailer transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass, // App Password from Google (16 chars)
    },
  });

  // Beautiful HTML email template
  const htmlTemplate = (toName, message, isHost = false) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:32px auto;background:#fdfaf7;border-radius:20px;overflow:hidden;border:1px solid #e0d0c0;box-shadow:0 8px 40px rgba(154,130,112,0.12);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#f0e8e0,#e8d8cc);padding:40px;text-align:center;border-bottom:1px solid #e0d0c0;">
      <p style="font-size:12px;color:#a89080;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">
        ${isHost ? '🌸 New RSVP Received' : '🌸 You\'re Confirmed!'}
      </p>
      <h1 style="font-size:38px;color:#4a3428;margin:0;font-weight:400;">${babyName}</h1>
      <p style="font-size:15px;color:#7a6258;margin:8px 0 0;font-style:italic;">Baptism Celebration</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <p style="font-size:16px;color:#4a3428;margin:0 0 8px;">
        Dear <strong>${toName}</strong>, 🌷
      </p>
      <p style="font-size:15px;color:#7a6258;margin:0 0 28px;line-height:1.7;">
        ${message}
      </p>

      <!-- Event details box -->
      <div style="background:#f5f0ea;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #e0d0c0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:7px 0;color:#a89080;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:90px;">📅 Date</td>
            <td style="padding:7px 0;color:#4a3428;font-weight:600;font-size:15px;">${eventDay}, ${eventDate}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#a89080;font-size:11px;letter-spacing:2px;text-transform:uppercase;">⏰ Time</td>
            <td style="padding:7px 0;color:#4a3428;font-weight:600;font-size:15px;">${eventTime}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#a89080;font-size:11px;letter-spacing:2px;text-transform:uppercase;">📍 Venue</td>
            <td style="padding:7px 0;color:#4a3428;font-weight:600;font-size:15px;">${location}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#a89080;font-size:11px;letter-spacing:2px;text-transform:uppercase;">👗 Attire</td>
            <td style="padding:7px 0;color:#9e5a5a;font-weight:600;font-size:15px;">${dresscode}</td>
          </tr>
          ${isHost ? `
          <tr>
            <td style="padding:7px 0;color:#a89080;font-size:11px;letter-spacing:2px;text-transform:uppercase;">✉ Guest</td>
            <td style="padding:7px 0;color:#4a3428;font-weight:600;font-size:15px;">${guestName} — ${guestEmail}</td>
          </tr>` : ''}
        </table>
      </div>

      <p style="font-size:14px;color:#7a6258;margin:0;font-style:italic;text-align:center;line-height:1.7;">
        ${isHost
          ? `You now have a new confirmed guest. Check your admin panel for the full list.`
          : `We are so happy you\'ll be joining us!<br/>See you on ${eventDay}, ${eventDate}! 💕`
        }
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f0e8e0;padding:18px 40px;text-align:center;border-top:1px solid #e0d0c0;">
      <p style="font-size:12px;color:#a89080;margin:0;">
        ${babyName}'s Baptism · ${eventDay}, ${eventDate}
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    // 1. Send to guest
    await transporter.sendMail({
      from:    `"${babyName}'s Baptism" <${gmailUser}>`,
      to:      guestEmail,
      subject: `🌸 You're confirmed! ${babyName}'s Baptism — ${eventDate}`,
      html:    htmlTemplate(
        guestName,
        `Your attendance has been confirmed! We cannot wait to celebrate with you.`,
        false
      ),
    });

    // 2. Send notification to host (you)
    await transporter.sendMail({
      from:    `"${babyName}'s Baptism" <${gmailUser}>`,
      to:      gmailUser,
      subject: `🌸 New RSVP: ${guestName} confirmed attendance`,
      html:    htmlTemplate(
        'Host',
        `<strong>${guestName}</strong> has just confirmed their attendance via the RSVP form.`,
        true
      ),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Nodemailer error:', err);
    return res.status(500).json({ error: 'Failed to send email', detail: err.message });
  }
}
