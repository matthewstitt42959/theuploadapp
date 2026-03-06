// src/components/__tests__/ComponentName.test.jsx
import { customRender as render, screen } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import TabsComponent from '../TabsComponent';

// What are we testing here?
//// 4 tabs - Home, Query Params, Headers, Notes
//// Each tab has its own component
//// Test each component in isolation
//// Test tab switching
//// Test Active tab fuctionality

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value + ''; }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TabsComponent', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

  it('renders all tab labels', () => {
    expect(screen.getByRole('tab', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByText(/HOME/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByText(/HOME/i)).toBeInTheDocument();
  });


});
