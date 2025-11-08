import { LoaderIcon } from "lucide-react"
import Image, { StaticImageData } from "next/image"

import { cn } from "@/lib/utils"

interface SpinnerPieeProps extends React.HTMLAttributes<HTMLImageElement> {
  src?: string | StaticImageData
}


export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export function SpinnerPiee({
  src = "/images/logo.png", // ✅ default static path
  className,
  ...props
}: SpinnerPieeProps) {
  return (
    <Image
      src={src}
      alt="Loading..."
      width={48}
      height={48}
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      {...props}
    />
  )
}


export function SpinnerCustom() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
    </div>
  )
}
