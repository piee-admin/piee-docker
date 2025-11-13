"use client"

import { useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { motion } from "framer-motion"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Download, Image as ImageIcon, Sparkles } from "lucide-react"

export default function QRGeneratorPage() {
  const [text, setText] = useState("")
  const [qrValue, setQrValue] = useState("")
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [logo, setLogo] = useState<string | null>(null)

  const handleGenerate = () => {
    if (!text.trim()) return
    setQrValue(text.trim())
  }

  const handleDownload = () => {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const url = (canvas as HTMLCanvasElement).toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "qrcode.png"
    a.click()
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogo(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen from-background via-muted to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        <Card className="shadow-2xl border border-border/40 bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight flex items-center justify-center gap-2">
              QR Code Generator
            </CardTitle>
            <CardDescription>
              Create beautiful, custom QR codes instantly. This is test
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* === LEFT SIDE: FORM === */}
            <div className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleGenerate()
                }}
                className="flex flex-col gap-3"
              >
                <Label className="text-sm text-muted-foreground">
                  Enter Text or URL
                </Label>
                <Input
                  placeholder="e.g. https://xyz.com"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="bg-muted/50 border-border/60 focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <Button
                  onClick={handleGenerate}
                  className="mt-2 w-full font-medium tracking-wide"
                >
                  Generate QR
                </Button>
              </form>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Foreground
                  </Label>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-12 h-12 rounded-md border cursor-pointer"
                  />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Background
                  </Label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-12 h-12 rounded-md border cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <Label className="text-sm text-muted-foreground">
                  Upload Logo (optional)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                  <ImageIcon className="text-muted-foreground" />
                </div>

                {logo && (
                  <img
                    src={logo}
                    alt="Logo preview"
                    className="w-16 h-16 rounded-md shadow border mt-2"
                  />
                )}
              </div>
            </div>

            {/* === RIGHT SIDE: QR PREVIEW === */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 p-6 border-l border-border/40"
            >
              <div className="p-4 bg-white rounded-xl shadow-inner border relative">
                <QRCodeCanvas
                  value={qrValue || "https://example.com"}
                  size={240}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  includeMargin={true}
                  level="H"
                  imageSettings={
                    logo
                      ? {
                          src: logo,
                          height: 50,
                          width: 50,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleDownload}
                disabled={!qrValue}
                className="flex items-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" /> Download QR
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
