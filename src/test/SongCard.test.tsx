import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SongCard from '../components/SongCard';

// helper function to create SongCard component with props for testing
function TestSongCard() {
    return (
        <SongCard
                title="example song"
                eng_title="example"
                artist="example artist"
                img="example/path"
                language="English"
                />
    )
}
            

describe('SongCard', () => {

    test('display song title', () => {
        render(<TestSongCard />)
        const title = screen.getByText('example song')
        expect(title).toBeInTheDocument();

    })

    test('display song artist', () => {
        render(<TestSongCard />)
        const artist = screen.getByText('example artist')
        expect(artist).toBeInTheDocument();

    }) 

    test('display song english name if it exists', () => {
        render(<TestSongCard />)
        const eng = screen.getByText('(example)')
        expect(eng).toBeInTheDocument();

    }) 

    test('display image', () => {
        render(<TestSongCard />);
        const img = screen.getByRole('img', { name: /example song/i })
        expect(img).toHaveAttribute('src', 'example/path')

    })

    test('display song language', () => {
        render(<TestSongCard />)
        const lang = screen.getByText('English')
        expect(lang).toBeInTheDocument();

    }) 
    
    test('does not display english name when not provided', () => {
        render(
            <SongCard
                title="no eng"
                artist="artist"
                img="path"
                language="Chinese"
            />
        )

        const maybeEng = screen.queryByText(/\(.+\)/)
        expect(maybeEng).toBeNull()
    })
    
});
