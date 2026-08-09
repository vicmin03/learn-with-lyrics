interface CardProps {
    title: string,
    eng_title?: string,
    artist: string,
    img: string,
    language: string
}

export function SongCard (props: CardProps) {
    return (
        <div className="song-card">
            <div className="song-cover">
                <img src={props.img}></img>
            </div>
            <div className='song-info'>
                <p className="song-title">{props.title}</p>
                {props.eng_title && <p className="song-title">({props.eng_title})</p>}
                <p>{props.artist}</p>
                <p>{props.language}</p>
            </div>
        </div>
    )
}