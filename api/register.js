/**
 * ACCUTAX - Serverless Registration Endpoint untuk Vercel
 * Menerima pendaftaran pengguna baru dan menyimpannya secara otomatis ke Google Spreadsheet Database.
 *
 * URL Webhook Google Spreadsheet dibaca dari Environment Variable:
 * Vercel Dashboard -> Settings -> Environment Variables -> GOOGLE_SHEETS_WEBHOOK_URL
 */

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { name, email, password } = body || {};
    const nameVal = (name || '').trim();
    const emailVal = (email || '').trim().toLowerCase();
    const passVal = (password || '').trim();

    if (!nameVal || !emailVal || !passVal) {
      return res.status(400).json({ success: false, message: 'Harap isi semua kolom dengan lengkap.' });
    }

    if (passVal.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    let sheetSaved = false;

    // Jika Webhook Google Spreadsheet terpasang di Vercel Environment Variables
    if (webhookUrl) {
      try {
        const sheetRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            name: nameVal,
            email: emailVal,
            password: passVal,
            role: 'user'
          })
        });

        if (sheetRes.ok) {
          sheetSaved = true;
        }
      } catch (sheetErr) {
        console.error('[ACCUTAX] Gagal mengirim data ke Google Sheets:', sheetErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: sheetSaved
        ? 'Pendaftaran berhasil dan tersimpan ke Database Spreadsheet!'
        : 'Pendaftaran berhasil!',
      sheetSaved
    });

  } catch (error) {
    console.error('[ACCUTAX REGISTER ERROR]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kendala pada server pendaftaran.' });
  }
};
