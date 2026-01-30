import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock analytics to avoid network calls
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

// Mock contact store to provide deterministic contacts and avoid store re-render loops
vi.mock('@/lib/agents/contacts/store', () => ({
  useContactStore: () => ({ contacts: [
    {
      id: 'c-1',
      firstName: 'Alice',
      lastName: 'A',
      emails: ['alice@example.com'],
      phones: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'c-2',
      firstName: 'Alicia',
      lastName: 'B',
      emails: ['alice@example.com'],
      phones: [],
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ] }),
}));

import AgentContacts from './contacts';

beforeEach(() => {
  localStorage.clear();
});

test('dedupe banner shows and dismiss persists', () => {
  render(
    <MemoryRouter>
      <AgentContacts />
    </MemoryRouter>
  );

  // Banner should appear
  expect(screen.getByText(/Sugerencias de duplicados/i)).toBeInTheDocument();

  // Dismiss
  fireEvent.click(screen.getByText('Omitir'));

  // Banner should be gone
  expect(screen.queryByText(/Sugerencias de duplicados/i)).not.toBeInTheDocument();

  // Persistence
  expect(localStorage.getItem('agenthub_dedupe_dismissed')).toBe('1');
});
