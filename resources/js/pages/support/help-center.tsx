import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import LuxuryLayout from '@/layouts/LuxuryLayout';
import { Mail, HelpCircle, ChevronDown, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FAQ {
    question: string;
    answer: string;
}

interface HelpCenterProps {
    faqs: FAQ[];
}

export default function HelpCenter({ faqs = [] }: HelpCenterProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const submitContact = (e: React.FormEvent) => {
        e.preventDefault();
        post('/help/submit', {
            onSuccess: () => {
                toast.success('Pesan Anda berhasil dikirim! Admin kami akan membalas via email segera.');
                reset();
            },
        });
    };

    return (
        <LuxuryLayout>
            <Head title="Pusat Bantuan & Kontak Kami" />

            <div className="mx-auto max-w-4xl w-full px-6 py-12 md:px-8 space-y-12 text-left">
                
                {/* Header */}
                <div className="border-b border-white/5 pb-6">
                    <span className="text-xs font-bold text-gold uppercase tracking-widest font-outfit">Bantuan & Kontak</span>
                    <h1 className="font-outfit text-3xl font-extrabold text-white mt-1">Pusat Hubungan Bantuan</h1>
                    <p className="text-xs text-white/40 mt-1">Kami di sini untuk membantu memperlancar staycation dan reservasi Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* Left: FAQs */}
                    <div className="space-y-6">
                        <h3 className="font-outfit text-lg font-bold text-white flex items-center mb-4">
                            <HelpCircle className="mr-2 h-5 w-5 text-gold" />
                            Pertanyaan Populer
                        </h3>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-white transition-colors hover:text-gold"
                                    >
                                        <span>{faq.question}</span>
                                        <ChevronDown className={`h-4 w-4 text-gold transform transition-transform duration-300 ${
                                            openFaqIndex === idx ? 'rotate-180' : ''
                                        }`} />
                                    </button>

                                    {openFaqIndex === idx && (
                                        <div className="px-5 pb-5 pt-1 text-[11px] text-white/50 leading-relaxed font-sans border-t border-white/5">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* WhatsApp CTA Link */}
                        <div className="p-6 bg-gold/5 border border-gold/15 rounded-3xl space-y-3 mt-8">
                            <h4 className="font-outfit text-sm font-bold text-white flex items-center">
                                <MessageCircle className="mr-2 h-5 w-5 text-gold shrink-0 animate-pulse" />
                                Butuh Respon Cepat?
                            </h4>
                            <p className="text-[11px] text-white/50 leading-relaxed">
                                Tim customer care super admin kami aktif 24/7 di WhatsApp untuk membantu memandu reservasi Anda secara langsung.
                            </p>
                            <a
                                href="https://wa.me/6281234567890?text=Halo%20Admin%20Homestay%20saya%20butuh%20bantuan%20terkait..."
                                target="_blank"
                                className="inline-flex bg-gold hover:bg-white text-deep-black font-extrabold text-[10px] py-2 px-6 rounded-full transition-all duration-300 scale-100 hover:scale-105"
                            >
                                Hubungi Admin via WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Right: Contact ticket form */}
                    <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl space-y-6">
                        <div className="border-b border-white/5 pb-3">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block">Kirim Tiket Pesan</span>
                            <h3 className="font-outfit text-base font-bold text-white mt-1">Formulir Kontak Kami</h3>
                        </div>

                        <form onSubmit={submitContact} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Nama Anda</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Cth: Sarah Wijaya"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:border-gold focus:outline-none"
                                />
                                {errors.name && <span className="text-[10px] text-red-400">{errors.name}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Alamat Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="Cth: sarah@email.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:border-gold focus:outline-none"
                                />
                                {errors.email && <span className="text-[10px] text-red-400">{errors.email}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Subjek Topik</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Cth: Masalah Akun, Pertanyaan Pembatalan..."
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:border-gold focus:outline-none"
                                />
                                {errors.subject && <span className="text-[10px] text-red-400">{errors.subject}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Isi Pesan / Keluhan</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Tuliskan keluhan atau pertanyaan Anda di sini..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white focus:border-gold focus:outline-none resize-none"
                                ></textarea>
                                {errors.message && <span className="text-[10px] text-red-400">{errors.message}</span>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gold disabled:bg-gold/40 text-deep-black font-extrabold text-xs py-3.5 rounded-xl transition-all hover:bg-white active:scale-95 flex items-center justify-center space-x-2"
                            >
                                <Send className="h-4 w-4" />
                                <span>{processing ? 'Sedang Mengirim...' : 'Kirim Tiket Support'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </LuxuryLayout>
    );
}
