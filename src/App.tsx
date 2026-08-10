import { useState, useEffect } from 'react'
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

  // useEffect(() => {
  //   console.log(searchText)
  // }, [searchText])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
      setSearchText(e.target.value);
  }

  const valid_songs = song_list.filter((song) => 
    song.title.toLowerCase().includes(searchText.toLowerCase()) || song.eng_title.toLowerCase().includes(searchText.toLowerCase()))
  

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
