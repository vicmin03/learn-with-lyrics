// Component for displaying form error text
import "./ErrorText.css"


interface ErrorTextProps {
    msg?: string
}

export function ErrorText({ msg }: ErrorTextProps) {
    return (
        <p className="error-msg-text">{msg}</p>
    )
}