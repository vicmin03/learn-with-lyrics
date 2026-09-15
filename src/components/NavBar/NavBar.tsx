import "./NavBar.css";
import { useState, useId } from "react";
import { IoSearch, IoChevronDown } from "react-icons/io5";
import { Menu, Button, IconButton, MenuItem } from "@mui/material";
import { Link } from 'react-router-dom';
import { LogInForm } from "../Forms/LogInForm";
import { SignUpForm } from "../Forms/SignUpForm";
import { useAuth } from "../../auth/AuthContext";


export default function Navbar() {
    const { session, signOut, user, isAdmin } = useAuth();

    // for languages menu, which opens from anchor element button
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorElement);
    const id = useId();
    const buttonId = `${id}-button`;
    const menuId = `${id}-menu`;

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

            <div>
                {isAdmin && <Button>Add Song</Button>}
            </div>
            

            <IconButton className="navbar-search-icon" aria-label="Search">
                <IoSearch 
                    className="large-icon"
                />
            </IconButton>

            
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