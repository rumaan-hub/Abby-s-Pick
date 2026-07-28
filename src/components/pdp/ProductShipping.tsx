import { Truck } from 'lucide-react';

export function ProductShipping({ shipping }: { shipping?: string }) {
    if (!shipping) return null;

    return (
        <section className="py-12 border-t border-gray-200 first:border-t-0 first:pt-0">
            <div className="flex flex-col sm:flex-row items-start gap-5 p-6 sm:p-8 bg-gray-50 rounded-2xl max-w-4xl border border-transparent transition-colors hover:bg-white hover:border-gray-200">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Truck className="w-6 h-6 text-black" strokeWidth={2} />
                </div>
                <div className="mt-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Shipping Details</h2>
                    <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                        {shipping}
                    </p>
                </div>
            </div>
        </section>
    );
}
