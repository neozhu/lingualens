// app/terms/page.tsx
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Info, Layers, ShieldAlert, Shield, FileCode, Bell, Mail } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto p-6 motion-preset-fade-in motion-duration-700">
      <Card className="shadow-md motion-preset-slide-up motion-duration-500 motion-delay-200">
        <CardHeader className="border-b pb-6 motion-preset-fade-in motion-duration-500 motion-delay-300">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold motion-preset-fade-in motion-duration-500 motion-delay-400">Terms of Service</CardTitle>
              <CardDescription className="motion-preset-fade-in motion-duration-500 motion-delay-500">Last updated: June 4, 2025</CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1 motion-preset-scale-up motion-duration-500 motion-delay-600">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Legal Document
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6 motion-preset-fade-in motion-duration-500 motion-delay-700">
          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-800">
            <div className="bg-primary/10 p-2 rounded-full">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using LinguaLens (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-900">
            <div className="bg-primary/10 p-2 rounded-full">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>              <p className="text-muted-foreground">
                LinguaLens is a free, open-source translation assistant licensed under the MIT License. It provides bidirectional translation between Chinese and other languages, adapting to various contexts and scenarios.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-1000">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">3. License and Open Source</h2>
              <p className="text-muted-foreground">
                The Service&apos;s source code is available under the MIT License. You are free to use, copy, modify, merge, publish, distribute, and sublicense the software in accordance with the MIT terms. A copy of the MIT License can be found in the <Link href="/LICENSE" className="text-primary underline hover:text-primary/80 transition-colors">LICENSE</Link> file.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-1100">
            <div className="bg-primary/10 p-2 rounded-full">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">4. No Warranty</h2>
              <p className="text-muted-foreground">
                The Service is provided &quot;as is&quot;, without warranty of any kind, express or implied. The authors and contributors disclaim all warranties, including but not limited to merchantability and fitness for a particular purpose.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-1200">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                In no event shall the authors or contributors be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of the Service.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-1300">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">6. Privacy</h2>
              <p className="text-muted-foreground">
                Please refer to our <Link href="/privacy" className="text-primary underline hover:text-primary/80 transition-colors">Privacy Policy</Link> for details on how we handle personal information.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-1400">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms of Service from time to time. Any changes will be posted on this page with a revised &quot;Last updated&quot; date.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-4 items-start motion-preset-slide-right motion-duration-500 motion-delay-1500">
            <div className="bg-primary/10 p-2 rounded-full">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at <a href="mailto:neo.js.cn@gmail.com" className="text-primary underline hover:text-primary/80 transition-colors">neo.js.cn@gmail.com</a>.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6 flex justify-center text-xs text-muted-foreground motion-preset-fade-in motion-duration-500 motion-delay-1600">
          © {new Date().getFullYear()} LinguaLens. All rights reserved.        </CardFooter>
      </Card>
    </div>
  );
}
