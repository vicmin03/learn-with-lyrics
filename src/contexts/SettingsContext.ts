import { createContext } from 'react';

interface SettingsContextType {
  showPronunciation: boolean;
  setShowPronunciation: React.Dispatch<React.SetStateAction<boolean>>;
  simplifiedCharacters: boolean;
  setSimplifiedCharacters: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
