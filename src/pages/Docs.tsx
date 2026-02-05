import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calculator, ArrowRightLeft, History, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function Docs() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header Section */}
            <div className="flex items-center gap-5 mb-12">
                <div className="p-4 bg-[#E6C5C9]/40 rounded-3xl text-[#664A48] shadow-sm">
                    <FileText size={40} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-[#664A48] tracking-tight">
                        Documentation
                    </h1>
                    <p className="text-[#017792] font-bold text-lg">
                        Everything you need to know about Crypto Tax in SA
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 md:grid-cols-2">

                <DocCard
                    icon={<Calculator className="text-[#017792]" size={20} />}
                    title="📌 What this calculator does"
                    content={
                        <div className="space-y-3">
                            <p>
                                The TaxTim Crypto Calculator helps you calculate your crypto capital
                                gains and losses according to SARS tax rules using the FIFO
                                (First-In, First-Out) method.
                            </p>
                            <p>
                                It tracks your crypto purchases, sales, and trades across tax years
                                and shows how your base cost and gains are calculated step-by-step.
                            </p>
                        </div>
                    }
                />

                <DocCard
                    icon={<ArrowRightLeft className="text-[#017792]" size={20} />}
                    title="📊 Supported Transactions"
                    content={
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#8C9F8B]" />
                                <strong>BUY</strong> – Purchasing crypto with fiat or another asset
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#017792]" />
                                <strong>SELL</strong> – Selling crypto for fiat
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#E6C5C9]" />
                                <strong>TRADE</strong> – Swapping one crypto for another
                            </li>
                        </ul>
                    }
                />

                <DocCard
                    icon={<History className="text-[#017792]" size={20} />}
                    title="🧮 FIFO Method Explained"
                    content={
                        <div className="space-y-3">
                            <p>
                                FIFO means the first crypto you buy is considered the first crypto
                                you sell.
                            </p>
                            <div className="bg-[#F8F8F8] p-3 rounded-xl border border-[#A6DDDF]/30 italic text-xs">
                                Example: If you bought 1 BTC in 2022 and 1 BTC in 2023, and then sell 1 BTC,
                                the system assumes you sold the 2022 BTC first.
                            </div>
                        </div>
                    }
                />

                <DocCard
                    icon={<Calendar className="text-[#017792]" size={20} />}
                    title="🗓 Tax Year"
                    content={
                        <p>
                            The SARS tax year runs from <strong className="text-[#017792]">1 March</strong> to{" "}
                            <strong className="text-[#017792]">end of February</strong> the following year.
                            Our engine automatically sorts your trades into these specific periods for accurate reporting.
                        </p>
                    }
                />

            </div>

            {/* Footer Info */}
            <p className="mt-12 text-center text-[10px] font-bold text-[#664A48]/40 uppercase tracking-[0.2em]">
                SARS Compliant • Official FIFO Logic • TaxTim Powered
            </p>
        </div>
    );
}

interface DocCardProps {
    title: string;
    content: React.ReactNode;
    icon: React.ReactNode;
}

function DocCard({ title, content, icon }: DocCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group h-full">
                {/* Decorative Top Accent */}
                <div className="h-2 bg-[#A6DDDF] group-hover:bg-[#017792] transition-colors duration-500" />

                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="p-2 bg-[#F8F8F8] rounded-lg">
                        {icon}
                    </div>
                    <CardTitle className="text-[#664A48] font-black tracking-tight text-xl">
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-[#664A48]/80 font-medium leading-relaxed text-sm">
                    {content}
                </CardContent>
            </Card>
        </motion.div>
    );
}