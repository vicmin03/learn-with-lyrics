import { TextField, InputAdornment } from "@mui/material";
import { IoSearch } from "react-icons/io5";

interface SearchProps {
    searchText: string,
    handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar (props: SearchProps) {

    return (
        <>
            <div className="search">
                <TextField
                    className="search-bar"
                    id="outlined-basic"
                    variant="outlined"
                    value={props.searchText}
                    onChange={props.handleSearch}
                    placeholder="Search for a song or artist..."
                    sx={{
                        "& .MuiOutlinedInput-root": {
                        borderRadius: 30,
                        },
                    }}
                    slotProps={{
                        htmlInput: {
                            "aria-label": "search-bar"
                        },
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IoSearch 
                                        aria-label="search-icon"/>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </div>
        </>   
    )
}