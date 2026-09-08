import { useState } from "react";
import { IoSearch, IoArrowForward} from "react-icons/io5";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormControl } from "@mui/material";
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [language, setLanguage] = useState("Chinese")

    const handleChange = (event: SelectChangeEvent) => {
        setLanguage(event.target.value as string);
    }

    return (
        <nav className="navbar" aria-label="navigation">
            <Link to={'/'} className="logo-link">
                <span className="logo">Learn With Lyrics</span>
            </Link>
            
            
            {/* <div className="language-select">
                <FormControl variant="standard">
                    <Select className="select"
                        id="language-select"
                        aria-label="language select"
                        label="Language"
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
                
            </div> */}
            

            <IoSearch className="large-icons"
                height="1000px"
                width="1000px"
            />

            <div className="current-langs">
                <img className="flag" src="/flags/china_flag.png" alt="Chinese"></img>
                <IoArrowForward className="large-icons" aria-hidden="true" />
                <img className="flag" src="/flags/uk_flag.png" alt="English"></img>
            </div>
        </nav>
    )
}