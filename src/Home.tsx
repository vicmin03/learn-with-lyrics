import './App.css';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SongCard from './components/SongCard';
import SearchBar from './components/SearchBar';
import song_list from './song_list.json';


function Home() {
  // control state of search bar and debouncing text
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("")

  // add debounce of 5ms so only filters song after user stops typing 
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300)
    return () => clearTimeout(timer);
  }, [searchText])

  // handler for user input to search bar; passed down as prop into SearchBar component
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }

  // filter songs based on user input to search bar
  const valid_songs = useMemo(() => {
    return song_list.filter((song) => 
    song.title.toLowerCase().includes(debouncedSearchText.toLowerCase()) || song.eng_title.toLowerCase().includes(debouncedSearchText.toLowerCase()) || song.artist.toLowerCase().includes(debouncedSearchText.toLowerCase()))
  }, [debouncedSearchText]);


  return (
    <main>
      <h1>Browse songs</h1>
      <SearchBar searchText={searchText} handleSearch={handleSearch}/>
      <section id="center">
        <h2 className="visually-hidden">Song results</h2>
        <p className="results-status" aria-live="polite" aria-atomic="true">
          {valid_songs.length === 0
            ? 'No songs found.'
            : `${valid_songs.length} ${valid_songs.length === 1 ? 'song' : 'songs'} found.`}
        </p>
        {valid_songs.length === 0 ? (
          <p role="status">Try searching for a different song title.</p>
        ) : (
          <ul className="songs-list">
            {valid_songs.map((song) => (
              <li key={song.id}>
                <Link to={`/songs/${song.id}`} className="card-link">
                <SongCard
                title={song.title}
                eng_title={song.eng_title}
                artist={song.artist}
                img={song.img}
                language={song.language}
                />
                </Link>
              </li>

            ))}
          </ul>
        )}

      </section>

    </main>
  )
}

export default Home
