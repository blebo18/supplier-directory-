"use client";

import { useState } from "react";

interface ContactFormProps {
  supplierId: number;
}

export default function ContactForm({ supplierId }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch(`/api/suppliers/${supplierId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      if (res.ok) {
        form.reset();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">Contact this company</h3>
      {submitted && (
        <div className="mb-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
          Your message has been sent!
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 resize-none"
            placeholder="How can this company help you?"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
