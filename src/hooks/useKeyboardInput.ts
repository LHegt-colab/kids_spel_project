import { useEffect } from 'react'

interface UseKeyboardInputProps {
    onInput: (value: string) => void
    onDelete: () => void
    onSubmit: () => void
    disabled?: boolean
}

export const useKeyboardInput = ({ onInput, onDelete, onSubmit, disabled = false }: UseKeyboardInputProps) => {
    useEffect(() => {
        if (disabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Numbers
            if (/^[0-9]$/.test(e.key)) {
                onInput(e.key)
            }
            // Backspace
            if (e.key === 'Backspace') {
                onDelete()
            }
            // Enter
            if (e.key === 'Enter') {
                onSubmit()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onInput, onDelete, onSubmit, disabled])
}
