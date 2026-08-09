import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";

export function SearchBar () {
    const [searchText, setSearchText] = useState("");

    const handleSubmit = () => {
        return
    }

    useEffect(() => {
        console.log(searchText)
    }, [searchText])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        setSearchText(e.target.value);
    }

    return (
        <>
            <div className="search">
                {/* <TextField
                    id="outlined-basic"
                    variant="outlined"
                    fullWidth
                    label="Search"
                /> */}
                <form onSubmit={handleSubmit}>
                    <input className="search" 
                    onChange={handleSearch}
                     />

                </form>
            </div>
        </>   
    )
}