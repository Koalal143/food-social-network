"use client"

import { Copy, Check } from "lucide-react"
import { Button } from "./button"
import { useState } from "react"

export default function CopyLinkButton({
    link,
    tooltipText,
    trigger,
    variant = "outline",
    size = "sm",
    className = "",
    showText = false
}) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (trigger) {
        return (
            <div onClick={handleCopy} title={copied ? "Скопировано!" : tooltipText}>
                {trigger}
            </div>
        )
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={`gap-1.5 ${className}`}
            title={copied ? "Скопировано!" : tooltipText}
            disabled={copied}
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
                <Copy className="w-3.5 h-3.5" />
            )}
            {showText && (
                <span className="text-xs font-medium">
                    {copied ? "Скопировано!" : "Поделиться"}
                </span>
            )}
        </Button>
    )
}