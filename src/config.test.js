const config = require('./config');

test('returns default url because BASE_URL env is "undefined"', () => {
  expect(config.baseUrl).toBe('https://ci.nullplatform.com');
});
