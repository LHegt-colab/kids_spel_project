import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Trash2, Plus, Download, Upload, FileText, Type, AlignLeft } from 'lucide-react'

export const ContentManager = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'words' | 'sentences' | 'texts'>('words')
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newItem, setNewItem] = useState('')
    const [extraField, setExtraField] = useState('') // For category or difficulty or title

    // For Reading Texts (more complex form needed ideally, but keeping it simple)
    const [textBody, setTextBody] = useState('')

    useEffect(() => {
        if (user) fetchItems()
    }, [user, activeTab])

    const fetchItems = async () => {
        setLoading(true)
        let table = 'library_words'
        if (activeTab === 'sentences') table = 'library_sentences'
        if (activeTab === 'texts') table = 'library_texts'

        const { data, error } = await supabase.from(table as any).select('*').eq('profile_id', user?.id)
        if (data) setItems(data)
        setLoading(false)
    }

    const handleAdd = async () => {
        if (!newItem) return

        let table = 'library_words'
        let payload: any = { profile_id: user?.id }

        if (activeTab === 'words') {
            table = 'library_words'
            payload.word = newItem
            payload.category = extraField || 'general'
        } else if (activeTab === 'sentences') {
            table = 'library_sentences'
            table = 'library_sentences'
            payload.sentence_text = newItem
            payload.difficulty_level = extraField || 'age_6_7'
        } else if (activeTab === 'texts') {
            table = 'library_texts'
            payload.title = newItem
            payload.content = textBody
            payload.difficulty_level = extraField || 'age_6_7'
        }

        const { error } = await supabase.from(table as any).insert(payload)

        if (!error) {
            setNewItem('')
            setTextBody('')
            fetchItems()
        } else {
            console.error(error)
            alert('Fout bij opslaan: ' + error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Zeker weten?')) return
        let table = 'library_words'
        if (activeTab === 'sentences') table = 'library_sentences'
        if (activeTab === 'texts') table = 'library_texts'

        await supabase.from(table as any).delete().eq('id', id)
        fetchItems()
    }

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `${activeTab}_export.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (evt) => {
            try {
                const json = JSON.parse(evt.target?.result as string)
                if (!Array.isArray(json)) throw new Error('File must be an array')

                // Minimal validation: check keys based on tab
                let table = 'library_words'
                if (activeTab === 'sentences') table = 'library_sentences'
                if (activeTab === 'texts') table = 'library_texts'

                const cleaned = json.map(item => ({
                    ...item,
                    profile_id: user?.id,
                    id: undefined, // remove ID to create new
                    created_at: undefined
                }))

                const { error } = await supabase.from(table as any).insert(cleaned)
                if (error) throw error

                alert('Import succes!')
                fetchItems()
            } catch (err: any) {
                alert('Fout bij importeren: ' + err.message)
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className="bg-space-800 rounded-2xl border border-space-600 overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex border-b border-space-700">
                <button
                    onClick={() => setActiveTab('words')}
                    className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'words' ? 'bg-brand-teal text-space-900' : 'text-space-400 hover:text-white'}`}
                >
                    <Type size={18} /> Woorden
                </button>
                <button
                    onClick={() => setActiveTab('sentences')}
                    className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'sentences' ? 'bg-brand-orange text-white' : 'text-space-400 hover:text-white'}`}
                >
                    <AlignLeft size={18} /> Zinnen
                </button>
                <button
                    onClick={() => setActiveTab('texts')}
                    className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 ${activeTab === 'texts' ? 'bg-brand-purple text-white' : 'text-space-400 hover:text-white'}`}
                >
                    <FileText size={18} /> Verhalen
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {/* Actions */}
                <div className="flex justify-between mb-6">
                    <div className="flex gap-2">
                        <label className="flex items-center gap-2 px-4 py-2 bg-space-700 rounded-lg cursor-pointer hover:bg-space-600 text-white">
                            <Upload size={16} /> Import
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-space-700 rounded-lg hover:bg-space-600 text-white">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Add New Line */}
                <div className="bg-space-900 p-4 rounded-xl mb-6 flex flex-col gap-3 border border-space-700">
                    <div className="font-bold text-white mb-2">Nieuw Item Toevoegen</div>
                    <div className="flex gap-3">
                        <input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder={activeTab === 'words' ? "Woord (bijv. Ruimte)" : activeTab === 'texts' ? "Titel (bijv. De Maan)" : "Zin (bijv. Ik ga naar de maan.)"}
                            className="flex-1 bg-space-800 border border-space-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-teal outline-none"
                        />
                        {activeTab !== 'texts' && (
                            <select
                                value={extraField}
                                onChange={(e) => setExtraField(e.target.value)}
                                className="bg-space-800 border border-space-600 rounded-lg p-3 text-white outline-none"
                            >
                                <option value="">Standaard Categorie/Niveau</option>
                                <option value="age_6_7">Groep 3/4</option>
                                <option value="age_8_9">Groep 5/6</option>
                                <option value="age_10">Groep 7/8</option>
                                {activeTab === 'words' && <option value="hard_g">Harde G</option>}
                            </select>
                        )}
                    </div>
                    {activeTab === 'texts' && (
                        <textarea
                            value={textBody}
                            onChange={(e) => setTextBody(e.target.value)}
                            placeholder="Plak hier de tekst van het verhaal..."
                            className="w-full h-32 bg-space-800 border border-space-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-teal outline-none resize-none"
                        />
                    )}
                    <button
                        onClick={handleAdd}
                        className="bg-brand-teal text-space-900 font-bold py-2 rounded-lg hover:brightness-110 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Toevoegen
                    </button>
                </div>

                {/* List */}
                {loading ? <div className="text-white">Laden...</div> : (
                    <div className="space-y-2">
                        {items.length === 0 && <div className="text-space-400 italic">Nog geen items. Voeg er een toe!</div>}
                        {items.map(item => (
                            <div key={item.id} className="bg-space-700/50 p-3 rounded-lg flex justify-between items-center group">
                                <div className="text-white">
                                    <span className="font-bold">{item.word || item.sentence_text || item.title}</span>
                                    <span className="text-space-400 text-sm ml-3 opacity-60">
                                        {item.category || item.difficulty_level || ''}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-space-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
