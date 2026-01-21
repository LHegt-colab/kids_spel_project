import React from 'react'
import { Delete, Check } from 'lucide-react'

interface NumpadProps {
    onInput: (val: string) => void
    onDelete: () => void
    onSubmit: () => void
    disabled?: boolean
}

export const Numpad: React.FC<NumpadProps> = ({ onInput, onDelete, onSubmit, disabled }) => {
    const numbers = [7, 8, 9, 4, 5, 6, 1, 2, 3]

    return (
        <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mx-auto">
            {numbers.map(num => (
                <button
                    key={num}
                    onClick={() => onInput(num.toString())}
                    disabled={disabled}
                    className="aspect-square bg-space-800 rounded-2xl border-b-4 border-space-950 active:border-b-0 active:translate-y-1 transition-all text-3xl font-bold text-white shadow-lg hover:bg-space-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {num}
                </button>
            ))}

            {/* Bottom Row */}
            <button
                onClick={onDelete}
                disabled={disabled}
                className="aspect-square bg-red-500 hover:bg-red-400 text-white rounded-2xl border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50 shadow-lg"
            >
                <Delete size={32} />
            </button>

            <button
                onClick={() => onInput('0')}
                disabled={disabled}
                className="aspect-square bg-space-800 rounded-2xl border-b-4 border-space-950 active:border-b-0 active:translate-y-1 transition-all text-3xl font-bold text-white shadow-lg hover:bg-space-700 disabled:opacity-50"
            >
                0
            </button>

            <button
                onClick={onSubmit}
                disabled={disabled}
                className="aspect-square bg-brand-teal text-space-900 rounded-2xl border-b-4 border-teal-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center shadow-lg hover:bg-teal-300 disabled:opacity-50"
            >
                <Check size={40} strokeWidth={4} />
            </button>
        </div>
    )
}
