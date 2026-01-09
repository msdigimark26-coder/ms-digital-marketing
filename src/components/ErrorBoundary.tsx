import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to console for debugging
        console.error('❌ Error Boundary Caught:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });

        this.setState({ errorInfo });

        // TODO: Send to error tracking service in production
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        window.location.href = '/';
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const isDevelopment = import.meta.env.DEV;

            return (
                <div className="min-h-screen flex items-center justify-center bg-[#05030e] px-4">
                    <div className="max-w-2xl w-full text-center">
                        {/* Error Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Oops! Something went wrong
                        </h1>

                        {/* Error Description */}
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            We encountered an unexpected error. Don't worry, our team has been notified and we're working on it.
                        </p>

                        {/* Development Mode - Show Error Details */}
                        {isDevelopment && this.state.error && (
                            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-left max-h-96 overflow-auto">
                                <h3 className="text-red-400 font-bold mb-3 text-lg">
                                    🔧 Development Error Details:
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-red-300 font-semibold mb-1">Error Message:</p>
                                        <p className="text-red-200 font-mono text-sm bg-black/30 p-3 rounded">
                                            {this.state.error.message}
                                        </p>
                                    </div>
                                    {this.state.error.stack && (
                                        <div>
                                            <p className="text-red-300 font-semibold mb-1">Stack Trace:</p>
                                            <pre className="text-red-200 font-mono text-xs bg-black/30 p-3 rounded overflow-auto max-h-48">
                                                {this.state.error.stack}
                                            </pre>
                                        </div>
                                    )}
                                    {this.state.errorInfo?.componentStack && (
                                        <div>
                                            <p className="text-red-300 font-semibold mb-1">Component Stack:</p>
                                            <pre className="text-red-200 font-mono text-xs bg-black/30 p-3 rounded overflow-auto max-h-32">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Production Mode - Generic Message */}
                        {!isDevelopment && (
                            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-blue-300 text-sm">
                                    <strong>Error ID:</strong> {Date.now().toString(36).toUpperCase()}
                                </p>
                                <p className="text-blue-300 text-sm mt-2">
                                    Please share this ID with support if the issue persists.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleGoHome}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-purple-500/50"
                            >
                                <Home className="w-5 h-5" />
                                Go to Homepage
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors border border-white/10 font-semibold text-lg"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="mt-8 text-sm text-slate-500">
                            If the problem continues, please contact us at{' '}
                            <a
                                href="mailto:msdigimark26@gmail.com"
                                className="text-purple-400 hover:text-purple-300 underline"
                            >
                                msdigimark26@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
