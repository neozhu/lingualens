// app/terms/page.tsx
import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-background shadow rounded-lg">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-gray-400">Last updated: May 3, 2025</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="text-sm text-muted-foreground">
          By accessing or using LinguaLens (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
        <p className="text-sm text-muted-foreground">
          LinguaLens is a free, open-source translation assistant licensed under the MIT License. It provides bidirectional translation between Chinese and other languages, adapting to various contexts and scenarios.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">3. License and Open Source</h2>
        <p className="text-sm text-muted-foreground">
          The Service&apos;s source code is available under the MIT License. You are free to use, copy, modify, merge, publish, distribute, and sublicense the software in accordance with the MIT terms. A copy of the MIT License can be found in the <a href="/LICENSE" className="text-blue-600 underline">LICENSE</a> file.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">4. No Warranty</h2>
        <p className="text-sm text-muted-foreground">
          The Service is provided &quot;as is&quot;, without warranty of any kind, express or implied. The authors and contributors disclaim all warranties, including but not limited to merchantability and fitness for a particular purpose.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">5. Limitation of Liability</h2>
        <p className="text-sm text-muted-foreground">
          In no event shall the authors or contributors be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of the Service.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">6. Privacy</h2>
        <p className="text-sm text-muted-foreground">
          Please refer to our <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a> for details on how we handle personal information.
        </p>
      </section>

      <section className="mt-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">7. Changes to Terms</h2>
        <p className="text-sm text-muted-foreground">
          We may update these Terms of Service from time to time. Any changes will be posted on this page with a revised &quot;Last updated&quot; date.
        </p>
      </section>

      <section className="mt-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">8. Contact Us</h2>
        <p className="text-sm text-muted-foreground">
          If you have any questions about these Terms, please contact us at <a href="mailto:neo.js.cn@gmail.com" className="text-blue-600 underline">neo.js.cn@gmail.com</a>.
        </p>
      </section>
    </div>
  );
}
