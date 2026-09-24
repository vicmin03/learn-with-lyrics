import "./NavBar.css";
import { useState, useId, useEffect, useRef } from "react";
import { IoSearch, IoChevronDown } from "react-icons/io5";
import { Menu, Button, IconButton, MenuItem, MenuList, ListItemIcon } from "@mui/material";
import { Link } from 'react-router-dom';
import { LogInForm } from "../Forms/LogInForm";
import { SignUpForm } from "../Forms/SignUpForm";
import { useAuth } from "../../auth/AuthContext";
import { SearchBar } from "../SearchBar";
import { supabase } from "../../lib/supabaseClient";
import { Song } from "../../types/song";


export default function Navbar() {
    const { session, signOut, isAdmin } = useAuth();

    // for languages menu, which opens from anchor element button
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorElement);
    const id = useId();
    const buttonId = `${id}-button`;
    const menuId = `${id}-menu`;

    // control state for search bar
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>("");
    const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
    const [songList, setSongList] = useState<Song[]>([]);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // handle opening languages menu
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(e.currentTarget);
    }

    const handleClose = () => {
        setAnchorElement(null);
    }

    // open login form
    const [openLogin, setOpenLogin] = useState(false);
    const handleLogIn = () => {
        setOpenLogin(true);
    }

    // open signup form
    const [openSignUp, setOpenSignUp] = useState(false);
    const handleSignUp = () => {
        setOpenSignUp(true);
    }

    // open search bar
    const openSearch = () => {
        setShowSearch(true);
    }

    const closeSearch = () => {
        setShowSearch(false);
        setSearchText("");
        setDebouncedSearchText("");
        setSongList([]);
    }

    useEffect(() => {
        if (!showSearch) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                closeSearch();
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [showSearch]);

    // add debounce of 5ms so only filters song after user stops typing 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 200)
        return () => clearTimeout(timer);
        }, [searchText]);
    

    // handler for user input to search bar; passed down as prop into SearchBar component
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }

    // let supabase handle search and filtering
    useEffect(() => {
        const fetchSongs = async() => {
        if (!supabase) {
            return;
        }

        // fetch and filter songs according to search
        let query = supabase.from("songs_with_artists").select("*");


        if (debouncedSearchText.trim()) {
            const search = debouncedSearchText.trim();

            query = query.or(
            `orig_title.ilike.%${search}%,eng_title.ilike.%${search}%,artist_name.ilike.%${search}%,artist_eng_name.ilike.%${search}%`
            );
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
            return;
        }
        if (data.length > 10) {
            setSongList(data.slice(0, 10));
        }
        else{
            setSongList(data);
        }
        
    }

    fetchSongs();
    }, [debouncedSearchText]);

    return (
        <nav className="navbar" aria-label="navigation">
            <Link to={'/'} className="logo-link">
                <span className="logo">Learn With Lyrics</span>
            </Link>
            
            
            <div className="language-menu">                
                <Button
                    className="menu-button"
                    id={buttonId}
                    onClick={handleClick}
                    aria-controls={open ? menuId : undefined}
                    aria-haspopup="true"
                    aria-expanded={open}
                    endIcon={<IoChevronDown/>}
                >
                    Languages
                </Button>
                <Menu
                    open={Boolean(anchorElement)}
                    anchorEl={anchorElement}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                            className: "language-menu-paper",
                        },
                        list: {
                            'aria-labelledby': buttonId,
                        },
                    }}
                >

                    <MenuItem className="language-menu-item" value="Chinese">Chinese</MenuItem>
                    <MenuItem className="language-menu-item" value="Japanese">Japanese</MenuItem>
                    <MenuItem className="language-menu-item" value="Korean">Korean</MenuItem>
                </Menu>
            </div>

            <div className="add-song-button">    
                {isAdmin && 
                    <Link to={"/add_song"}>
                        <Button className="menu-button">Add Song</Button>
                    </Link>}
            </div>
            

            <div className="nav-search" ref={searchContainerRef}>
                { showSearch ? (
                    <SearchBar searchText={searchText} handleSearch={handleSearch}/>
                ) : (
                    <IconButton 
                        className="navbar-search-icon" 
                        aria-label="Search"
                        onClick={openSearch}>
                        <IoSearch 
                            className="large-icon"
                        />
                    </IconButton>
                )}

                { (searchText && songList && songList.length > 0) && (
                    <MenuList className="nav-search-results">
                        {songList.map((song) => (
                            <Link
                                to={`/songs/${song.song_id}`}
                                className="card-link"
                                onClick={closeSearch}
                            >
                                <MenuItem 
                                    key={song.song_id}
                                    className="song-result">
                                    <ListItemIcon>
                                        <img className="song-result-img" src={song.cover_url} alt={`${song.orig_title} - ${song.artist_name}`}/>
                                    </ListItemIcon>
                                    <div className="song-result-info">
                                        <p>{song.orig_title} ({song.eng_title}) - {song.artist_name}</p>

                                    </div>
                                
                                </MenuItem>
                            </Link>
                        ))}
                    </MenuList>
                )}
            </div>

            
            <div className="auth-button-container">
                { session ? ( 
                    <Button
                        className="nav-button"
                        onClick={signOut}>
                        Sign Out
                    </Button>
                    ) : (
                    <>
                        <Button
                            className="nav-button"
                            onClick={handleLogIn}>
                            Log In
                        </Button>

                        {openLogin && <LogInForm open={openLogin} setOpen={setOpenLogin}  />}

                        <Button
                            className="nav-button"
                            onClick={handleSignUp}>
                            Sign Up
                        </Button>

                        {openSignUp && <SignUpForm open={openSignUp} setOpen={setOpenSignUp}  />}
                    </>
                    )   
                }
            </div>

        </nav>
    )
}