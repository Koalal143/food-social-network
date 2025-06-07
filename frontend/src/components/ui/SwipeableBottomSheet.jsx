"use client"

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './button';

/**
 * Компонент выдвижной панели снизу с поддержкой жестов
 * Улучшает мобильный UX
 */
export default function SwipeableBottomSheet({
    isOpen,
    onClose,
    title,
    children,
    snapPoints = [0.3, 0.6, 0.9], // Точки привязки (доли от высоты экрана)
    initialSnapPoint = 0.6,
    className = ""
}) {
    const [currentSnapPoint, setCurrentSnapPoint] = useState(initialSnapPoint);
    const [isDragging, setIsDragging] = useState(false);
    const constraintsRef = useRef(null);

    const handleDragEnd = (event, info) => {
        setIsDragging(false);
        
        const velocity = info.velocity.y;
        const offset = info.offset.y;
        const windowHeight = window.innerHeight;
        
        // Если быстро свайпнули вниз - закрываем
        if (velocity > 500) {
            onClose();
            return;
        }
        
        // Если быстро свайпнули вверх - переходим к максимальной точке
        if (velocity < -500) {
            setCurrentSnapPoint(Math.max(...snapPoints));
            return;
        }
        
        // Находим ближайшую точку привязки
        const currentPosition = 1 - (offset / windowHeight);
        const closestSnapPoint = snapPoints.reduce((prev, curr) => 
            Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev
        );
        
        // Если тянем ниже минимальной точки - закрываем
        if (closestSnapPoint < Math.min(...snapPoints)) {
            onClose();
        } else {
            setCurrentSnapPoint(closestSnapPoint);
        }
    };

    const getSheetHeight = () => {
        return `${currentSnapPoint * 100}vh`;
    };

    useEffect(() => {
        if (isOpen) {
            setCurrentSnapPoint(initialSnapPoint);
        }
    }, [isOpen, initialSnapPoint]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={constraintsRef}
                        initial={{ y: "100%" }}
                        animate={{ y: `${(1 - currentSnapPoint) * 100}%` }}
                        exit={{ y: "100%" }}
                        transition={{ 
                            type: "spring", 
                            damping: 30, 
                            stiffness: 300,
                            duration: isDragging ? 0 : undefined
                        }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: window.innerHeight }}
                        dragElastic={0.1}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                        className={`fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl z-50 ${className}`}
                        style={{ height: getSheetHeight() }}
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold">{title}</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {children}
                        </div>

                        {/* Snap Point Indicators */}
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-2">
                            {snapPoints.map((point, index) => (
                                <button
                                    key={point}
                                    onClick={() => setCurrentSnapPoint(point)}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                        Math.abs(currentSnapPoint - point) < 0.05
                                            ? 'bg-primary'
                                            : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Хук для управления состоянием Bottom Sheet
 */
export function useBottomSheet(initialState = false) {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen(prev => !prev);

    return {
        isOpen,
        open,
        close,
        toggle
    };
}
