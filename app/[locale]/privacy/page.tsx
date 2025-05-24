// app/privacy/page.tsx
import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-background shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500">Last updated: May 3, 2025</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Introduction</h2>
        <p className="text-sm text-muted-foreground">
          Welcome to LinguaLens. We respect your privacy and are committed to protecting any information you share. This Privacy Policy explains how we handle your data.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Information Collection</h2>
        <p className="text-sm text-muted-foreground">
          LinguaLens does <strong>not</strong> collect, store, or process any personal information or translation data. All translations are performed in real-time using third-party AI services or local browser capabilities, and no input or output is retained on our servers.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Cookies and Tracking</h2>
        <p className="text-sm text-muted-foreground">
          We do not use cookies, tracking pixels, or any other tracking technologies within this application. Your use remains private and ephemeral.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Third-Party Services</h2>
        <p className="text-sm text-muted-foreground">
          We integrate with AI translation services (e.g., Google Gemini, Llama, Qwen, Mistral) to perform translations. We do not retain any data sent to or received from these services beyond the immediate translation response.
        </p>
      </section>

      <section className="mt-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
        <p className="text-sm text-muted-foreground">
          If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:neo.js.cn@gmail.com" className="text-blue-600 underline">neo.js.cn@gmail.com</a>.
        </p>
      </section>
    </div>
  );
}
