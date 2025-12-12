import React, { useState } from 'react';

function ContactUs() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // In a real app, send data to backend here
    };

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h2>
                <p className="text-gray-600">Thank you for contacting us. We will get back to you shortly.</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-sm font-medium text-black hover:underline"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-black" placeholder="Your name" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input required type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-black" placeholder="your@email.com" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea required rows="4" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-black" placeholder="How can we help?"></textarea>
                </div>
                <button type="submit" className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-900 transition">
                    Send Message
                </button>
            </form>
        </div>
    );
}

export default ContactUs;
