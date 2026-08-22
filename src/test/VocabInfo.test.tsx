import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VocabInfo from '../components/VocabInfo/VocabInfo';

describe('VocabInfo', () => {
    test('displays vocab info box', () => {
        const vocabBox = screen.getByRole('combobox')

        // get vocab word
        // get vocab definition
        // get HSK level if available
    })

    test('displays link to external dictionary', () => {
        
    })

    test('displays add to deck button', () => {
        // displays add to deck button

    })

    test('user can click and add card to deck, changing button text', () => {

    })
})
