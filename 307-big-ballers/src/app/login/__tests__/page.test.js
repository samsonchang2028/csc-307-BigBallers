import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSignIn = jest.fn();
const mockSignUp = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args) => mockSignIn(...args),
      signUp: (...args) => mockSignUp(...args),
    },
  },
}));

beforeEach(() => jest.clearAllMocks());

describe('LoginPage', () => {
  test('renders login form by default', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  test('switches to signup mode', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.getByText('Create an account')).toBeInTheDocument();
  });

  test('switches back to login mode', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(screen.getByText('Log in to your account')).toBeInTheDocument();
  });

  test('updates email and password inputs', () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } });
    expect(screen.getByPlaceholderText('Email').value).toBe('test@test.com');
    expect(screen.getByPlaceholderText('Password').value).toBe('secret');
  });

  test('login success redirects to /', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginPage />);
    fireEvent.submit(screen.getByRole('button', { name: 'Log in' }).closest('form'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });

  test('login error shows message', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    render(<LoginPage />);
    fireEvent.submit(screen.getByRole('button', { name: 'Log in' }).closest('form'));
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
  });

  test('shows loading text while login is in flight', () => {
    mockSignIn.mockImplementation(() => new Promise(() => {}));
    render(<LoginPage />);
    fireEvent.submit(screen.getByRole('button', { name: 'Log in' }).closest('form'));
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });

  test('signup success shows confirmation message', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Sign up' }).closest('form'));
    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument());
  });

  test('signup already registered shows error', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Sign up' }).closest('form'));
    await waitFor(() => expect(screen.getByText('This email is already registered')).toBeInTheDocument());
  });

  test('signup with immediate session redirects', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: {} }, error: null });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Sign up' }).closest('form'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });

  test('signup error shows message', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: { message: 'Signup failed' } });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Sign up' }).closest('form'));
    await waitFor(() => expect(screen.getByText('Signup failed')).toBeInTheDocument());
  });

  test('shows loading text while signup is in flight', () => {
    mockSignUp.mockImplementation(() => new Promise(() => {}));
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Sign up' }).closest('form'));
    expect(screen.getByText('Signing up...')).toBeInTheDocument();
  });

  test('input focus and blur handlers fire without error', () => {
    render(<LoginPage />);
    const email = screen.getByPlaceholderText('Email');
    const password = screen.getByPlaceholderText('Password');
    fireEvent.focus(email);
    fireEvent.blur(email);
    fireEvent.focus(password);
    fireEvent.blur(password);
  });
});
