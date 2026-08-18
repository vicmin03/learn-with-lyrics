import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/navbar';
import Home from './Home';
import NotFound from './NotFound';
import SongPage from './SongPage';

function App() {

  return (
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
  )
}

export default App;
