import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                    <div className="text-center max-w-lg border border-white/10 rounded-2xl p-8 bg-[#0A051A]">
                        <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h1>
                        <p className="text-slate-400 mb-6 font-medium">
                            We encountered an error while loading this page.
                        </p>
                        <div className="bg-black/50 p-4 rounded text-left text-xs text-red-300 font-mono mb-6 overflow-auto max-h-60 border border-white/5">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-colors"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
