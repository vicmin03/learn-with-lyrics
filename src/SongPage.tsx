import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import song_list from './song_list.json'

const API_URL = "https://wilooper-lyrica.hf.space/lyrics/"

// https://wilooper-lyrica.hf.space/lyrics/?artist=Crowd%20Lu&song=%E5%A4%AA%E9%99%BD%E8%88%87%E5%9C%B0%E7%90%83&timestamps=true

// function to add %20 in between spaces in song title/artist name for API calls to correct path
function formatName(name: string) {
    return name.split(' ').join('%20')
}


export default function SongPage() {
    const { song_id } = useParams<{song_id: string}>();

    const [songLyrics, setSongLyrics] = useState("");

    let song_info = song_list.find((song) => song.id.toString() == song_id)
    
    useEffect(() => {
        if (!song_info) return;

        const fetchLyrics = async() => {
            try {
                console.log(`${API_URL}?artist=${formatName(song_info.artist)}&song=${formatName(song_info.title)}`);
                const url = `${API_URL}?artist=${formatName(song_info.artist)}&song=${formatName(song_info.title)}`;
                const response = await fetch(url);

                if (!response.ok){
                     throw new Error(`HTTP error: ${response.status}`);
                }
                
                const json = await response.json();
                
                setSongLyrics(json.data.lyrics);
                console.log("API RESPONSE:", json.data.lyrics)
                
                
            } catch (error) {
                console.error("Failed to fetch lyrics", error)
            }
        };
        fetchLyrics();
    }, [])

    return (
        <>
            <h1> {song_info && song_info.title} </h1>
            {song_info && song_info.eng_title && <h1>({song_info.eng_title})</h1>}
            <h4> {song_info && song_info.artist} </h4>
            <p> Lyrics go here for song {song_id}</p>
            <p>{songLyrics}</p>
            
        </>     
    )
}