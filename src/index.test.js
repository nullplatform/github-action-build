const process = require('process');
const cp = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
// shows how the runner will run a javascript action with env / stdout protocol
test('test fails for invalid access token', () => {
  process.env['INPUT_ACCESS-TOKEN'] = '123456';
  const ip = path.join(__dirname, 'index.js');
  expect(() => cp.execSync(`node ${ip}`, { env: process.env })).toThrowError(
    /Command failed/,
  );
});

test('test fails for missing access token', () => {
  const ip = path.join(__dirname, 'index.js');
  expect(() => cp.execSync(`node ${ip}`, { env: process.env })).toThrowError(
    /Command failed/,
  );
});
