'use client'

import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Tag, X } from 'lucide-react'

interface Prompt {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    createdAt: string
}

const initialPrompts: Prompt[] = [
    {
        id: '1',
        title: 'Product Description',
        content: 'Write a compelling product description for [product name] that highlights its key features and benefits.',
        category: 'Marketing',
        tags: ['ecommerce', 'copywriting'],
        createdAt: '2024-02-10'
    },
    {
        id: '2',
        title: 'Blog Post Outline',
        content: 'Create a detailed outline for a blog post about [topic] including introduction, main points, and conclusion.',
        category: 'Content',
        tags: ['blogging', 'writing'],
        createdAt: '2024-02-09'
    },
    {
        id: '3',
        title: 'Social Media Post',
        content: 'Generate an engaging social media post about [topic] for [platform] with relevant hashtags.',
        category: 'Social Media',
        tags: ['marketing', 'engagement'],
        createdAt: '2024-02-08'
    }
]

export default function PromptsLibraryPage() {
    const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: ''
    })

    const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category)))]

    const filteredPrompts = prompts.filter(prompt => {
        const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleAddNew = () => {
        setEditingPrompt(null)
        setFormData({ title: '', content: '', category: '', tags: '' })
        setIsDialogOpen(true)
    }

    const handleEdit = (prompt: Prompt) => {
        setEditingPrompt(prompt)
        setFormData({
            title: prompt.title,
            content: prompt.content,
            category: prompt.category,
            tags: prompt.tags.join(', ')
        })
        setIsDialogOpen(true)
    }

    const handleDelete = (id: string) => {
        setPrompts(prompts.filter(p => p.id !== id))
    }

    const handleSave = () => {
        if (!formData.title || !formData.content) return

        const newPrompt: Prompt = {
            id: editingPrompt?.id || Date.now().toString(),
            title: formData.title,
            content: formData.content,
            category: formData.category || 'Uncategorized',
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            createdAt: editingPrompt?.createdAt || new Date().toISOString().split('T')[0]
        }

        if (editingPrompt) {
            setPrompts(prompts.map(p => p.id === editingPrompt.id ? newPrompt : p))
        } else {
            setPrompts([newPrompt, ...prompts])
        }

        setIsDialogOpen(false)
        setFormData({ title: '', content: '', category: '', tags: '' })
    }

    return (
        <div className="flex flex-col w-full h-auto min-h-[calc(100vh-6rem)] px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            {/* Header */}
            <header className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                            Prompts Library
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">
                            Manage and organize your AI prompts and templates.
                        </p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Prompt</span>
                    </button>
                </div>
            </header>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Prompts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPrompts.map((prompt) => (
                    <div
                        key={prompt.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg">{prompt.title}</h3>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleEdit(prompt)}
                                    className="p-1.5 rounded hover:bg-muted transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(prompt.id)}
                                    className="p-1.5 rounded hover:bg-muted transition-colors text-red-500"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {prompt.content}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 rounded-md bg-orange-500/10 text-orange-600 text-xs font-medium">
                                {prompt.category}
                            </span>
                            {prompt.tags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPrompts.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-12">
                    <p className="text-muted-foreground">No prompts found</p>
                </div>
            )}

            {/* Add/Edit Dialog */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
                            </h2>
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter prompt title..."
                                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prompt Content</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Enter your prompt template..."
                                    className="w-full min-h-[150px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g., Marketing, Content, Code"
                                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="e.g., seo, writing, social"
                                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t">
                            <button
                                onClick={() => setIsDialogOpen(false)}
                                className="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.title || !formData.content}
                                className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:bg-muted disabled:text-muted-foreground text-white font-medium transition-colors"
                            >
                                {editingPrompt ? 'Update' : 'Add'} Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
