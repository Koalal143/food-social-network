"use client"

import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Компонент для загрузки файлов с прогрессом
 * Улучшает UX при загрузке изображений
 */
export default function FileUploadProgress({
    onFileSelect,
    accept = "image/*",
    maxSize = 5 * 1024 * 1024, // 5MB
    className = "",
    children
}) {
    const [uploadState, setUploadState] = useState({
        isUploading: false,
        progress: 0,
        error: null,
        success: false
    });

    const handleFileSelect = useCallback(async (file) => {
        if (!file) return;

        // Валидация типа файла
        const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            setUploadState({
                isUploading: false,
                progress: 0,
                error: 'Разрешены только PNG, JPG и JPEG файлы',
                success: false
            });
            return;
        }

        // Валидация размера файла
        if (file.size > maxSize) {
            setUploadState({
                isUploading: false,
                progress: 0,
                error: `Файл слишком большой. Максимальный размер: ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
                success: false
            });
            return;
        }

        setUploadState({
            isUploading: true,
            progress: 0,
            error: null,
            success: false
        });

        try {
            // Симуляция прогресса загрузки
            const progressInterval = setInterval(() => {
                setUploadState(prev => ({
                    ...prev,
                    progress: Math.min(prev.progress + Math.random() * 30, 90)
                }));
            }, 200);

            await onFileSelect(file);

            clearInterval(progressInterval);
            setUploadState({
                isUploading: false,
                progress: 100,
                error: null,
                success: true
            });

            // Сброс состояния через 2 секунды
            setTimeout(() => {
                setUploadState({
                    isUploading: false,
                    progress: 0,
                    error: null,
                    success: false
                });
            }, 2000);

        } catch (error) {
            setUploadState({
                isUploading: false,
                progress: 0,
                error: error.message || 'Ошибка при загрузке файла',
                success: false
            });
        }
    }, [onFileSelect, maxSize]);

    const clearError = () => {
        setUploadState(prev => ({ ...prev, error: null }));
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {children ? (
                <div className="relative">
                    {children}
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadState.isUploading}
                    />
                </div>
            ) : (
                <div className="relative">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-32 border-dashed border-2 hover:border-primary/50 transition-colors"
                        disabled={uploadState.isUploading}
                    >
                        <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Нажмите для выбора файла
                            </span>
                        </div>
                    </Button>
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadState.isUploading}
                    />
                </div>
            )}

            <AnimatePresence>
                {uploadState.isUploading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Загрузка...</span>
                            <span className="text-muted-foreground">{Math.round(uploadState.progress)}%</span>
                        </div>
                        <Progress value={uploadState.progress} className="h-2" />
                    </motion.div>
                )}

                {uploadState.success && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center space-x-2 text-green-600 text-sm"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Файл успешно загружен</span>
                    </motion.div>
                )}

                {uploadState.error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3"
                    >
                        <div className="flex items-center space-x-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{uploadState.error}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearError}
                            className="text-red-600 hover:text-red-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
