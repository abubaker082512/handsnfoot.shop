import { useState } from 'react'

const faqs = [
    {
        question: 'Are your products 100% authentic?',
        answer: 'Yes, absolutely. All our Japanese Casio watches, luxury leather wallets, and cosmetics are 100% genuine. We import our stock directly from verified distributors and back them with our authenticity guarantee.'
    },
    {
        question: 'What are your delivery charges and shipping times?',
        answer: 'We offer FREE delivery nationwide across Pakistan on all orders above Rs. 3,000. For orders under Rs. 3,000, we charge a flat shipping rate of Rs. 250. Deliveries usually take 2 to 5 business days to reach your doorstep.'
    },
    {
        question: 'How can I track my order?',
        answer: 'After placing an order, you will receive an Order ID (UUID). You can enter this ID on our "Track Order" page (accessible in the header/footer) to view its payment status, packing status, and shipping logs in real-time.'
    },
    {
        question: 'What payment options do you support?',
        answer: 'We support Cash on Delivery (COD) nationwide, Bank Transfer, and secure digital payments via Credit/Debit Cards, JazzCash Mobile Wallets, and EasyPaisa.'
    },
    {
        question: 'Can I return or exchange a product?',
        answer: 'Yes. We offer a 7-day return and exchange policy. If the item you received is damaged, defective, or does not match the description, you can contact us at +92-328-0801100 to request a return or replacement.'
    },
    {
        question: 'Where is your store located?',
        answer: 'Our physical showroom is located at G-20, Mobile Arena, SOAN Avenue Road, SOAN Garden, Islamabad, Pakistan. You can visit us during business hours to browse our premium collection in person.'
    }
]

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-16 font-sans">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-primary-600 font-semibold text-xs uppercase tracking-widest">Help Center</span>
                    <h1 className="text-4xl font-display font-bold text-gray-900 mt-2 uppercase tracking-wide">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-gray-600 mt-3 max-w-md mx-auto text-sm leading-relaxed">
                        Find answers to common questions about shipping rates, payment gateways, product quality, and refunds.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index
                        return (
                            <div 
                                key={index} 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
                                >
                                    <span className="font-bold text-gray-900 text-sm md:text-base leading-snug">
                                        {faq.question}
                                    </span>
                                    <span className={`ml-4 w-6 h-6 rounded-full flex items-center justify-center text-xs border border-gray-200 transition-transform duration-300 ${
                                        isOpen ? 'bg-primary-500 border-primary-500 text-black rotate-180' : 'bg-white text-gray-500'
                                    }`}>
                                        ▼
                                    </span>
                                </button>
                                
                                <div 
                                    className={`transition-all duration-300 ease-in-out ${
                                        isOpen ? 'max-h-60 border-t border-gray-50' : 'max-h-0'
                                    } overflow-hidden`}
                                >
                                    <p className="px-6 py-5 text-gray-600 text-sm leading-relaxed font-light">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Direct Help Callout */}
                <div className="mt-12 text-center bg-black text-white p-8 rounded-2xl border border-primary-500/10 shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">Still Have Questions?</h3>
                        <p className="text-gray-400 text-sm mb-6 font-light max-w-md mx-auto">
                            Our customer support team is available 24/7. Call or WhatsApp us directly and we will assist you.
                        </p>
                        <a 
                            href="tel:+923280801100" 
                            className="inline-block bg-primary-500 text-black hover:bg-primary-400 transition-all font-bold px-8 py-3 rounded-lg text-xs uppercase tracking-widest"
                        >
                            Call Support: +92-328-0801100
                        </a>
                    </div>
                    {/* Glowing gold visual */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
                </div>
            </div>
        </div>
    )
}

export default FAQ
