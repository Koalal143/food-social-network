"use client"

import { Copy, Check } from "lucide-react"
import { Button } from "./button"
import { useState } from "react"

export default function CopyLinkButton({ link, tooltipText }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Button
            variant="ghost"
            onClick={handleCopy}
            className="bg-background/80 backdrop-blur rounded-full p-2.5"
            title={copied ? "Скопировано!" : tooltipText}
            disabled={copied}
        >
            {copied ? (
                <Check className="w-5 h-5 text-green-600" />
            ) : (
                <Copy className="w-5 h-5" />
            )}
        </Button>
    )
} 