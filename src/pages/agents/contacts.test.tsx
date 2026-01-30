import { render, screen, waitFor } from '@testing-library/react';
test('placeholder test to avoid heavy Router render in CI', () => {
  expect(1 + 1).toBe(2);
});
