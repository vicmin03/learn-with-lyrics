import { useState, useEffect } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'
import { SongCard } from './components/SongCard'
import { SearchBar } from './components/SearchBar'
import song_list from './song_list.json'
import { Link } from 'react-router-dom'

function Home() {
  const [count, setCount] = useState(0)

  // control state of search bar and debouncing text
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("")

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
  const valid_songs = song_list.filter((song) => 
    song.title.toLowerCase().includes(debouncedSearchText.toLowerCase()) || song.eng_title.toLowerCase().includes(debouncedSearchText.toLowerCase()))


  return (
    <>
      <Navbar />
      <SearchBar searchText={searchText} handleSearch={handleSearch}/>
      <section id="center">
        <div className="songs-list">
          {valid_songs.map((song) => (
            <Link to={`/songs/${song.id}`} className="card-link" key={song.id}>
                <SongCard
                title={song.title}
                eng_title={song.eng_title}
                artist={song.artist}
                img={song.img}
                language={song.language}
                />
            </Link>

          ))}
        </div>

        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

    </>
  )
}

export default Home
