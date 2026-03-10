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

  it('submits the Google social sign-in form with callback URLs', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const submitSpy = vi.fn();

    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'form') {
        Object.defineProperty(element, 'submit', { value: submitSpy });
      }
      return element;
    }) as typeof document.createElement);

    Object.defineProperty(window, 'location', {
      value: { origin: 'https://agent.techmadeeasy.info' },
      writable: true,
    });

    const SignInPage = (await import('@/app/auth/signin/page')).default;
    render(<SignInPage />);

    fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));

    expect(submitSpy).toHaveBeenCalled();

    const form = document.body.lastElementChild as HTMLFormElement;
    expect(form.action).toContain('/api/auth/sign-in/social');
    expect(form.method.toLowerCase()).toBe('post');

    const inputs = Array.from(form.querySelectorAll('input')).reduce<Record<string, string>>((acc, input) => {
      acc[(input as HTMLInputElement).name] = (input as HTMLInputElement).value;
      return acc;
    }, {});

    expect(inputs.provider).toBe('google');
    expect(inputs.callbackURL).toBe('https://agent.techmadeeasy.info/compare');
    expect(inputs.newUserCallbackURL).toBe('https://agent.techmadeeasy.info/auth/signin?google_signup=1');
    expect(inputs.errorCallbackURL).toBe('https://agent.techmadeeasy.info/auth/signin?authError=google');
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
