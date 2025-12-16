import {
    BookOpen,
    Bot,
    Frame,
    LifeBuoy,
    Map,
    PieChart,
    Send,
    Settings2,
    SquareTerminal,
    Instagram,
    Music2,
    Video,
    Grid,
    Upload,
    Hash,
    Type,
    Calendar,
    BarChart3,
    QrCode,

    LucideIcon,
    ImageIcon,
    Code,
    Music,
    FileText,
    HardDrive,
    Library,
    Globe,
    ScrollText,
    Cpu,
    Image,
    User,
    CreditCard,
    Users,
    Gauge,
} from "lucide-react"

// -----------------------------
// TYPES — FIXES THE ERROR
// -----------------------------

export type NavItem = {
    title: string
    url: string
    icon?: LucideIcon
}

export type NavSection = {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: NavItem[]
}
// -----------------------------
// MAIN NAV
// -----------------------------
export const navMain: NavSection[] = [
    {
        title: "Library",
        url: "/library",
        icon: Library,
        isActive: true,
        items: [
            { title: "All", url: "/library", icon: Globe },
            { title: "Prompts", url: "/library/prompt", icon: ScrollText },
            { title: "Models", url: "/library/model", icon: Cpu },
            { title: "Images", url: "/library/image", icon: Image },
            { title: "Videos", url: "/library/video", icon: Video },
        ],
    },
    {
        title: "Settings",
        url: "/library/settings",
        icon: Settings2,
        items: [
            { title: "Account", url: "/library/settings/account", icon: User },
            { title: "Billing", url: "/library/settings/billing", icon: CreditCard },
            { title: "Workspace", url: "/library/settings/workspace", icon: Users },
            { title: "Limits", url: "/library/settings/limits", icon: Gauge },
        ],
    },
]

/**export const navMain: NavSection[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
        items: [
            
            { title: "Overview", url: "/dashboard/overview" },
            { title: "Activity", url: "/dashboard/activity" },
            { title: "Shortcuts", url: "/dashboard/shortcuts" },
        ],
    },
    {
        title: "Files",
        url: "/dashboard/files",
        icon: HardDrive,
        isActive: true,
    },
    {
        title: "Library",
        url: "/library",
        icon: Library,
        isActive: true,
        items: [
            { title: "All", url: "/library" },
            { title: "Prompts", url: "/library/prompt" },
            { title: "Models", url: "/library/model" },
            { title: "Images", url: "/dashboard/image" },
            { title: "Videos", url: "/dashboard/video" },
        ],
    },
    {
        title: "Creative Tools",
        url: "/dashboard/tools",
        icon: Bot,
        isActive: false,
        items: [
            {
                title: "Image Tools",
                url: "/dashboard/tools/image",
                icon: ImageIcon,
            },
            {
                title: "Video Tools",
                url: "/dashboard/tools/video",
                icon: Video,
            },
            {
                title: "Code Formatter",
                url: "/dashboard/tools/code",
                icon: Code,
            },
            {
                title: "Audio Tools",
                url: "/dashboard/tools/audio",
                icon: Music,
            },
            {
                title: "PDF Tools",
                url: "/dashboard/tools/pdf",
                icon: FileText,
            },
            {
                title: "QR Tool",
                url: "/dashboard/tools/qr",
                icon: QrCode,
            },
        ],
    },
    {
        title: "AI Models",
        url: "/dashboard/ai",
        icon: Bot,
        isActive: false,
        items: [
            { title: "Text Generation", url: "/dashboard/ai/text" },
            { title: "Image Generation", url: "/dashboard/ai/image" },
            { title: "Video Generation", url: "/dashboard/ai/video" },
            { title: "Speech & Audio", url: "/dashboard/ai/audio" },
            { title: "Prompt Library", url: "/dashboard/ai/prompts" },
        ],
    },
    {
        title: "Automation",
        url: "/dashboard/automation",
        icon: Frame,
        isActive: false,
        items: [
            { title: "Workflows", url: "/dashboard/automation/workflows" },
            { title: "Integrations", url: "/dashboard/automation/integrations" },
            { title: "Triggers", url: "/dashboard/automation/triggers" },
        ],
    },
    {
        title: "Documentation",
        url: "/dashboard/docs",
        icon: BookOpen,
        items: [
            { title: "Introduction", url: "/dashboard/docs/intro" },
            { title: "Quick Start", url: "/dashboard/docs/get-started" },
            { title: "API Reference", url: "/dashboard/docs/api" },
            { title: "CLI Guide", url: "/dashboard/docs/cli" },
            { title: "Changelog", url: "/dashboard/docs/changelog" },
        ],
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings2,
        items: [
            { title: "Account", url: "/dashboard/settings/account" },
            { title: "Billing", url: "/dashboard/settings/billing" },
            { title: "Workspace", url: "/dashboard/settings/workspace" },
            { title: "Limits", url: "/dashboard/settings/limits" },
        ],
    },
] */

// -----------------------------
// SECONDARY NAV
// -----------------------------
export const navSecondary: NavItem[] = [
    { title: "Support", url: "/support", icon: LifeBuoy },
    { title: "Feedback", url: "/dashboard/feedback", icon: Send },
    { title: "Community", url: "https://discord.gg/sR9bN3wW", icon: Map },
]

// -----------------------------
// PROJECTS
// -----------------------------
export const projects = [
    { name: "Image Toolkit", url: "/dashboard/projects/image-toolkit", icon: Frame },
    { name: "Video Editor", url: "/dashboard/projects/video-editor", icon: PieChart },
    { name: "Code Formatter Suite", url: "/dashboard/projects/code-suite", icon: Map },
]


/***{
        title: "Instagram Tools",
        url: "/dashboard/instagram",
        icon: Instagram,
        isActive: true,
        items: [
            { title: "Reel Downloader", url: "/dashboard/instagram/reel-downloader", icon: Video },
            { title: "Audio Downloader", url: "/dashboard/instagram/audio-downloader", icon: Music2 },
            { title: "Wall Preview", url: "/dashboard/instagram/wall-preview", icon: Grid },
            { title: "Test Upload Preview", url: "/dashboard/instagram/test-upload", icon: Upload },
            { title: "Hashtag Generator", url: "/dashboard/instagram/hashtag-generator", icon: Hash },
            { title: "Caption Generator", url: "/dashboard/instagram/caption-generator", icon: Type },
            { title: "Post Scheduler", url: "/dashboard/instagram/scheduler", icon: Calendar },
            { title: "Profile Analyzer", url: "/dashboard/instagram/analyzer", icon: BarChart3 },
        ],
    }, */