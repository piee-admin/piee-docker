'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, User, Building2, Key, FileText, ArrowRight, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getToken } from "@/lib/auth/session"

const ONBOARDING_STEPS = [
    {
        id: 1,
        title: "Complete Profile",
        description: "Tell us about yourself",
        icon: User
    },
    {
        id: 2,
        title: "Setup Workspace",
        description: "Name your organization",
        icon: Building2
    },
    {
        id: 3,
        title: "Add Provider Keys",
        description: "Connect AI providers (BYOK)",
        icon: Key
    },
    {
        id: 4,
        title: "Create First Prompt",
        description: "Build your first AI prompt",
        icon: FileText
    }
]

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        role: '',
        orgName: '',
        orgId: ''
    })

    useEffect(() => {
        const fetchStatus = async () => {
            // ... existing status fetch ...
            // Also fetch organizations to get the default one
            try {
                const token = getToken()
                if (!token) return

                // Fetch Onboarding Status
                const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/status`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (statusRes.ok) {
                    const data = await statusRes.json()
                    if (data.completed) {
                        router.push('/dashboard/overview')
                        return
                    }

                    let step = data.current_step
                    if (step === 0) step = 1
                    else step = step + 1
                    if (step > 4) step = 4
                    setCurrentStep(step)
                }

                // Fetch Organizations
                const orgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (orgRes.ok) {
                    const orgs = await orgRes.json()
                    if (orgs.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            orgId: orgs[0].id,
                            orgName: orgs[0].name
                        }))
                    }
                }

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
    }, [router])

    const progress = (currentStep / 4) * 100

    const handleCompleteProfile = async () => {
        if (!formData.fullName.trim()) {
            setError('Full name is required')
            return
        }

        setLoading(true)
        setError('')

        try {
            const token = getToken()
            // ... complete user profile ...
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/complete-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    company_name: formData.companyName || null,
                    role: formData.role || null
                })
            })

            if (response.ok) {
                // If company name was provided, pre-fill org name if generic
                if (formData.companyName) {
                    setFormData(prev => ({
                        ...prev,
                        orgName: prev.orgName.includes("'s Organization") ? formData.companyName : prev.orgName
                    }))
                }
                setCurrentStep(2)
            } else {
                const data = await response.json()
                setError(data.detail || 'Failed to complete profile')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateOrganization = async () => {
        if (!formData.orgName.trim()) {
            setError('Workspace name is required')
            return
        }
        if (!formData.orgId) {
            setError('No organization found to update')
            return
        }

        setLoading(true)
        try {
            const token = getToken()

            // 1. Update Org Name
            const orgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${formData.orgId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: formData.orgName })
            })

            if (!orgRes.ok) throw new Error('Failed to update workspace')

            // 2. Update Onboarding Step
            const stepRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/update-step`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ step: 2 })
            })

            if (stepRes.ok) {
                setCurrentStep(3)
            }
        } catch (err) {
            console.error(err)
            setError('Failed to setup workspace')
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = async () => {
        // Step 2 is now mandatory, so skipping is only for other steps?
        // Actually, handleSkip is used by Step 1, 3, 4.
        if (currentStep === 2) return // Should not happen as button removed

        setLoading(true)
        try {
            const token = getToken()
            // If skipping from Step 1, we might need to assume Org step is implicitly done? 
            // The user requirement says "must have organization". 
            // So we should NOT allow skipping Step 2.
            // If they skip from step 1, where do they go? Step 2?
            // "Skip for now" on Step 1 usually implies "Skip Profile" but maybe not Org.
            // I'll update logic: 
            // If Step 1 skipped -> Go to Step 2.
            // If Step 3/4 skipped -> Go to Dashboard.

            if (currentStep === 1) {
                setCurrentStep(2)
                setLoading(false)
                return
            }

            // For Step 3/4
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/skip-onboarding`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            router.push('/dashboard/overview')
        } catch (err) {
            console.error(err)
            router.push('/dashboard/overview')
        } finally {
            setLoading(false)
        }
    }

    const handleContinueToProviderKeys = () => {
        // This function was used by old Step 2 "Continue" button
        // Replaced by handleUpdateOrganization
        setCurrentStep(3)
    }

    const handleGoToProviderKeys = () => {
        router.push('/dashboard/settings/providers?onboarding=true')
    }

    const handleGoToPrompts = () => {
        router.push('/dashboard/prompts?onboarding=true')
    }

    const handleCompleteOnboarding = async () => {
        setLoading(true)
        try {
            const token = getToken()
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/complete-onboarding`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            router.push('/dashboard/overview')
        } catch (err) {
            console.error('Failed to complete onboarding:', err)
            router.push('/dashboard/overview')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <Card className="w-full max-w-3xl shadow-2xl">
                <CardHeader className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">Welcome to PIEE! 🚀</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Let's get you set up in just a few steps. This will only take a minute.
                    </CardDescription>
                    <Progress value={progress} className="mt-4 h-2" />
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Step indicators */}
                    <div className="grid grid-cols-4 gap-2">
                        {ONBOARDING_STEPS.map((step) => {
                            const StepIcon = step.icon
                            const isComplete = currentStep > step.id
                            const isCurrent = currentStep === step.id

                            return (
                                <div key={step.id} className="flex flex-col items-center text-center">
                                    <div className={`
                    flex h-12 w-12 items-center justify-center rounded-full mb-2 transition-all
                    ${isComplete ? 'bg-green-500 text-white' :
                                            isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                                                'bg-muted text-muted-foreground'}
                  `}>
                                        {isComplete ? (
                                            <CheckCircle2 className="h-6 w-6" />
                                        ) : (
                                            <StepIcon className="h-6 w-6" />
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Step content */}
                    <div className="min-h-[300px]">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Tell us about yourself</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        This helps us personalize your experience
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input
                                            id="fullName"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="John Doe"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="companyName">Company Name (Optional)</Label>
                                        <Input
                                            id="companyName"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            placeholder="Acme Inc."
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="role">Your Role (Optional)</Label>
                                        <Input
                                            id="role"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            placeholder="Software Engineer"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleCompleteProfile}
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Continue'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleSkip}
                                        disabled={loading}
                                    >
                                        Skip for now
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Setup Your Workspace</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        This will be your team's home base. You can invite members later.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="orgName">Workspace Name *</Label>
                                        <Input
                                            id="orgName"
                                            value={formData.orgName}
                                            onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                            placeholder="My Awesome Team"
                                            className="mt-1"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This will be the name of your default organization.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleUpdateOrganization}
                                        className="flex-1"
                                        disabled={loading}
                                    >
                                        {loading ? 'Setting up...' : 'Create Workspace'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    {/* Step 2 is mandatory for organization setup, no skip */}
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Add Your Provider Keys (BYOK)</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Securely connect your AI provider API keys. We use AES-256 encryption to keep them safe.
                                    </p>
                                </div>

                                <Alert>
                                    <Key className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Bring Your Own Key (BYOK):</strong> Your API keys are encrypted at rest and never leave your control.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-1">Supported Providers:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• OpenAI (GPT-4, GPT-3.5)</li>
                                            <li>• Anthropic (Claude)</li>
                                            <li>• Google AI (Gemini)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleGoToProviderKeys}
                                        className="flex-1"
                                    >
                                        Add Provider Keys
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(4)}
                                    >
                                        Skip for now
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Create Your First Prompt</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Prompts are versioned templates that you can execute via API or the dashboard.
                                    </p>
                                </div>

                                <Alert>
                                    <FileText className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Pro Tip:</strong> Use variables like {`{{name}}`} in your prompts for dynamic content.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    <div className="p-4 border rounded-lg bg-muted/30">
                                        <h4 className="font-medium mb-2">What you can do with prompts:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Version control for AI prompts</li>
                                            <li>• Execute via REST API</li>
                                            <li>• Track usage and costs</li>
                                            <li>• A/B test different versions</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleGoToPrompts}
                                        className="flex-1"
                                    >
                                        Create First Prompt
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCompleteOnboarding}
                                        disabled={loading}
                                    >
                                        {loading ? 'Finishing...' : 'Finish Setup'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress footer */}
                    <div className="pt-6 border-t">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Step {currentStep} of 4</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSkip}
                                disabled={loading}
                            >
                                Skip all and go to dashboard
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
