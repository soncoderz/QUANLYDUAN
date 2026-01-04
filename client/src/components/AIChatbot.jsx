import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import api from '../services/api';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load suggestions when chat opens
    useEffect(() => {
        if (isOpen && suggestions.length === 0) {
            loadSuggestions();
            // Add welcome message if no messages
            if (messages.length === 0) {
                setMessages([{
                    role: 'assistant',
                    content: 'Xin chào!  Tôi là trợ lý AI của Healthcare Booking. Tôi có thể giúp bạn:\n\n Xem lịch khám của bạn\n Tìm phòng khám\n Tư vấn sức khỏe cơ bản\n\nBạn cần hỗ trợ gì?',
                    timestamp: new Date().toISOString()
                }]);
            }
        }
    }, [isOpen]);

    const loadSuggestions = async () => {
        try {
            const response = await api.get('/ai/suggestions');
            if (response.data.success) {
                setSuggestions(response.data.data);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    };

    const sendMessage = async (text) => {
        const messageToSend = text || message.trim();
        if (!messageToSend || loading) return;

        // Add user message
        const userMessage = {
            role: 'user',
            content: messageToSend,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            // Build history for context
            const history = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await api.post('/ai/chat', {
                message: messageToSend,
                history
            });

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.data.message,
                    timestamp: response.data.data.timestamp
                }]);
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('AI Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                timestamp: new Date().toISOString(),
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen
                        ? 'bg-gray-600 hover:bg-gray-700 rotate-90'
                        : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 animate-pulse hover:animate-none'
                    }`}
                style={{ boxShadow: isOpen ? '' : '0 4px 20px rgba(14, 165, 233, 0.4)' }}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                        height: '520px',
                        animation: 'slideUp 0.3s ease-out forwards',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">AI Assistant</h3>
                                <p className="text-xs text-white/80">Healthcare Booking</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="text-xs text-white/80">Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="h-[340px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user'
                                        ? 'bg-blue-500'
                                        : 'bg-gradient-to-br from-blue-500 to-teal-500'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-md'
                                        : msg.isError
                                            ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-md'
                                            : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 1 && suggestions.length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {suggestions.slice(0, 3).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => sendMessage(suggestion)}
                                        disabled={loading}
                                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi của bạn..."
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={loading || !message.trim()}
                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-teal-600 transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
