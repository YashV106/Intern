const endpoints = [
  { name: 'GET /api/users/me', url: 'https://internarea-a04s.onrender.com/api/users/me' },
  { name: 'GET /api/profile', url: 'https://internarea-a04s.onrender.com/api/profile' },
  { name: 'GET /api/user/profile', url: 'https://internarea-a04s.onrender.com/api/user/profile' },
];

async function fetchJsonText(url) {
  const res = await fetch(url, { method: 'GET' });
  const contentType = res.headers.get('content-type') || '';
  let body;
  if (contentType.includes('application/json')) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  } else {
    body = await res.text();
    if (body.length > 500) body = body.slice(0, 500) + '...';
  }
  return { status: res.status, contentType, body };
}

(async () => {
  console.log('--- Endpoint test (localhost:5000) ---');
  for (const ep of endpoints) {
    try {
      const out = await fetchJsonText(ep.url);
      console.log(`\n[${ep.name}] -> HTTP ${out.status}`);
      console.log(`content-type: ${out.contentType}`);
      if (typeof out.body === 'string') console.log(out.body);
      else console.log(JSON.stringify(out.body, null, 2));
    } catch (err) {
      console.log(`\n[${ep.name}] -> ERROR`);
      console.log(err && err.stack ? err.stack : String(err));
    }
  }
})();
