export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    setup_completed: boolean
                    pin_code: string | null
                    updated_at: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    setup_completed?: boolean
                    pin_code?: string | null
                    updated_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    setup_completed?: boolean
                    pin_code?: string | null
                    updated_at?: string | null
                    created_at?: string
                }
            }
            child_profiles: {
                Row: {
                    id: string
                    parent_id: string
                    name: string
                    age_band: '6-7' | '8-9' | '10'
                    avatar_id: string
                    created_at: string
                    weekly_goal_minutes: number | null
                    total_stars: number | null
                }
                Insert: {
                    id?: string
                    parent_id: string
                    name: string
                    age_band: '6-7' | '8-9' | '10'
                    avatar_id?: string
                    created_at?: string
                    weekly_goal_minutes?: number | null
                    total_stars?: number | null
                }
                Update: {
                    id?: string
                    parent_id?: string
                    name?: string
                    age_band?: '6-7' | '8-9' | '10'
                    avatar_id?: string
                    created_at?: string
                    weekly_goal_minutes?: number | null
                    total_stars?: number | null
                }
            }
            child_settings: {
                Row: {
                    child_id: string
                    daily_limit_minutes: number
                    enabled_modules: string[] // JSON as string array
                    difficulty_caps: { [key: string]: number } // JSON object
                    rewards_enabled: boolean
                    sound_enabled: boolean
                    reporting_level: 'simple' | 'detailed'
                    updated_at: string | null
                }
                Insert: {
                    child_id: string
                    daily_limit_minutes?: number
                    enabled_modules?: any
                    difficulty_caps?: any
                    rewards_enabled?: boolean
                    sound_enabled?: boolean
                    reporting_level?: 'simple' | 'detailed'
                    updated_at?: string | null
                }
                Update: {
                    child_id?: string
                    daily_limit_minutes?: number
                    enabled_modules?: any
                    difficulty_caps?: any
                    rewards_enabled?: boolean
                    sound_enabled?: boolean
                    reporting_level?: 'simple' | 'detailed'
                    updated_at?: string | null
                }
            }
            daily_usage: {
                Row: {
                    id: string
                    child_id: string
                    date: string
                    minutes_used: number
                }
                Insert: {
                    id?: string
                    child_id: string
                    date?: string
                    minutes_used?: number
                }
                Update: {
                    id?: string
                    child_id?: string
                    date?: string
                    minutes_used?: number
                }
            }
            game_sessions: {
                Row: {
                    id: string
                    child_id: string
                    module_id: string
                    start_time: string
                    end_time: string | null
                    duration_seconds: number
                    score: number
                    meta: any
                }
                Insert: {
                    id?: string
                    child_id: string
                    module_id: string
                    start_time?: string
                    end_time?: string | null
                    duration_seconds?: number
                    score?: number
                    meta?: any
                }
                Update: {
                    id?: string
                    child_id?: string
                    module_id?: string
                    start_time?: string
                    end_time?: string | null
                    duration_seconds?: number
                    score?: number
                    meta?: any
                }
            }
            shop_items: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    category: 'helmet' | 'suit' | 'pet' | 'background'
                    cost: number
                    asset_url: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    category: 'helmet' | 'suit' | 'pet' | 'background'
                    cost?: number
                    asset_url: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    category?: 'helmet' | 'suit' | 'pet' | 'background'
                    cost?: number
                    asset_url?: string
                    created_at?: string
                }
            }
            purchased_items: {
                Row: {
                    id: string
                    child_id: string
                    item_id: string
                    purchased_at: string
                }
                Insert: {
                    id?: string
                    child_id: string
                    item_id: string
                    purchased_at?: string
                }
                Update: {
                    id?: string
                    child_id?: string
                    item_id?: string
                    purchased_at?: string
                }
            }
            daily_challenges: {
                Row: {
                    id: string
                    child_id: string
                    challenge_date: string
                    math_completed: boolean
                    language_completed: boolean
                    logic_completed: boolean
                    rewards_claimed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    child_id: string
                    challenge_date: string
                    math_completed?: boolean
                    language_completed?: boolean
                    logic_completed?: boolean
                    rewards_claimed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    child_id?: string
                    challenge_date?: string
                    math_completed?: boolean
                    language_completed?: boolean
                    logic_completed?: boolean
                    rewards_claimed?: boolean
                    created_at?: string
                }
            }
            library_words: {
                Row: {
                    id: string
                    word: string
                    category: string
                    difficulty_level: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    word: string
                    category: string
                    difficulty_level: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    word?: string
                    category?: string
                    difficulty_level?: string
                    created_at?: string
                }
            }
        }
    }
}
