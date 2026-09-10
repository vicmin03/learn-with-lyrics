import './App.css';
import { useState, useEffect, useMemo } from 'react';
import { Link, useAsyncValue } from 'react-router-dom';
import { SongCard } from './components/SongCard/SongCard';
import { SearchBar } from './components/SearchBar';
import { supabase } from './lib/supabaseClient'
import { Song } from './types/song';
// import song_list from './song_list.json';


function Home() {
  // control state of search bar and debouncing text
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [songList, setSongList] = useState<Song[]>([]);


  // add debounce of 5ms so only filters song after user stops typing 
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 200)
    return () => clearTimeout(timer);
  }, [searchText])

  // handler for user input to search bar; passed down as prop into SearchBar component
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }

  // filter songs based on user input to search bar
  const filterSongs = useMemo(() => {
    return songList.filter((song) => 
      song.orig_title.toLowerCase().includes(debouncedSearchText.toLowerCase()) || song.eng_title.toLowerCase().includes(debouncedSearchText.toLowerCase()))
    // TODO: filter by artist name as well with SQL join? 
  }, [debouncedSearchText]);

  useEffect(() => {
      const fetchSongs = async() => {
        // fetch and filter songs according to search
        let query = supabase.from("songs_with_artists").select("*");


        if (debouncedSearchText.trim()) {
          const search = debouncedSearchText.trim();

          query = query.or(
            `orig_title.ilike.%${search}%,eng_title.ilike.%${search}%`
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error(error);
          return;
        }
        console.log(data);

        setSongList(data);
        console.log(data);
    }

    fetchSongs();
  }, [debouncedSearchText]);

  return (
    <main>
      <h1>Browse songs</h1>
      <SearchBar searchText={searchText} handleSearch={handleSearch}/>
      <section id="center">
        <h2 className="visually-hidden">Song results</h2>
        <p className="results-status" aria-live="polite" aria-atomic="true">
          {songList.length === 0
            ? 'No songs found.'
            : `${songList.length} ${songList.length === 1 ? 'song' : 'songs'} found.`}
        </p>
        {songList.length === 0 ? (
          <p role="status">Try searching for a different song title.</p>
        ) : (
          <ul className="songs-list">
            {songList.map((song) => (
              <li key={song.song_id}>
                <Link to={`/songs/${song.song_id}`} className="card-link">
                <SongCard
                  title={song.orig_title}
                  eng_title={song.eng_title}
                  artist={song.artist_eng_name}
                  img={song.cover_url}
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
