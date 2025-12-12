import React from 'react';

function Terms() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
            <div className="prose prose-gray max-w-none">
                <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

                <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
                <p className="mb-4 text-gray-600">
                    Welcome to MyStore. By using our website, you agree to these terms and conditions. Please read them carefully.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">2. Use of Website</h2>
                <p className="mb-4 text-gray-600">
                    You must be at least 18 years old to use this website. You agree not to use this site for any illegal purposes.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">3. Product Information</h2>
                <p className="mb-4 text-gray-600">
                    We strive to display products accurately. However, colors and details may vary slightly depending on your screen.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">4. Orders and Payments</h2>
                <p className="mb-4 text-gray-600">
                    All orders are subject to acceptance. We reserve the right to cancel orders at our discretion. Prices are subject to change without notice.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">5. Returns and Refunds</h2>
                <p className="mb-4 text-gray-600">
                    Returns are accepted within 30 days of purchase for unused items in original packaging. Please contact support for assistance.
                </p>
            </div>
        </div>
    );
}

export default Terms;
