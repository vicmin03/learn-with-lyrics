import { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { IoSearch } from "react-icons/io5";

interface SearchProps {
    searchText: string,
    handleSearch: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement, Element>
}

export function SearchBar (props: SearchProps) {

    return (
        <>
            <div className="search">
                <TextField
                    className="search-bar"
                    id="outlined-basic"
                    variant="outlined"
                    value={props.searchText}
                    onChange={props.handleSearch}
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