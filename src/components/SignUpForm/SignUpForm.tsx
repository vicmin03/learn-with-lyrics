import "../LogInForm/LogInForm.css";
import "./SignUpForm.css";
import { Input, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

interface SignInProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function SignUpForm ({open, setOpen}: SignInProps) {
    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        console.log("GONNA SIGN UP NOW")
    }

    return (
        <>
            <Dialog
                className="dialog"
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm">
                <DialogTitle>Sign Up</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Create an account to add vocabulary to flashcard decks, request new songs and track your favourite songs/artists
                    </DialogContentText>
                    <form className="log-in-form" onSubmit={handleSubmit} id="sign-up-form">
                        <div className="form-input-line">
                            <p>Email</p>
                            <Input 
                                fullWidth
                                id="email-input"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <div className="form-input-line">
                            <p>Confirm Email</p>
                            <Input 
                                fullWidth
                                id="confirm-email-input"
                                placeholder="Confirm your email address"
                            />
                        </div>
                        <div className="form-input-line">
                            <p>Password</p>
                            <Input 
                                fullWidth
                                id="password-input"
                                placeholder="Enter your password"
                                type="password"
                            />
                        </div>
                        <div className="form-input-line">
                            <p>Confirm Password</p>
                            <Input 
                                fullWidth
                                id="confirm-password-input"
                                placeholder="Confirm your password"
                                type="password"
                            />
                        </div>
                    </form>
                </DialogContent>
                <DialogActions className="form-buttons">
                    <Button
                        className="submit-button"
                        type="submit"
                        form="sign-up-form">
                        Sign Up
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    )
}