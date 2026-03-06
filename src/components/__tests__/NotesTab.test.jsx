import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import NotesTab from '../NotesTab';


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

describe('NotesTab', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        localStorageMock.clear();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('renders textarea and buttons', () => {
        render(<NotesTab />);
        expect(screen.getByPlaceholderText(/quick notes/i)).toBeInTheDocument();
        expect(screen.getByText(/download/i)).toBeInTheDocument();
        expect(screen.getByText(/clear/i)).toBeInTheDocument();
    });

    it('loads initial value from localStorage', () => {
        localStorageMock.getItem.mockReturnValueOnce('hello world');
        render(<NotesTab />);
        expect(screen.getByDisplayValue('hello world')).toBeInTheDocument();
    });

    it('saves to localStorage when text changes (debounced)', () => {
        render(<NotesTab />);
        const textarea = screen.getByPlaceholderText(/quick notes/i);
        fireEvent.change(textarea, { target: { value: 'abc' } });
        expect(screen.getByText('Saving…')).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(400));
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'perry-parcelrunner:notes',
            'abc'
        );
        expect(screen.getByText('Saved')).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(1200));
        expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    });

    it('does not save if value is unchanged', () => {
        localStorageMock.getItem.mockReturnValueOnce('unchanged');
        render(<NotesTab />);
        const textarea = screen.getByDisplayValue('unchanged');
        fireEvent.change(textarea, { target: { value: 'unchanged' } });
        act(() => jest.advanceTimersByTime(400));
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('clears notes and localStorage on Clear button', () => {
        localStorageMock.getItem.mockReturnValueOnce('to be cleared');
        render(<NotesTab />);
        const clearBtn = screen.getByRole('button', { name: /clear/i });
        fireEvent.click(clearBtn);

        expect(screen.getByDisplayValue('')).toBeInTheDocument();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('perry-parcelrunner:notes');
    });

    it('downloads notes as a file when Download is clicked', () => {
        render(<NotesTab />);
        const textarea = screen.getByPlaceholderText(/quick notes/i);
        fireEvent.change(textarea, { target: { value: 'download me' } });

        // Mock createElement and click
        const clickMock = jest.fn();
        const createElementSpy = jest
            .spyOn(document, 'createElement')
            .mockReturnValue({
                set href(_) { },
                set download(_) { },
                click: clickMock,
            });

        const createObjectURLSpy = jest
            .spyOn(URL, 'createObjectURL')
            .mockReturnValue('blob:url');
        const revokeObjectURLSpy = jest
            .spyOn(URL, 'revokeObjectURL')
            .mockImplementation(() => { });

        // Only select the button, not textarea text
        const downloadBtn = screen.getByRole('button', { name: /download/i });
        fireEvent.click(downloadBtn);

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(clickMock).toHaveBeenCalled();
        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();

        createElementSpy.mockRestore();
        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
    });

});

// We recommend installing an extension to run jest tests.it