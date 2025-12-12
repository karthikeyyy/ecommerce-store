import React from 'react';

function Privacy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-gray max-w-none">
                <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
                <p className="mb-4 text-gray-600">
                    We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes your name, email, shipping address, and payment information.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
                <p className="mb-4 text-gray-600">
                    We use your information to process orders, send order updates, improve our services, and communicate with you about promotions (if you opted in).
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Security</h2>
                <p className="mb-4 text-gray-600">
                    We implement reasonable security measures to protect your personal information. However, no method of transmission over the internet is completely secure.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">4. Cookies</h2>
                <p className="mb-4 text-gray-600">
                    We use cookies to enhance your browsing experience and analyze site traffic. You can control cookie preferences in your browser settings.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">5. Contact Us</h2>
                <p className="mb-4 text-gray-600">
                    If you have questions about this Privacy Policy, please contact us at privacy@example.com.
                </p>
            </div>
        </div>
    );
}

export default Privacy;
