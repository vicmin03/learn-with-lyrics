import { useState } from "react";
import { IoSearch, IoArrowForward} from "react-icons/io5";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormControl } from "@mui/material";

export function Navbar() {
    const [language, setLanguage] = useState("Chinese")

    const handleChange = (event: SelectChangeEvent) => {
        setLanguage(event.target.value as string);
    }

    return (
        <nav className="navbar" aria-label="navigation">
            <h1 className="logo">Learn With Lyrics</h1>
            
            <div className="language-select">
                <FormControl variant="standard">
                    <Select className="select"
                        id="demo-simple-select"
                        value={language}            
                        displayEmpty
                        disableUnderline
                        onChange={handleChange}
                    >
                        <MenuItem value="Chinese">Chinese</MenuItem>
                        <MenuItem value="Japanese">Japanese</MenuItem>
                        <MenuItem value="Korean">Korean</MenuItem>
                    </Select>
                </FormControl>
                
            </div>
            

            <IoSearch className="large-icons"
                height="1000px"
                width="1000px"
            />

            <div className="current-langs">
                <img className="flag" src="/flags/china_flag.png"></img>
                <IoArrowForward className="large-icons" />
                <img className="flag" src="/flags/uk_flag.png"></img>
            </div>
        </nav>
    )
}