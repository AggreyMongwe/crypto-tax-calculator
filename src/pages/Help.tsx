import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Download, PieChart, AlertTriangle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function Help() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in duration-700">

            {/* Header Section */}
            <div className="text-center mb-12 space-y-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto w-16 h-16 bg-[#A6DDDF]/30 rounded-2xl flex items-center justify-center text-[#017792]"
                >
                    <HelpCircle size={32} />
                </motion.div>
                <div>
                    <h1 className="text-4xl font-black text-[#664A48] tracking-tight">How can we help?</h1>
                    <p className="text-[#017792] font-bold uppercase tracking-widest text-xs mt-2">Support & User Guide</p>
                </div>
                <div className="mx-auto w-12 h-1 bg-[#017792] rounded-full" />
            </div>

            {/* Help Items Grid */}
            <div className="space-y-6">
                <HelpItem
                    icon={<Download size={20} />}
                    title="📥 How to add transactions"
                    content={
                        <div className="space-y-2">
                            <p>Copy your transaction history from Excel and paste it into the transaction input area, or upload a CSV file from supported exchanges.</p>
                            <p className="bg-[#A6DDDF]/20 p-3 rounded-xl border border-[#A6DDDF]/40 text-[#664A48] font-bold italic">
                                Pro Tip: Ensure columns include Date, Asset, Type (BUY/SELL), Quantity, and Price.
                            </p>
                        </div>
                    }
                />

                <HelpItem
                    icon={<PieChart size={20} />}
                    title="📈 Understanding your results"
                    content={
                        <div className="space-y-2">
                            <p>You’ll see how your crypto balance changes over time. Each sell shows the exact FIFO purchase it matched with.</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Gains and losses are calculated per transaction.</li>
                                <li>Summaries are grouped by the official SARS tax year.</li>
                                <li>Expansion toggles reveal the underlying cost-basis math.</li>
                            </ul>
                        </div>
                    }
                />

                <HelpItem
                    icon={<AlertTriangle size={20} />}
                    title="❓ Common Issues & Troubleshooting"
                    content={
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <span className="text-[#017792] font-black">•</span>
                                <p><strong>Date Formats:</strong> Ensure dates are in a standard YYYY-MM-DD or similar format.</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[#017792] font-black">•</span>
                                <p><strong>Missing Data:</strong> Ensure no missing prices or quantities. Zero-value trades can break FIFO logic.</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[#017792] font-black">•</span>
                                <p><strong>Trade Logic:</strong> Crypto-to-crypto trades must include both assets to track the disposal of one and acquisition of the other.</p>
                            </div>
                        </div>
                    }
                />

                <HelpItem
                    icon={<Lightbulb size={20} />}
                    title="🛡️ Why is my balance wrong?"
                    content="Ensure you have included your entire history. FIFO (First-In-First-Out) requires a complete trail from your very first purchase to accurately calculate the cost basis of your current sales. If a 'SELL' occurs without a preceding 'BUY', the cost basis defaults to zero."
                />
            </div>

            {/* Contact Footer */}
            <div className="mt-16 text-center">
                <p className="text-[#664A48]/40 text-xs font-bold uppercase tracking-widest">
                    Still stuck? Contact TaxTim Support for professional assistance.
                </p>
            </div>
        </div>
    );
}

interface HelpItemProps {
    title: string;
    content: React.ReactNode;
    icon: React.ReactNode;
}

function HelpItem({ title, content, icon }: HelpItemProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.01, x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="border-none shadow-lg bg-white rounded-3xl border-l-[6px] border-[#A6DDDF] hover:border-[#017792] transition-all overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="p-2 bg-[#F8F8F8] rounded-xl text-[#017792]">
                        {icon}
                    </div>
                    <CardTitle className="text-[#664A48] text-xl font-black tracking-tight">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-[#664A48]/70 text-sm font-medium leading-relaxed">
                    {content}
                </CardContent>
            </Card>
        </motion.div>
    );
}