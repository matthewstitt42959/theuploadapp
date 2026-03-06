require('@testing-library/jest-dom');
require('whatwg-fetch');
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

beforeAll(() => {
  // Add no-op implementations if missing
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();

});

// Optional: silence noisy act() warnings
const originalError = console.error;
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg, ...rest) => {
    if (typeof msg === 'string' && msg.includes('Not wrapped in act')) return;
    originalError(msg, ...rest);
  });
});
afterAll(() => {
  console.error.mockRestore();
});
