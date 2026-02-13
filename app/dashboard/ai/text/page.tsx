'use client'

import { useState, useEffect } from 'react'
import { Copy, Loader2, Sparkles, Check } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function TextGenerationPage() {
  const searchParams = useSearchParams()
  const urlPrompt = searchParams.get('prompt')

  const [prompt, setPrompt] = useState(urlPrompt ? decodeURIComponent(urlPrompt) : '')
  const [model, setModel] = useState('gpt-4')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(500)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [copied, setCopied] = useState(false)

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
      setGeneratedText(`This is a sample generated response based on your prompt: "${prompt}". 

In a real implementation, this would be replaced with actual AI-generated content from models like GPT-4, Claude, or other text generation APIs.

The current settings:
- Model: ${model}
- Temperature: ${temperature}
- Max Tokens: ${maxTokens}

This text would be much more sophisticated and contextually relevant to your actual prompt.`)
      setIsGenerating(false)
    }, 2000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col w-full h-auto min-h-[calc(100vh-6rem)] px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          AI Text Generation
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Generate text, captions, and scripts using AI models.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Input & Settings */}
        <div className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full min-h-[200px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude 3</option>
              <option value="llama-2">Llama 2</option>
            </select>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-sm text-muted-foreground">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-muted-foreground">
              Higher values make output more random, lower values more focused
            </p>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Max Tokens</label>
              <span className="text-sm text-muted-foreground">{maxTokens}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full p-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Text
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Generated Text</label>
            {generatedText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors text-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div className="relative min-h-[400px] p-4 rounded-lg border bg-muted/30">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-sm text-muted-foreground">Generating text...</p>
              </div>
            ) : generatedText ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedText}
                </p>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center px-4">
                  Your generated text will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
