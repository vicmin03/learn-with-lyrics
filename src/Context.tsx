import { useState, createContext, useContext, type ReactNode } from 'react';

interface SettingsContextType {
  showPronunciation: boolean;
  setShowPronunciation: React.Dispatch<React.SetStateAction<boolean>>;
  simplifiedCharacters: boolean;
  setSimplifiedCharacters: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

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

export const useSettings = () => {
    const context = useContext(SettingsContext);

    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }

    return context;
};
