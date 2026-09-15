import "./LogInForm.css";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Input, DialogContentText } from "@mui/material";

interface LogInProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function LogInForm ({open, setOpen}: LogInProps ) {

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        console.log("GONNA SUBMIT NOW")
    }

    return (
        <>
            <Dialog className="dialog" 
                open={open} 
                onClose={handleClose}
                fullWidth
                maxWidth="sm">
                <DialogTitle>Log In</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Sign in to your account
                    </DialogContentText>
                    <form className="log-in-form" onSubmit={handleSubmit} id="log-in-form">
                        <div className="form-input-line">
                            <p>Email</p>
                            <Input 
                                fullWidth
                                id="email-input"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <div className="form-input-line">
                            <p>Password</p>
                            <Input 
                                fullWidth
                                placeholder="Enter your password"
                                type="password"/>
                        </div>
                    </form>
                </DialogContent>
                <DialogActions className="form-buttons">
                    <Button 
                        className="submit-button"
                        type="submit" form="log-in-form">
                        Log In
                    </Button>
                </DialogActions>
                <div className="form-footer">
                    <p className="form-extra-prompt"><u>Forgot password?</u></p>
                    <p className="form-extra-prompt">Don't have an account? <u>Sign Up</u></p>
                </div>

            </Dialog>

        </>
    )
}