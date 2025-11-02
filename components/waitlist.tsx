import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";


// Using Shadcn Sonner for toast notifications

import { TextEffect } from '@/components/motion-primitives/text-effect';
import { TextLoop } from "./motion-primitives/text-loop";

const Waitlist = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    /*const count = useWaitlistCount();*/


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        // Check for duplicate
        const { data: existing } = await supabase
            .from("waitlist")
            .select("*")
            .eq("email", email)
            .single();

        if (existing) {
            toast.error("☠️ This email is already on the waitlist!", {
                style: {
                    fontSize: "1.125rem",
                    padding: "1rem 1.5rem",
                    minWidth: "20rem",
                    borderRadius: "0.75rem",
                }
            });
            setLoading(false);
            return;
        }

        // Insert email
        const { error } = await supabase
            .from("waitlist")
            .insert([{ email, created_at: new Date().toISOString() }]);

        if (error) {
            console.error(error);
            toast.error("🤔 Something went wrong. Please try again.", {
                style: {
                    fontSize: "1.125rem",
                    padding: "1rem 1.5rem",
                    minWidth: "20rem",
                    borderRadius: "0.75rem",
                }
            });
        } else {
            setSubmitted(true);
            toast.success("🎉 You’re now on the waitlist!", {
                description: "We’ve added you successfully.",
                style: {
                    fontSize: "1.125rem",   // larger text
                    padding: "1rem 1.5rem", // bigger padding
                    minWidth: "20rem",      // wider toast
                    borderRadius: "0.75rem",// rounded corners
                }
            });
            setEmail("");
        }

        setLoading(false);
    };

    return (
        <section id="waitlist" className="py-48 sm:py-72 bg-muted/10 ">
            <div className="container mx-auto max-w-xl text-center relative p-8 sm:p-0 ">
                <div
                    className={cn(
                        "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
                    )}
                >
                    <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                        <span>✨ Magic Comming Soon</span>
                        <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                    </AnimatedShinyText>
                </div>
                <h2 className="mt-10 text-4xl md:text-5xl font-bold tracking-tight leading-tight bg-clip-text bg-gradient-to-r text-foreground">
                    <span className="flex flex-col whitespace-pre-wrap text-3xl  md:text-6xl">
                        Beautiful Prompts for{' '}
                    </span>
                    <span aria-live="polite">
                        <TextLoop
                            className="overflow-hidden"
                            transition={{ type: 'spring', stiffness: 900, damping: 80, mass: 10 }}
                            variants={{
                                initial: { y: 10, rotateX: 45, opacity: 0, filter: 'blur(2px)' },
                                animate: { y: 0, rotateX: 0, opacity: 1, filter: 'blur(0px)' },
                                exit: { y: -10, rotateX: -45, opacity: 0, filter: 'blur(2px)' },
                            }}
                        >
                            <span className="text-3xl md:text-5xl">Founders</span>
                            <span className="text-3xl md:text-5xl">Developers</span>
                            <span className="text-3xl md:text-5xl">Designers</span>
                            <span className="text-3xl md:text-5xl">Design Engineers</span>
                        </TextLoop>
                    </span>
                </h2>


                <div className="mt-1 text-muted-foreground text-xs sm:text-xl text-center">
                    <TextEffect per="char" preset="fade" aria-hidden="true">
                        First 1000 signups receive exclusive beta access.
                    </TextEffect>
                    <span className="sr-only">
                        First 1000 signups receive exclusive beta access.
                    </span>
                </div>



                {!submitted ? (
                    <form
                        onSubmit={handleSubmit}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Input
                            type="email"
                            placeholder="Your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full sm:w-auto py-4 px-6 text-lg rounded-lg"
                        />
                        <Button
                            type="submit"
                            size="lg"
                            className="px-8 py-4 font-semibold text-base sm:text-lg"
                            disabled={loading}
                        >
                            {loading ? "Joining..." : "Join Waitlist"}
                        </Button>
                    </form>
                ) : (
                    <div className="flex justify-center mt-10">
                        <Alert className="max-w-xl w-full flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4 shadow-sm animate-fadeIn">
                            <CheckCircle2Icon className="h-6 w-6 text-primary animate-bounce" />
                            <AlertDescription className="text-primary font-medium text-lg">
                                You&#39;re on the list. Welcome to the future. ✨
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {/**<div className="mt-6 text-sm text-muted-foreground">
                    {count !== null ? (
                        <>
                            <span className="font-medium text-primary">{count}</span> of 1000 early access spots already claimed.
                        </>
                    ) : (
                        <>Loading spots claimed...</>
                    )}
                </div> */}
            </div>
        </section>


    );
};

export default Waitlist;


/*             <div className="hidden sm:block absolute inset-0 rounded-md">
  <BorderTrail
  className="bg-violet-700"
    style={{
      padding: '20px', // increased from 6px
      boxShadow: `
        0 0 60px 30px rgba(142, 81, 255, 0.5), 
        0 0 100px 60px rgba(142, 81, 255, 0.25),
        0 0 140px 90px rgba(142, 81, 255, 0.15)
      `,
    }}
    size={60} // you can reduce this slightly if needed
  />
</div>*/