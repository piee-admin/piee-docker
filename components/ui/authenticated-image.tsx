"use client";

import React, { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

interface AuthenticatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
}

export function AuthenticatedImage({ src, className, ...props }: AuthenticatedImageProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) return;

        let objectUrl: string | null = null;
        const fetchImage = async () => {
            try {
                const token = getToken();
                const response = await fetch(src, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to load image");

                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                setImgSrc(objectUrl);
                setError(false);
            } catch (err) {
                console.error("AuthenticatedImage error:", err);
                setError(true);
            }
        };

        fetchImage();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [src]);

    if (error || !imgSrc) {
        return (
            <div className={cn("bg-muted flex items-center justify-center", className)}>
                {error ? "FAIL" : "..."}
            </div>
        );
    }

    return <img src={imgSrc} className={className} {...props} />;
}
