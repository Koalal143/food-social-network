"use client"

import { Copy } from "lucide-react"
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
        <button 
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={tooltipText}
        >
            <Copy className="h-5 w-5 text-gray-600" />
        </button>
    )
} 