import { useState, useCallback } from 'react'
import { useSession } from '../context/SessionContext'

// In a real app, these would be paths to actual mp3 files
// For now, we'll try to find some online hosted open source SFX or just use a dummy implementation if needed.
// Actually, for this demo we will just skip actual audio files if we don't have them, 
// but I will mock the hook so it doesn't crash.

export const useGameSounds = () => {
    // const [playCorrect] = useSound('/sounds/correct.mp3')
    // const [playWrong] = useSound('/sounds/wrong.mp3')

    // Since we don't have assets, we will just log playing for now, 
    // or we could use the Web Audio API to beep.

    const playCorrect = useCallback(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3') // Free ding sound
        audio.volume = 0.5
        audio.play().catch(e => console.log('Audio play failed', e))
    }, [])

    const playWrong = useCallback(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3') // Free buzz sound
        audio.volume = 0.5
        audio.play().catch(e => console.log('Audio play failed', e))
    }, [])

    const playLevelUp = useCallback(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3') // Ta-da
        audio.volume = 0.5
        audio.play().catch(e => console.log('Audio play failed', e))
    }, [])

    return { playCorrect, playWrong, playLevelUp }
}
