import { languageCodes } from "../../types/languageCodes";
import "./SongCard.css";

interface CardProps {
    title: string,
    eng_title?: string,
    artist: string,
    img: string,
    language: string
}

export function SongCard (props: CardProps) {
    const languageCode = languageCodes[props.language];

    return (
        <div className="song-card">
            <div className="song-cover">
                <img src={props.img} alt={props.title} />
            </div>
            <div className='song-info'>
                <h2 className="song-title" lang={languageCode}>{props.title}</h2>
                {props.eng_title && <p className="song-title" lang="en">({props.eng_title})</p>}
                <p>{props.artist}</p>
                <p>{props.language}</p>
            </div>
        </div>
    )
}