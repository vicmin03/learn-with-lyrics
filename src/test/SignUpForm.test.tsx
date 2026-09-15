import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from '../components/Forms/SignUpForm';

const { signUp } = vi.hoisted(() => ({
	signUp: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock('../lib/supabaseClient', () => ({
	supabase: {
		auth: { signUp },
	},
}));

describe('SignUpForm', () => {
	const renderForm = () =>
		render(<SignUpForm open={true} setOpen={vi.fn()} />);

	afterEach(() => {
		vi.clearAllMocks();
	});

	test('renders all sign-up fields and the submit button', () => {
		renderForm();

		expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter your email address')).toHaveAttribute('type', 'text');
		expect(screen.getByPlaceholderText('Confirm your email address')).toHaveAttribute('type', 'text');
		expect(screen.getByPlaceholderText('Enter your password')).toHaveAttribute('type', 'password');
		expect(screen.getByPlaceholderText('Confirm your password')).toHaveAttribute('type', 'password');
		expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
	});

	test('shows validation errors for an invalid email and short password', async () => {
		const user = userEvent.setup();
		renderForm();

		await user.type(screen.getByPlaceholderText('Enter your email address'), 'not-an-email');
		await user.type(screen.getByPlaceholderText('Confirm your email address'), 'different@example.com');
		await user.type(screen.getByPlaceholderText('Enter your password'), '12345');
		await user.type(screen.getByPlaceholderText('Confirm your password'), '54321');
		await user.click(screen.getByRole('button', { name: 'Sign Up' }));

		expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
		expect(await screen.findByText(/expected string to have >=6 characters/i)).toBeInTheDocument();
		expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
		expect(await screen.findByText('Emails do not match')).toBeInTheDocument();
	});

	test('shows a validation error when confirmation values do not match', async () => {
		const user = userEvent.setup();
		renderForm();

		await user.type(screen.getByPlaceholderText('Enter your email address'), 'learner@example.com');
		await user.type(screen.getByPlaceholderText('Confirm your email address'), 'learner@example.org');
		await user.type(screen.getByPlaceholderText('Enter your password'), 'correct-password');
		await user.type(screen.getByPlaceholderText('Confirm your password'), 'different-password');
		await user.click(screen.getByRole('button', { name: 'Sign Up' }));

		expect(await screen.findByText('Emails do not match')).toBeInTheDocument();
		expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
	});

	test('submits valid sign-up details', async () => {
		const user = userEvent.setup();
		const setOpen = vi.fn();
		render(<SignUpForm open={true} setOpen={setOpen} />);

		await user.type(screen.getByPlaceholderText('Enter your email address'), 'learner@example.com');
		await user.type(screen.getByPlaceholderText('Confirm your email address'), 'learner@example.com');
		await user.type(screen.getByPlaceholderText('Enter your password'), 'correct-password');
		await user.type(screen.getByPlaceholderText('Confirm your password'), 'correct-password');
		await user.click(screen.getByRole('button', { name: 'Sign Up' }));

		expect(signUp).toHaveBeenCalledWith({
			email: 'learner@example.com',
			password: 'correct-password',
		});
		expect(setOpen).toHaveBeenCalledWith(false);
	});
});

