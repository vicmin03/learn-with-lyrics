import "./Form.css";

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {CircularProgress} from "@mui/material";
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from "../../lib/supabaseClient";
import { FormInputLine } from "../FormInputLine";

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
                        <FormInputLine 
                            register={register} 
                            errors={errors}
                            label="Email" 
                            field="email" 
                            placeholder="Enter your email address"
                        />
                        <FormInputLine 
                            register={register} 
                            errors={errors}
                            label="Confirm Email" 
                            field="confirmEmail" 
                            placeholder="Confirm your email address"
                        />
                        <FormInputLine 
                            register={register} 
                            errors={errors}
                            label="Password" 
                            field="password" 
                            placeholder="Enter your password"
                            type="password"
                        />
                        <FormInputLine 
                            register={register} 
                            errors={errors}
                            label="Confirm Password" 
                            field="confirmPassword" 
                            placeholder="Confirm your password"
                            type="password"
                        />
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
                        form="sign-up-form">
                        Sign Up
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    )
}