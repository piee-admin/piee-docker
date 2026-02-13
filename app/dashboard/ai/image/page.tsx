'use client'

import { useState, useEffect } from 'react'
import { Download, Loader2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export default function ImageGenerationPage() {
    const searchParams = useSearchParams()
    const urlPrompt = searchParams.get('prompt')

    const [prompt, setPrompt] = useState(urlPrompt ? decodeURIComponent(urlPrompt) : '')
    const [negativePrompt, setNegativePrompt] = useState('')
    const [model, setModel] = useState('dall-e-3')
    const [size, setSize] = useState('1024x1024')
    const [style, setStyle] = useState('vivid')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string | null>(null)

    // Update prompt when URL param changes
    useEffect(() => {
        if (urlPrompt) {
            setPrompt(decodeURIComponent(urlPrompt))
        }
    }, [urlPrompt])

    const handleGenerate = async () => {
        if (!prompt.trim()) return

        setIsGenerating(true)
        // Simulate generation (replace with actual API call)
        setTimeout(() => {
            setGeneratedImage(`https://picsum.photos/seed/${Date.now()}/1024/1024`)
            setIsGenerating(false)
        }, 3000)
    }

    const handleDownload = () => {
        if (!generatedImage) return
        // Implement download logic
        const link = document.createElement('a')
        link.href = generatedImage
        link.download = `ai-image-${Date.now()}.png`
        link.click()
    }

    return (
        <div className="flex flex-col w-full h-auto min-h-[calc(100vh-6rem)] px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            {/* Header */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                    AI Image Generation
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Create stunning images and artwork with AI-powered tools.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Settings */}
                <div className="space-y-6">
                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you want to generate..."
                            className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    {/* Negative Prompt */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Negative Prompt (Optional)</label>
                        <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            placeholder="What to avoid in the image..."
                            className="w-full min-h-[80px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Model</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="dall-e-3">DALL-E 3</option>
                                <option value="dall-e-2">DALL-E 2</option>
                                <option value="stable-diffusion">Stable Diffusion XL</option>
                                <option value="midjourney">Midjourney</option>
                            </select>
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Size</label>
                            <select
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="1024x1024">Square (1024x1024)</option>
                                <option value="1024x1792">Portrait (1024x1792)</option>
                                <option value="1792x1024">Landscape (1792x1024)</option>
                            </select>
                        </div>

                        {/* Style Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Style</label>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="vivid">Vivid</option>
                                <option value="natural">Natural</option>
                                <option value="artistic">Artistic</option>
                                <option value="photorealistic">Photorealistic</option>
                            </select>
                        </div>

                        {/* Quality */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quality</label>
                            <select
                                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                                <option value="standard">Standard</option>
                                <option value="hd">HD</option>
                            </select>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full p-4 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-muted disabled:text-muted-foreground text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Generate Image
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel - Output */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Generated Image</label>
                        {generatedImage && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        )}
                    </div>

                    <div className="relative aspect-square rounded-lg border bg-muted/30 overflow-hidden">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                                <p className="text-sm text-muted-foreground">Creating your image...</p>
                            </div>
                        ) : generatedImage ? (
                            <Image
                                src={generatedImage}
                                alt="Generated image"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-sm text-muted-foreground text-center px-4">
                                    Your generated image will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
