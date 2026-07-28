import type { ProductSpecification } from '@/lib/types/product';

export function ProductSpecifications({ specs }: { specs?: ProductSpecification[] }) {
    if (!specs || specs.length === 0) return null;

    return (
        <section className="py-12 border-t border-gray-200 first:border-t-0 first:pt-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
                Specifications
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 max-w-5xl">
                {specs.map((spec, idx) => (
                    <div
                        key={idx}
                        className="flex justify-between sm:grid sm:grid-cols-2 gap-4 py-4 border-b border-gray-100"
                    >
                        <dt className="text-gray-500 font-medium">{spec.label}</dt>
                        <dd className="text-gray-900 font-medium text-right sm:text-left">{spec.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
