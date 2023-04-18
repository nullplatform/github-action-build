const Validate = require('./validate');

test('returns true because is "undefined"', () => {
  expect(Validate.isEmpty(undefined)).toBeTruthy();
});

test('returns true because is "null"', () => {
  expect(Validate.isEmpty(null)).toBeTruthy();
});

test('returns true because is empty', () => {
  expect(Validate.isEmpty('')).toBeTruthy();
});
