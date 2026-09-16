import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input } from "@mui/material";
import { ErrorText } from "./ErrorText/ErrorText";

interface FormInputLineProps<T extends FieldValues> {
    register: UseFormRegister<T>,
    errors: FieldErrors<T>
    label: string,
    field: Path<T>,
    type?: string,
    placeholder: string,
    disabled?: boolean,
}

export function FormInputLine<T extends FieldValues>({register, errors, label, field, type, placeholder, disabled}: FormInputLineProps<T>) {
    const errorMessage = errors[field]?.message;

    return (
        <div className="form-input-line">
            <p>{label}</p>
            <Input 
                {...register(field)}
                fullWidth
                id={`${field}-input`}
                placeholder={placeholder}
                type={type || 'text'} 
                disabled={disabled}
            />
            <ErrorText msg={typeof errorMessage === "string" ? errorMessage : undefined}/>
        </div>
    )
}