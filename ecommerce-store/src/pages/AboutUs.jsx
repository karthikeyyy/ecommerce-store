import React from 'react';

function AboutUs() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-6 text-center">About Us</h1>
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                <p className="text-gray-600 mb-4 leading-relaxed">
                    Welcome to our ecommerce demo store! We are passionate about providing the best clothing and accessories to our customers.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                    Founded in 2025, our mission is to make fashion accessible and sustainable. We curate high-quality products from top brands and independent designers.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    Thank you for choosing us for your style journey. If you have any questions, feel free to visit our Help Center.
                </p>
            </div>
        </div>
    );
}

export default AboutUs;
