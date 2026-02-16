import Link from 'next/link'
import {
  FileText,
  Image,
  Music,
  Video,
  MessageSquare,
  ArrowRight
} from 'lucide-react'

const aiModelTypes = [
  {
    name: 'Text Generation',
    description: 'Generate text, captions, and scripts using AI models.',
    icon: FileText,
    href: '/dashboard/ai/text',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    borderColor: 'border-blue-500/20'
  },
  {
    name: 'Image Generation',
    description: 'Create stunning images and artwork with AI-powered tools.',
    icon: Image,
    href: '/dashboard/ai/image',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    borderColor: 'border-purple-500/20'
  },
  {
    name: 'Audio Generation',
    description: 'Generate music, sound effects, and voice synthesis.',
    icon: Music,
    href: '/dashboard/ai/audio',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20',
    borderColor: 'border-green-500/20'
  },
  {
    name: 'Video Generation',
    description: 'Create and edit videos with AI-powered video models.',
    icon: Video,
    href: '/dashboard/ai/video',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20',
    borderColor: 'border-red-500/20'
  }
]


export default function AiModels() {
  return (
    <div className="flex flex-col h-full w-full p-3 sm:p-6 md:p-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          AI Models
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">
          Manage your AI models from one unified space.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {aiModelTypes.map((modelType) => {
          const Icon = modelType.icon
          return (
            <Link
              key={modelType.name}
              href={modelType.href}
              className="group"
            >
              <div className={`
                relative p-6 rounded-lg border transition-all duration-200
                
                hover:shadow-lg hover:scale-[1.02]
              `}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-background/50`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-1 transition-all" />
                </div>

                <h2 className="text-lg font-semibold mb-2 group-hover:text-foreground transition-colors">
                  {modelType.name}
                </h2>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {modelType.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 p-4 sm:p-6 rounded-lg border bg-muted/30">
        <h3 className="text-sm font-medium mb-2">Getting Started</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Choose an AI model type above to start generating content. Each model type offers unique capabilities
          tailored to different use cases.
        </p>
      </div>
    </div>
  )
}
