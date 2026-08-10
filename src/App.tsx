import { useState, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import { Navbar } from './components/navbar'
import { SongCard } from './components/SongCard'
import { SearchBar } from './components/SearchBar'
import song_list from './song_list.json'

function App() {
  const [count, setCount] = useState(0)
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("")

  // useEffect(() => {
  //   console.log(searchText)
  // }, [searchText])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500)
    return () => clearTimeout(timer);
  }, [searchText])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }

  const valid_songs = song_list.filter((song) => 
    song.title.toLowerCase().includes(debouncedSearchText.toLowerCase()) || song.eng_title.toLowerCase().includes(debouncedSearchText.toLowerCase()))
  

  return (
    <>
      <Navbar />
      <SearchBar searchText={searchText} handleSearch={handleSearch}/>
      <section id="center">
        <div className="songs-list">
          {valid_songs.map((song) => (
            <SongCard
              key={song.title}
              title={song.title}
              eng_title={song.eng_title}
              artist={song.artist}
              img={song.img}
              language={song.language}
            >
            </SongCard>
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

export default App
