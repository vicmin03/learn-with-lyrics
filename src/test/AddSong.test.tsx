import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddSong } from '../components/AddSong/AddSong';

const { from, select } = vi.hoisted(() => ({
	from: vi.fn(),
	select: vi.fn(),
}));

vi.mock('../lib/supabaseClient', () => ({
	supabase: { from },
}));

describe('AddSong', () => {
	const artists = [
		{
			artist_id: 1,
			artist_name: 'Artist One',
			artist_eng_name: 'Artist One English',
		},
	];

	const renderForm = () => render(<AddSong />);

	afterEach(() => {
		vi.clearAllMocks();
	});

	test('renders every form field and loads artists from the mocked Supabase response', async () => {
		select.mockResolvedValue({ data: artists, error: null });
		from.mockReturnValue({ select });
		renderForm();

		expect(screen.getByRole('heading', { name: 'Add new song' })).toBeInTheDocument();
		expect(screen.getByText('Select an artist')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter artist name (in English)')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter song title (in original language)')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter song title (in English)')).toBeInTheDocument();
		expect(screen.getAllByRole('combobox')).toHaveLength(3);
		expect(screen.getByPlaceholderText('Enter name of album')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Select correct audio or enter YouTube video id')).toBeInTheDocument();
		expect(screen.getByText('Choose cover image')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Add New Song' })).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(screen.getAllByRole('combobox')[0]);
		await screen.findByText('Artist One');
		expect(from).toHaveBeenCalledWith('Artists');
		expect(select).toHaveBeenCalledWith('artist_id, artist_name, artist_eng_name');
	});

	test('shows validation errors for every required field when submitted empty', async () => {
		select.mockResolvedValue({ data: [], error: null });
		from.mockReturnValue({ select });
		const user = userEvent.setup();
		renderForm();

		await user.click(screen.getByRole('button', { name: 'Add New Song' }));

		expect(await screen.findAllByText(/expected string|Too small/)).toHaveLength(6);
	});

	test('validates the YouTube ID length', async () => {
		select.mockResolvedValue({ data: artists, error: null });
		from.mockReturnValue({ select });
		const user = userEvent.setup();
		renderForm();

		const youtubeInput = screen.getByPlaceholderText('Select correct audio or enter YouTube video id');
		await user.type(youtubeInput, 'too-short');
		await user.click(screen.getByRole('button', { name: 'Add New Song' }));

		const youtubeField = youtubeInput.closest('.form-input-line');
		expect(youtubeField).not.toBeNull();
		expect(await within(youtubeField as HTMLElement).findByText(/Too small/)).toBeInTheDocument();
	});

	test('accepts a supported script option', async () => {
		select.mockResolvedValue({ data: artists, error: null });
		from.mockImplementation((table: string) => table === 'Artists'
			? { select }
			: { insert: vi.fn().mockResolvedValue({ error: null }) });
		const user = userEvent.setup();
		renderForm();

		await user.click(screen.getAllByRole('combobox')[0]);
		await user.click(await screen.findByText('Artist One'));
		await user.type(screen.getByPlaceholderText('Enter song title (in original language)'), 'Test song');
		await user.click(screen.getAllByRole('combobox')[1]);
		await user.click(screen.getByText('Chinese'));
		await user.click(screen.getAllByRole('combobox')[2]);
		await user.click(screen.getByText('Simplified'));
		await user.type(screen.getByPlaceholderText('Select correct audio or enter YouTube video id'), 'abcdefghijk');
		await user.click(screen.getByRole('button', { name: 'Add New Song' }));

		expect(await screen.findByText('Song added')).toBeInTheDocument();
		expect(screen.queryAllByText(/expected string|Too small/)).toHaveLength(0);
	});
});
