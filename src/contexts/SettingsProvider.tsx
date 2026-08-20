import { useState, type ReactNode } from 'react';
import { SettingsContext } from './SettingsContext';

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    // control default settings of simplified/traditional text and pinyin toggles in context
    const [showPronunciation, setShowPronunciation] = useState(false);
    const [simplifiedCharacters, setSimplifiedCharacters] = useState(true);

    return (
        <SettingsContext.Provider value={{
            showPronunciation, 
            setShowPronunciation, 
            simplifiedCharacters, 
            setSimplifiedCharacters}}
        >
            {children}
        </SettingsContext.Provider>
    )
}

