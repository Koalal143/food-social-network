"use client"

import { useState, useEffect } from 'react';
import { Input } from './input';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Компонент Input с валидацией в реальном времени
 * Улучшает UX при заполнении форм
 */
export default function ValidatedInput({
    value,
    onChange,
    onValidation,
    validationRules = [],
    debounceMs = 300,
    className,
    showValidationIcon = true,
    ...props
}) {
    const [validationState, setValidationState] = useState({
        isValid: null,
        isValidating: false,
        errors: [],
        warnings: []
    });

    const [debouncedValue, setDebouncedValue] = useState(value);

    // Debounce value changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [value, debounceMs]);

    // Validate when debounced value changes
    useEffect(() => {
        if (debouncedValue === undefined || debouncedValue === null) return;

        const validateAsync = async () => {
            setValidationState(prev => ({ ...prev, isValidating: true }));

            const errors = [];
            const warnings = [];

            for (const rule of validationRules) {
                try {
                    const result = await rule.validate(debouncedValue);
                    if (!result.isValid) {
                        if (result.severity === 'warning') {
                            warnings.push(result.message);
                        } else {
                            errors.push(result.message);
                        }
                    }
                } catch (error) {
                    errors.push('Ошибка валидации');
                }
            }

            const isValid = errors.length === 0;
            const newState = {
                isValid,
                isValidating: false,
                errors,
                warnings
            };

            setValidationState(newState);
            
            if (onValidation) {
                onValidation(newState);
            }
        };

        validateAsync();
    }, [debouncedValue, validationRules, onValidation]);

    const getValidationIcon = () => {
        if (!showValidationIcon || !debouncedValue) return null;

        if (validationState.isValidating) {
            return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        }

        if (validationState.isValid === true) {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }

        if (validationState.isValid === false) {
            return <AlertCircle className="w-4 h-4 text-red-500" />;
        }

        return null;
    };

    const getInputClassName = () => {
        let baseClass = className || 'bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white transition-colors';

        if (validationState.isValid === true) {
            baseClass += ' border-green-500 focus:border-green-500 focus:ring-green-500';
        } else if (validationState.isValid === false) {
            baseClass += ' border-red-500 focus:border-red-500 focus:ring-red-500';
        }

        return baseClass;
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    {...props}
                    value={value}
                    onChange={onChange}
                    className={cn(getInputClassName(), showValidationIcon && debouncedValue && 'pr-10')}
                />
                
                {showValidationIcon && debouncedValue && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getValidationIcon()}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {validationState.errors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                    >
                        {validationState.errors.map((error, index) => (
                            <motion.p
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm text-red-600 flex items-center space-x-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                <span>{error}</span>
                            </motion.p>
                        ))}
                    </motion.div>
                )}

                {validationState.warnings.length > 0 && validationState.errors.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                    >
                        {validationState.warnings.map((warning, index) => (
                            <motion.p
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm text-yellow-600 flex items-center space-x-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                <span>{warning}</span>
                            </motion.p>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Предустановленные правила валидации
 */
export const ValidationRules = {
    required: (message = 'Поле обязательно для заполнения') => ({
        validate: async (value) => ({
            isValid: value && value.toString().trim().length > 0,
            message,
            severity: 'error'
        })
    }),

    minLength: (min, message) => ({
        validate: async (value) => ({
            isValid: !value || value.toString().length >= min,
            message: message || `Минимум ${min} символов`,
            severity: 'error'
        })
    }),

    maxLength: (max, message) => ({
        validate: async (value) => ({
            isValid: !value || value.toString().length <= max,
            message: message || `Максимум ${max} символов`,
            severity: 'error'
        })
    }),

    email: (message = 'Введите корректный email') => ({
        validate: async (value) => {
            if (!value) return { isValid: true };
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return {
                isValid: emailRegex.test(value),
                message,
                severity: 'error'
            };
        }
    }),

    strongPassword: (message = 'Пароль должен содержать минимум 8 символов, включая цифры и буквы') => ({
        validate: async (value) => {
            if (!value) return { isValid: true };
            const hasMinLength = value.length >= 8;
            const hasNumbers = /\d/.test(value);
            const hasLetters = /[a-zA-Z]/.test(value);
            return {
                isValid: hasMinLength && hasNumbers && hasLetters,
                message,
                severity: 'error'
            };
        }
    })
};
