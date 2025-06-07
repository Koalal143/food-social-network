"use client"

import { useSidebar } from '@/context/SidebarContext'

export default function MainContent({ children }) {
    const { isCollapsed } = useSidebar()

    return (
        <main className={`flex-1 pt-12 h-full pb-16 md:pb-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'md:pl-16' : 'md:pl-56'
        }`}>
            {children}
        </main>
    )
}
