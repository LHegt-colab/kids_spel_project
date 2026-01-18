import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// In a real app, these would be paths to actual mp3 files
// For now, we'll try to find some online hosted open source SFX or just use a dummy implementation if needed.
// Actually, for this demo we will just skip actual audio files if we don't have them, 
// but I will mock the hook so it doesn't crash.

export const useGameSounds = () => {
    // const [playCorrect] = useSound('/sounds/correct.mp3')
    // const [playWrong] = useSound('/sounds/wrong.mp3')

    // Since we don't have assets, we will just log playing for now, 
    // or we could use the Web Audio API to beep.

    const { session } = useSession() // We can use session to check settings, or a new SettingsContext
    const { selectedChild } = useAuth() // Or check profile settings directly
    const [enabled, setEnabled] = useState(true)

    useEffect(() => {
        // Ideally we fetch this from a context. For now, let's assume if we are logged in, we check the local storage or fetch.
        // Actually, let's keep it simple: defaulting to true is fine, but if we want to respect the setting,
        // we need to fetch 'child_settings' for the current child.
        // Since we don't have a SettingsContext, let's do a quick fetch or just rely on default for V1.
        // Wait, the requirement is "toggle in parent settings". 
        // We can fetch it once on mount.
        if (selectedChild) {
            supabase.from('child_settings').select('sound_enabled').eq('child_id', selectedChild.id).single()
                .then(({ data }) => {
                    if (data) setEnabled(data.sound_enabled)
                })
        }
    }, [selectedChild])

    const playSound = useCallback((url: string) => {
        if (!enabled) return
        const audio = new Audio(url)
        audio.volume = 0.5
        audio.play().catch(e => console.log('Audio play failed', e))
    }, [enabled])

    const playCorrect = useCallback(() => {
        playSound('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3')
    }, [playSound])

    const playWrong = useCallback(() => {
        playSound('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3')
    }, [playSound])

    const playLevelUp = useCallback(() => {
        playSound('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
    }, [playSound])

    return { playCorrect, playWrong, playLevelUp }
}
