import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VocabInfo from '../components/VocabInfo/VocabInfo';

const vocab = '你好';

describe('VocabInfo', () => {
    test('displays vocab info box', () => {
        const { container } = render(
            <VocabInfo vocab={vocab} onClose={vi.fn()} />
        );

        expect(container.querySelector('.vocab-info-box')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: vocab })).toBeInTheDocument();
        expect(screen.getByText('nǐ hǎo')).toBeInTheDocument();
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
    })

    test('displays link to external dictionary', () => {
        render(<VocabInfo vocab={vocab} onClose={vi.fn()} />);

        const dictionaryLink = screen.getByRole('link', {
            name: "Link to external Chinese Dictionary site 'Written Chinese",
        });
        expect(dictionaryLink).toHaveAttribute(
            'href',
            "https://dictionary.writtenchinese.com//#sk=你好&svt=pinyin"
        );
        expect(dictionaryLink).toHaveAttribute('target', '_blank');
    })

    test('clicking on close button removes component', async () => {
        const user = userEvent.setup();

        function TestVocabInfo() {
            const [isVisible, setIsVisible] = useState(true);

            return isVisible ? (
                <VocabInfo vocab={vocab} onClose={() => setIsVisible(false)} />
            ) : null;
        }

        render(<TestVocabInfo />);

        await user.click(screen.getByRole('button', { name: 'close' }));

        expect(screen.queryByRole('heading', { name: vocab })).not.toBeInTheDocument();
    })

    test('displays add to deck button', () => {
        render(<VocabInfo vocab={vocab} onClose={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Add To Deck' })).toBeInTheDocument();
    })

    test('user can click and add card to deck, changing button text', async () => {
        const user = userEvent.setup();
        render(<VocabInfo vocab={vocab} onClose={vi.fn()} />);

        const addToDeckButton = screen.getByRole('button', { name: 'Add To Deck' });
        expect(addToDeckButton).toBeEnabled();
        await user.click(addToDeckButton);
        expect(addToDeckButton).toHaveTextContent('Word added to deck');
    })

    test('resets the add button when the vocab changes', async () => {
        const user = userEvent.setup();

        function TestVocabInfo() {
            const [selectedVocab, setSelectedVocab] = useState(vocab);

            return (
                <>
                    <VocabInfo vocab={selectedVocab} onClose={vi.fn()} />
                    <button onClick={() => setSelectedVocab('谢谢')}>select another word</button>
                </>
            );
        }

        render(<TestVocabInfo />);

        await user.click(screen.getByRole('button', { name: 'Add To Deck' }));
        expect(screen.getByRole('button', { name: 'Word added to deck' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'select another word' }));

        expect(screen.getByRole('heading', { name: '谢谢' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add To Deck' })).toBeInTheDocument();
    })
})
