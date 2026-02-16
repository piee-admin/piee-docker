'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, Loader2, Sparkles, Play, Pause } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function AudioGenerationPage() {
    const searchParams = useSearchParams()
    const urlPrompt = searchParams.get('prompt')

    const [prompt, setPrompt] = useState(urlPrompt ? decodeURIComponent(urlPrompt) : '')
    const [audioType, setAudioType] = useState('music')
    const [duration, setDuration] = useState(30)
    const [quality, setQuality] = useState('standard')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

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
            // In local-only mode, we don't fetch external audio
            setGeneratedAudio(null)
            setIsGenerating(false)
        }, 3000)
    }

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleDownload = () => {
        if (!generatedAudio) return
        const link = document.createElement('a')
        link.href = generatedAudio
        link.download = `ai-audio-${Date.now()}.mp3`
        link.click()
    }

    return (
        <div className="flex flex-col w-full h-auto min-h-[calc(100vh-6rem)] px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            {/* Header */}
            <header className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                    AI Audio Generation
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Generate music, sound effects, and voice synthesis.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Settings */}
                <div className="space-y-6">
                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the audio you want to generate..."
                            className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        />
                    </div>

                    {/* Audio Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Audio Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['music', 'voice', 'effects'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setAudioType(type)}
                                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${audioType === type
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-background hover:bg-muted'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Duration</label>
                            <span className="text-sm text-muted-foreground">{duration}s</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="120"
                            step="5"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                    </div>

                    {/* Quality Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Quality</label>
                        <select
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        >
                            <option value="standard">Standard (128kbps)</option>
                            <option value="high">High (256kbps)</option>
                            <option value="ultra">Ultra (320kbps)</option>
                        </select>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full p-4 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Generate Audio
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel - Output */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Generated Audio</label>
                        {generatedAudio && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
                            >
                                <Download className="h-4 w-4" />
                                Download
                            </button>
                        )}
                    </div>

                    <div className="relative min-h-[400px] p-6 rounded-lg border bg-muted/30">
                        {isGenerating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-12 w-12 text-green-500 animate-spin" />
                                <p className="text-sm text-muted-foreground">Generating audio...</p>
                            </div>
                        ) : generatedAudio ? (
                            <div className="flex flex-col items-center justify-center h-full gap-6">
                                <div className="w-full max-w-md space-y-4">
                                    {/* Waveform Visualization Placeholder */}
                                    <div className="h-32 bg-background rounded-lg flex items-center justify-center border">
                                        <div className="flex items-end gap-1 h-20">
                                            {[...Array(40)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1 bg-green-500 rounded-full"
                                                    style={{
                                                        height: `${Math.random() * 100}%`,
                                                        opacity: isPlaying ? 0.8 : 0.4
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Audio Player Controls */}
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={togglePlayPause}
                                            className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-6 w-6" />
                                            ) : (
                                                <Play className="h-6 w-6 ml-0.5" />
                                            )}
                                        </button>
                                    </div>

                                    <audio
                                        ref={audioRef}
                                        src={generatedAudio}
                                        onEnded={() => setIsPlaying(false)}
                                        className="w-full"
                                        controls
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-sm text-muted-foreground text-center px-4">
                                    Your generated audio will appear here
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
