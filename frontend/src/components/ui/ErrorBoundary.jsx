"use client"

import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import Container from '../layout/Container';

/**
 * Компонент для обработки ошибок с улучшенным UX
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        
        // Логирование ошибки (можно отправить на сервер)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container className="py-12">
                    <div className="max-w-md mx-auto text-center space-y-6">
                        <div className="bg-red-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Что-то пошло не так
                            </h2>
                            <p className="text-gray-600">
                                Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                                onClick={this.handleRetry}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Попробовать снова
                            </Button>
                            
                            <Button 
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                На главную
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left bg-gray-100 p-4 rounded-lg text-sm">
                                <summary className="cursor-pointer font-medium">
                                    Детали ошибки (только для разработки)
                                </summary>
                                <pre className="mt-2 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
