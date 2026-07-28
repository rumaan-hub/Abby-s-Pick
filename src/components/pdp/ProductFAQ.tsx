import type { ProductFAQ as FAQType } from '@/lib/types/product';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductFAQProps {
    faqs?: FAQType[];
}

export function ProductFAQ({ faqs }: ProductFAQProps) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <section className="py-16 border-t border-gray-200">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-500 text-lg">
                        Everything you need to know about this product.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, idx) => (
                        <AccordionItem
                            key={idx}
                            value={`item-${idx}`}
                            className="border-b border-gray-200 py-2"
                        >
                            <AccordionTrigger className="text-left text-lg font-bold text-gray-900 hover:no-underline hover:text-black transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-base leading-relaxed whitespace-pre-line pb-6">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
