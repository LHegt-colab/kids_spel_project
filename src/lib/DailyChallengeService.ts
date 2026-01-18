import { supabase } from '../lib/supabase'

export interface DailyChallengeTask {
    id: string
    title: string
    moduleId: string
    target: number
    type: 'score' | 'count' | 'complete'
    completed: boolean
}

const CHALLENGE_POOL: Omit<DailyChallengeTask, 'id' | 'completed'>[] = [
    { title: 'Speel 1 potje RekenRace', moduleId: 'math-race', target: 1, type: 'count' },
    { title: 'Haal 10 punten in RekenAvontuur', moduleId: 'math-adventure', target: 10, type: 'score' },
    { title: 'Vind 5 woorden in Woordenjacht', moduleId: 'word-hunt', target: 5, type: 'score' },
    { title: 'Lees 1 verhaaltje', moduleId: 'read-choose', target: 1, type: 'count' },
    { title: 'Bouw 3 zinnen', moduleId: 'sentence-builder', target: 3, type: 'count' },
]

export const getDailyChallenges = async (childId: string): Promise<DailyChallengeTask[]> => {
    const today = new Date().toISOString().split('T')[0]

    // 1. Check if challenges exist for today
    const { data: existing } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('child_id', childId)
        .eq('date', today)
        .single()

    if (existing && existing.tasks) {
        return existing.tasks as DailyChallengeTask[]
    }

    // 2. Generate new challenges
    const tasks = generateRandomChallenges()

    // 3. Save to DB
    const { error } = await supabase.from('daily_challenges').insert({
        child_id: childId,
        date: today,
        tasks: tasks
    })

    if (error) {
        console.error('Error creating daily challenges:', error)
        return []
    }

    return tasks
}

const generateRandomChallenges = (): DailyChallengeTask[] => {
    // Shuffle and pick 3
    const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 3)

    return selected.map(task => ({
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        completed: false
    }))
}

export const updateChallengeProgress = async (childId: string, moduleId: string, score: number) => {
    // Logic to update challenge progress would go here (fetch, update specific task, save back)
    // For V1, we'll implement this fully when hooking up the actual games.
    console.log(`Updating challenge progress for ${childId} in ${moduleId} with score ${score}`)
}
