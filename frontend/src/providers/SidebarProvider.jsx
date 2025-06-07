"use client"

import { useState, useEffect, useMemo } from 'react'
import { SidebarContext } from '@/context/SidebarContext'

const SIDEBAR_STORAGE_KEY = 'sidebar_collapsed'

export default function SidebarProvider({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Загружаем состояние из localStorage при инициализации
    useEffect(() => {
        const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY)
        if (savedState !== null) {
            setIsCollapsed(savedState === 'true')
        }
    }, [])

    // Сохраняем состояние в localStorage при изменении
    useEffect(() => {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, isCollapsed.toString())
    }, [isCollapsed])

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev)
    }

    const collapseSidebar = () => {
        setIsCollapsed(true)
    }

    const expandSidebar = () => {
        setIsCollapsed(false)
    }

    const contextValue = useMemo(() => ({
        isCollapsed,
        toggleSidebar,
        collapseSidebar,
        expandSidebar
    }), [isCollapsed])

    return (
        <SidebarContext.Provider value={contextValue}>
            {children}
        </SidebarContext.Provider>
    )
}
