import { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { IoSearch } from "react-icons/io5";

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
                <TextField
                    className="search-bar"
                    id="outlined-basic"
                    variant="outlined"
                    value={searchText}
                    onChange={handleSearch}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                        borderRadius: 30,
                        },
                    }}
                    slotProps={{
                        input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <IoSearch />
                            </InputAdornment>
                        ),
                        },
                    }}
                />
            </div>
        </>   
    )
}