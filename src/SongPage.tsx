import { useParams } from "react-router-dom";

export default function SongPage() {
    let { songid } = useParams();

    return (
        <>
            <h1> Lyrics Page </h1>
            <h3> Title </h3>
            <h4> Artist </h4>
            <p> Lyrics go here for song {songid}</p>
        </>     
    )
}