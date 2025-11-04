// scripts/fetch_ftu_tkb.js
// Usage:
//   FTU_API_URL, FTU_API_BEARER (secret) must be set in env
//   node scripts/fetch_ftu_tkb.js
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

(async () => {
  try {
    const apiUrl = process.env.FTU_API_URL;
    const bearer = process.env.FTU_API_BEARER;
    if (!apiUrl) throw new Error('Set FTU_API_URL env var');
    if (!bearer) throw new Error('Set FTU_API_BEARER env var');

    const payload = process.env.FTU_PAYLOAD
      ? JSON.parse(process.env.FTU_PAYLOAD)
      : { filter: { hoc_ky: 20251, ten_hoc_ky: "" }, additional: { paging: { limit: 100, page: 1 }, ordering: [ { name: null, order_type: null } ] } };

    const tokenHeader = bearer.startsWith('Bearer ') ? bearer : `Bearer ${bearer}`;

    console.log('Fetching', apiUrl);
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': tokenHeader,
        'Referer': process.env.FTU_REFERER || 'https://ftugate.ftu.edu.vn/vhvl/tructuyen/'
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text().catch(()=>'<no body>');
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }

    const data = await res.json();

    const out = { fetched_at: new Date().toISOString(), payload_used: payload, response: data };
    const outDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'schedule.json');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log('Wrote', outPath);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
