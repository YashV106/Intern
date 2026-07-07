try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const p = require.resolve('react');
  console.log('react resolved to:', p);
} catch (e) {
  console.error('Failed to resolve react:', e && e.message ? e.message : e);
  process.exit(1);
}
