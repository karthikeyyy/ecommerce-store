import React from 'react';

function HelpCenter() {
    const faqs = [
        {
            q: "How do I track my order?",
            a: "You can track your order in the 'Orders' section of your profile."
        },
        {
            q: "What is your return policy?",
            a: "We accept returns within 30 days of purchase for unused items."
        },
        {
            q: "Do you offer international shipping?",
            a: "Currently, we only ship within the country."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Help Center</h1>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.q}</h3>
                        <p className="text-gray-600">{faq.a}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center text-gray-500">
                <p>Still have questions? Contact support@example.com</p>
            </div>
        </div>
    );
}

export default HelpCenter;
