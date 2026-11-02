/**
 * ACCUTAX - Serverless Authentication Endpoint untuk Vercel
 * Berjalan aman di sisi server (Server-Side) sehingga kredensial admin TIDAK bocor ke browser client.
 *
 * Kredensial dibaca dari Environment Variable:
 * Vercel Dashboard -> Settings -> Environment Variables -> ADMIN_USERS_JSON
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

    const { username, password } = body || {};
    const userVal = (username || '').trim().toLowerCase();
    const passVal = (password || '').trim();

    if (!userVal || !passVal) {
      return res.status(400).json({ success: false, message: 'Username/Email dan Password wajib diisi.' });
    }

    // Ambil kredensial admin dari Vercel Environment Variables
    let adminList = [];
    if (process.env.ADMIN_USERS_JSON) {
      try {
        adminList = JSON.parse(process.env.ADMIN_USERS_JSON);
      } catch (e) {
        console.error('[ACCUTAX AUTH] Gagal parse ADMIN_USERS_JSON:', e.message);
      }
    }

    // Periksa apakah cocok dengan salah satu administrator
    const foundAdmin = adminList.find(
      a => (
        (a.username && a.username.toLowerCase() === userVal) ||
        (a.email && a.email.toLowerCase() === userVal)
      ) && a.password === passVal
    );

    if (foundAdmin) {
      return res.status(200).json({
        success: true,
        user: {
          name: foundAdmin.name || 'Administrator',
          role: foundAdmin.role || 'admin'
        }
      });
    }

    // Jika tidak ditemukan di daftar admin
    return res.status(401).json({
      success: false,
      message: 'Username/Email atau Password tidak cocok.'
    });

  } catch (error) {
    console.error('[ACCUTAX AUTH ERROR]:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kendala pada server autentikasi.' });
  }
};
