import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar/NavBar';
import Home from './Home';
import NotFound from './NotFound';
import SongPage from './components/SongPage/SongPage';
import { SettingsProvider } from './contexts/SettingsProvider';
import { AuthProvider } from './auth/AuthProvider';
import { AddSong } from './components/AddSong/AddSong';
import { AdminRoute } from './auth/AdminRoute';

// Routes 
//     / = home page
//     /songs/:id = individual song lyrics page
//     /invalid = redirects to 404 not found page

function App() {

  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/songs/:song_id" element={<SongPage />}/>       
              <Route path="*" element={<NotFound />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin/add_song" element={<AddSong />}/>
              </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App;
