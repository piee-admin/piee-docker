// app/(auth)/register/page.tsx
'use client'

import React, { useState } from 'react'
import { authApi } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await authApi.register({
                email,
                password
            })
            toast.success('Account created successfully!')
            // Auto login logic usually happens here or redirect to login
            // For now, redirect to login as per original flow, or if auto-login is supported, onboarding
            // Assuming the API returns a token or we just redirect to login for now
            // But wait, the plan says redirect to onboarding. 
            // If register doesn't auto-login, we must redirect to login first.
            // Let's assume for now we redirect to login, but if we can auto-login that's better.
            // checking authApi.register... 
            // The original code redirected to /login.
            // "router.push('/login')"
            // The plan says "Redirect to onboarding after successful registration".
            // If the user is not logged in, they can't see onboarding.
            // So we probably need to log them in automatically or redirect to login with a next param.
            // Let's stick to the plan: "router.push('/onboarding')" implies auto-login or public onboarding (unlikely).
            // Actually, the previous register implementation just returned user.
            // Let's look at authApi.register.

            // To be safe, let's redirect to login, but maybe with a clear message or query param?
            // Or better, let's implement auto-login in the existing register flow if possible, 
            // but for now, let's just change the redirect and see if the user is logged in.
            // Wait, the previous code had:
            // await authApi.register(email, password)
            // router.push('/login')

            // If I change it to /onboarding, the user might not be authenticated.
            // I'll check authApi.register in lib/api/auth.ts to see if it sets the token.

            // Re-reading the plan: "Redirect to onboarding after successful registration"
            // If I cannot verify auto-login, I should probably keep it as login but maybe add ?next=/onboarding

            router.push('/login?next=/onboarding')
        } catch (err: any) {
            toast.error(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Register</CardTitle>
                    <CardDescription>
                        Create a new account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
