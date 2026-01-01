import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', title = '', duration = 4000) => {
        const id = Date.now() + Math.random();

        const titles = {
            success: title || 'Thành công!',
            error: title || 'Có lỗi xảy ra!',
            warning: title || 'Cảnh báo!',
            info: title || 'Thông báo'
        };

        setToasts((prev) => [...prev, { id, message, type, title: titles[type] }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((message, title) => addToast(message, 'success', title), [addToast]);
    const error = useCallback((message, title) => addToast(message, 'error', title), [addToast]);
    const warning = useCallback((message, title) => addToast(message, 'warning', title), [addToast]);
    const info = useCallback((message, title) => addToast(message, 'info', title), [addToast]);

    const value = { toasts, success, error, warning, info, removeToast };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onRemove }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <XCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getToastStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
            case 'error':
                return 'bg-gradient-to-r from-red-400 to-red-500';
            case 'warning':
                return 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900';
            default:
                return 'bg-gradient-to-r from-blue-400 to-blue-600';
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3.5 px-5 py-4 rounded-2xl text-white font-medium shadow-xl backdrop-blur-sm ${getToastStyles(toast.type)}`}
                    style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
                >
                    <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
                        {getIcon(toast.type)}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-[15px] mb-0.5">{toast.title}</div>
                        <div className="text-sm opacity-90">{toast.message}</div>
                    </div>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
