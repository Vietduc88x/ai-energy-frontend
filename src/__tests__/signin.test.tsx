import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockTrackOnce = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({ trackOnce: mockTrackOnce }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockPush.mockReset();
  mockReplace.mockReset();
  mockTrackOnce.mockReset();
  mockFetch.mockReset();
  mockSearchParams.delete('google_signup');
  mockSearchParams.delete('authError');
});

afterEach(() => {
  cleanup();
});

describe('SignInPage', () => {
  it('renders Google sign-in button', async () => {
    const SignInPage = (await import('@/app/auth/signin/page')).default;
    render(<SignInPage />);

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('sends Google sign-in fetch with correct callback URLs', async () => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://agent.techmadeeasy.info', href: '' },
      writable: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://accounts.google.com/o/oauth2/auth' }),
    });

    const SignInPage = (await import('@/app/auth/signin/page')).default;
    render(<SignInPage />);

    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/sign-in/social'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.provider).toBe('google');
    expect(callBody.callbackURL).toBe('https://agent.techmadeeasy.info/compare');
    expect(callBody.newUserCallbackURL).toContain('/auth/signin?google_signup=1');
    expect(callBody.errorCallbackURL).toContain('/auth/signin?authError=google');
  });

  it('tracks Google signup once and redirects when callback marker is present', async () => {
    mockSearchParams.set('google_signup', '1');

    const SignInPage = (await import('@/app/auth/signin/page')).default;
    render(<SignInPage />);

    await waitFor(() => {
      expect(mockTrackOnce).toHaveBeenCalledWith('signup_completed', { method: 'google' });
      expect(mockReplace).toHaveBeenCalledWith('/compare');
    });
  });
});
