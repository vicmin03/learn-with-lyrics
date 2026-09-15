import "./Form.css";

import { Input, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorText } from "../ErrorText/ErrorText";
import { supabase } from "../../lib/supabaseClient";

interface SignInProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const signUpValuesSchema = z.object({
    email: z.email(),
    confirmEmail: z.string(),
    password: z.string().min(6).max(50),
    confirmPassword: z.string()
})
.refine((data) => 
    data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
})
.refine((data) => 
    data.email === data.confirmEmail, {
        message: "Emails do not match",
        path: ["confirmEmail"],
});

type SignUpValues = z.infer<typeof signUpValuesSchema>

export function SignUpForm ({open, setOpen}: SignInProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting }} = useForm<SignUpValues>({
        resolver: zodResolver(signUpValuesSchema)
    })

    const handleClose = () => {
        setOpen(false);
    };

    const submitForm = async (data: SignUpValues) => {
        console.log("SIGNING UP WITH", data);
        const result = await supabase?.auth.signUp({email: data.email, password: data.password})

        if (result?.error) {
            console.error("Error signing up:", result.error.message)
        }

        else{
            handleClose();
        }
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
                    <form className="log-in-form" onSubmit={handleSubmit(submitForm)} id="sign-up-form">
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
                            <p>Confirm Email</p>
                            <Input 
                                {...register("confirmEmail")}
                                fullWidth
                                id="confirm-email-input"
                                placeholder="Confirm your email address"
                            />
                            <ErrorText msg={errors.confirmEmail?.message}/>
                        </div>
                        <div className="form-input-line">
                            <p>Password</p>
                            <Input 
                                {...register("password")}
                                fullWidth
                                id="password-input"
                                placeholder="Enter your password"
                                type="password"
                            />
                            <ErrorText msg={errors.password?.message}/>
                        </div>
                        <div className="form-input-line">
                            <p>Confirm Password</p>
                            <Input 
                                {...register("confirmPassword")}
                                fullWidth
                                id="confirm-password-input"
                                placeholder="Confirm your password"
                                type="password"
                            />
                            <ErrorText msg={errors.confirmPassword?.message}/>
                        </div>
                    </form>
                </DialogContent>
                <DialogActions className="form-buttons">
                    <Button
                        className="submit-button"
                        type="submit"
                        loading={isSubmitting}
                        form="sign-up-form">
                        Sign Up
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    )
}