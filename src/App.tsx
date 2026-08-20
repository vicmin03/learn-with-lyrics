import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/NavBar';
import Home from './Home';
import NotFound from './NotFound';
import SongPage from './SongPage';
import { SettingsProvider } from './contexts/SettingsProvider';

function App() {

  return (
    <SettingsProvider>
      <BrowserRouter>
        <Navbar />
        {/* Routes 
          / = home page
          /songs/:id = individual song lyrics page
          /invalid = redirects to 404 not found page
        */}
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/songs/:song_id" element={<SongPage />}/>       
            <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App;
