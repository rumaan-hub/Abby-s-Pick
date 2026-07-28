export function ProductDescription({ description }: { description?: string }) {
    if (!description) return null;

    return (
        <section className="py-12 border-t border-gray-200 first:border-t-0 first:pt-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
                Product Overview
            </h2>
            <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-line max-w-4xl">
                {description}
            </div>
        </section>
    );
}
