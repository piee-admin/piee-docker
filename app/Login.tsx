'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from './context/AuthContext';

type LoginProps = {
  onSuccess?: () => void; // optional callback
};

export default function Login({ onSuccess }: LoginProps) {
    const { signIn } = useAuth();

    const handleLogin = async () => {
        await signIn();
        if (onSuccess) onSuccess(); // close dialog & nav
    };
    return (
        <div className="bg-gradient-to-b from-muted to-background flex flex-col items-center justify-center px-4 py-12 md:py-20">
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
                PIEE Login
            </h1>
            <blockquote className="mt-6 border-l-2 pl-6 italic">
                &quot;After all,&quot; he said, &quot;everyone enjoys a good joke, so
                it&apos;s only fair that they should pay for the privilege.&quot;
            </blockquote>
            <div className='my-5'></div>
            <Button onClick={handleLogin}
                type="button"
                variant="outline"
                size="lg"
                className="w-full flex items-center gap-3"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 256 262"
                >
                    <path
                        fill="#4285f4"
                        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    />
                    <path
                        fill="#34a853"
                        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    />
                    <path
                        fill="#fbbc05"
                        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    />
                    <path
                        fill="#eb4335"
                        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    />
                </svg>
                <span>Continue with Google</span>
            </Button>
        </div>
    );
}