import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from "@/integrations/supabase/client";

export function TaxRobot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hi! I’m Timmy, your TaxTim assistant. Need help with SARS FIFO rules or your CSV upload?' }
    ]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // 🚀 Calls the Supabase Edge Function we created earlier
            const { data, error } = await supabase.functions.invoke('chat-with-timmy', {
                body: { message: input },
            });

            if (error) throw error;

            // Adds Timmy's real response to the chat
            const botMsg = { role: 'bot', content: data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error("AI Brain Error:", err);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Sorry, I'm having trouble connecting to my brain. Please check your internet or try again in a moment!"
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        // High z-index ensures it sits ON TOP of the dashboard and header
        <div className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4"
                    >
                        <Card className="w-[350px] sm:w-[380px] h-[500px] shadow-2xl border-none flex flex-col overflow-hidden rounded-[2rem] bg-white">
                            {/* Header: Deep Teal */}
                            <div className="bg-[#017792] p-5 flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-xl">
                                        <Bot size={22} />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm tracking-tight">Timmy AI</p>
                                        <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Tax Assistant</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/10 text-white rounded-full">
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* Chat Body: Off-White */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F8F8]">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium shadow-sm ${msg.role === 'user'
                                                ? "bg-[#8C9F8B] text-white rounded-tr-none"
                                                : "bg-white text-[#664A48] border border-[#A6DDDF]/30 rounded-tl-none"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-[#A6DDDF]/30 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                            <Loader2 className="h-4 w-4 animate-spin text-[#017792]" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input: White */}
                            <div className="p-4 bg-white border-t border-[#F8F8F8] flex gap-2">
                                <Input
                                    placeholder="Ask about SARS FIFO..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="rounded-xl border-[#A6DDDF] focus:border-[#017792] focus:ring-0 bg-[#F8F8F8]"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={isTyping || !input.trim()}
                                    className="bg-[#017792] hover:bg-[#015f75] rounded-xl px-4 shadow-lg active:scale-90 transition-transform"
                                >
                                    <Send size={18} className="text-white" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-16 w-16 bg-[#017792] text-white rounded-2xl flex items-center justify-center shadow-[0_15px_30px_-5px_rgba(1,119,146,0.4)] transition-all relative"
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}

                {/* Pulsating Notification Dot */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-[#059669] border-2 border-white"></span>
                    </span>
                )}
            </motion.button>
        </div>
    );
}