import "./Form.css";
import * as z from "zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Input, DialogContentText, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorText } from "../ErrorText/ErrorText";
import { supabase } from "../../lib/supabaseClient";

interface LogInProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

// define validation for login form
const logInValuesSchema = z.object({
    email: z.email(),
    password: z.string().min(6).max(50)
})

type LogInValues = z.infer<typeof logInValuesSchema>

export function LogInForm ({open, setOpen}: LogInProps ) {
    // use react-hook-form for validation and easier form management
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LogInValues>({
        resolver: zodResolver(logInValuesSchema)
    })

    const handleClose = () => {
        setOpen(false);
    };

    const submitForm = async (data: LogInValues) => {
        
        console.log("LOGGING IN WITH", data);
        
        const result = await supabase?.auth.signInWithPassword({
            email: data.email, password: data.password
        });
        if (result?.error) {
            console.error("Error logging in:", result.error.message)
        }
        else {
            handleClose();
        }
        
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
                    <form className="log-in-form" onSubmit={handleSubmit(submitForm)} id="log-in-form">
                        <div className="form-input-line">
                            <p>Email</p>
                            <Input 
                                {...register("email")}
                                fullWidth
                                id="email-input"
                                placeholder="Enter your email address"
                            />
                            <ErrorText msg={errors.email?.message}/>
                        </div>
                        <div className="form-input-line">
                            <p>Password</p>
                            <Input 
                                {...register("password")}
                                fullWidth
                                placeholder="Enter your password"
                                type="password"/>
                            <ErrorText msg={errors.password?.message}/>
                        </div>
                    </form>
                </DialogContent>
                <DialogActions className="form-buttons">
                    <Button 
                        className="submit-button"
                        type="submit" 
                        loading={isSubmitting}
                        loadingIndicator={
                        <CircularProgress
                            size={20}
                            sx={{ color: "white" }}
                            />
                        }
                        form="log-in-form">
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