'use client'

import { useState, useEffect } from 'react'
import { Download, Loader2, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function VideoGenerationPage() {
    const searchParams = useSearchParams()
    const urlPrompt = searchParams.get('prompt')

    const [prompt, setPrompt] = useState(urlPrompt ? decodeURIComponent(urlPrompt) : '')
    const [duration, setDuration] = useState(5)
    const [resolution, setResolution] = useState('1080p')
    const [fps, setFps] = useState(30)
    const [style, setStyle] = useState('realistic')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)

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
            // Using a sample video URL for demonstration
            setGeneratedVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
            setIsGenerating(false)
        }, 4000)
    }

    const handleDownload = () => {
        if (!generatedVideo) return
        const link = document.createElement('a')
        link.href = generatedVideo
        link.download = `ai-video-${Date.now()}.mp4`
        link.click()
    }

    return (
        <div className="flex flex-col w-full h-auto min-h-[calc(100vh-6rem)] px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            {/* Header */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                    AI Video Generation
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Create and edit videos with AI-powered video models.
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
                            placeholder="Describe the video you want to generate..."
                            className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Duration</label>
                            <span className="text-sm text-muted-foreground">{duration}s</span>
                        </div>
                        <input
                            type="range"
                            min="3"
                            max="30"
                            step="1"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Resolution */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Resolution</label>
                            <select
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                                <option value="480p">480p (SD)</option>
                                <option value="720p">720p (HD)</option>
                                <option value="1080p">1080p (Full HD)</option>
                                <option value="4k">4K (Ultra HD)</option>
                            </select>
                        </div>

                        {/* FPS */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Frame Rate</label>
                            <select
                                value={fps}
                                onChange={(e) => setFps(parseInt(e.target.value))}
                                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                                <option value="24">24 fps (Cinematic)</option>
                                <option value="30">30 fps (Standard)</option>
                                <option value="60">60 fps (Smooth)</option>
                            </select>
                        </div>
                    </div>

                    {/* Style Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Style</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['realistic', 'artistic', 'animated', 'cinematic'].map((styleOption) => (
                                <button
                                    key={styleOption}
                                    onClick={() => setStyle(styleOption)}
                                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${style === styleOption
                                        ? 'bg-red-500 text-white border-red-500'
                                        : 'bg-background hover:bg-muted'
                                        }`}
                                >
                                    {styleOption}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full p-4 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-muted disabled:text-muted-foreground text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Generate Video
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel - Output */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Generated Video</label>
                        {generatedVideo && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        )}
                    </div>

                    <div className="relative aspect-video rounded-lg border bg-muted/30 overflow-hidden">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-12 w-12 text-red-500 animate-spin" />
                                <p className="text-sm text-muted-foreground">Generating video...</p>
                                <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }} />
                                </div>
                            </div>
                        ) : generatedVideo ? (
                            <video
                                src={generatedVideo}
                                controls
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-sm text-muted-foreground text-center px-4">
                                    Your generated video will appear here
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Video Info */}
                    {generatedVideo && (
                        <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
                            <h3 className="text-sm font-medium">Video Details</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>Duration: {duration}s</div>
                                <div>Resolution: {resolution}</div>
                                <div>Frame Rate: {fps} fps</div>
                                <div>Style: {style}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
