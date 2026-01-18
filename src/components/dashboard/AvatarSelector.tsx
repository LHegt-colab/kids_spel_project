import React from 'react'
import { User, Rocket, Smile, Star } from 'lucide-react'

// Simple placeholder avatars mapping to Lucide icons or colors
export const AVATARS = [
    { id: 'astronaut-1', icon: User, color: 'bg-blue-500' },
    { id: 'rocket-1', icon: Rocket, color: 'bg-orange-500' },
    { id: 'alien-1', icon: Smile, color: 'bg-green-500' },
    { id: 'star-1', icon: Star, color: 'bg-yellow-500' },
]

interface AvatarSelectorProps {
    selectedAvatar: string
    onSelect: (id: string) => void
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedAvatar, onSelect }) => {
    return (
        <div className="flex gap-4 justify-center">
            {AVATARS.map((avatar) => {
                const Icon = avatar.icon
                const isSelected = selectedAvatar === avatar.id
                return (
                    <button
                        type="button"
                        key={avatar.id}
                        onClick={() => onSelect(avatar.id)}
                        className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all
              ${avatar.color}
              ${isSelected ? 'ring-4 ring-white scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}
            `}
                    >
                        <Icon className="text-white" size={24} />
                    </button>
                )
            })}
        </div>
    )
}
