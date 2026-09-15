import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogInForm } from '../components/Forms/LogInForm';

describe('LogInForm', () => {
	const renderForm = () =>
		render(<LogInForm open={true} setOpen={vi.fn()} />);

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('renders the login fields and submit button', () => {
		renderForm();

		expect(screen.getByRole('heading', { name: 'Log In' })).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter your email address')).toHaveAttribute('type', 'text');
		expect(screen.getByPlaceholderText('Enter your password')).toHaveAttribute('type', 'password');
		expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
	});

	test('closes the dialog when the close callback is triggered', async () => {
		const user = userEvent.setup();
		const setOpen = vi.fn();
		render(<LogInForm open={true} setOpen={setOpen} />);

		await user.keyboard('{Escape}');

		expect(setOpen).toHaveBeenCalledWith(false);
	});

	test('shows validation errors for an invalid email and short password', async () => {
		const user = userEvent.setup();
		renderForm();

		await user.type(screen.getByPlaceholderText('Enter your email address'), 'not-an-email');
		await user.type(screen.getByPlaceholderText('Enter your password'), '12345');
		await user.click(screen.getByRole('button', { name: 'Log In' }));

		expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
		expect(await screen.findByText(/expected string to have >=6 characters/i)).toBeInTheDocument();
	});

	test('submits valid login credentials', async () => {
		const user = userEvent.setup();
		const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
		renderForm();

		await user.type(screen.getByPlaceholderText('Enter your email address'), 'learner@example.com');
		await user.type(screen.getByPlaceholderText('Enter your password'), 'correct-password');
		await user.click(screen.getByRole('button', { name: 'Log In' }));

		expect(consoleLog).toHaveBeenCalledWith({
			email: 'learner@example.com',
			password: 'correct-password',
		});
	});
});