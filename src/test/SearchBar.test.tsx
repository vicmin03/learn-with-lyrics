import { useState } from "react";
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';

// helper function to render example of search bar with state
function TestSearchBar() {
    const [searchText, setSearchText] = useState('');

    return (
        <SearchBar
            searchText={searchText}
            handleSearch={(event: React.ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value)}
        />
    );
}

describe('SearchBar', () => {
    test('displays search bar', () => {
        render(<TestSearchBar />);

        const searchBar = screen.getByLabelText('search-bar')
        expect(searchBar).toBeInTheDocument();
    })

    test('displays search icon at beginning of search bar', () => {
        render(<TestSearchBar />);

        const searchIcon = screen.getByLabelText('search-icon');
        expect(searchIcon).toBeInTheDocument();
    })

    test('user can type text into search bar', async () => {
        const user = userEvent.setup();

        render(<TestSearchBar />)

        const searchBar = screen.getByLabelText('search-bar')

        await user.type(searchBar, 'example');

        expect(searchBar).toHaveValue('example')
    })

    test('search bar displays search hint text', () => {
        render(<TestSearchBar />);

        const searchBar = screen.getByPlaceholderText('Search for a song or artist...')
        expect(searchBar).toBeInTheDocument();
        
    })
});
