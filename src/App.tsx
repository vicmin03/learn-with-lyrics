import { useState } from 'react'
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

  return (
    <>
      <Navbar />
      <SearchBar />
      <section id="center">
        <div className="songs-list">
          {song_list.map((song) => (
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
