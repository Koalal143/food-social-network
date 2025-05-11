"use client"

import { Copy } from "lucide-react"
import { Button } from "./button"
import { useToast } from "@/hooks/use-toast"

export default function CopyLinkButton({ link, tooltipText }) {
    const { toast } = useToast()

    const handleCopy = () => {
        navigator.clipboard.writeText(link)
        toast({
            title: "Ссылка скопирована",
            description: "Ссылка успешно скопирована в буфер обмена"
        })
    }

    return (
        <Button
            variant="ghost"
            onClick={handleCopy}
            className="bg-background/80 backdrop-blur rounded-full p-2.5"
            title={tooltipText}
        >
            <Copy className="w-5 h-5" />
        </Button>
    )
} 