// app/privacy/page.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Info, Cookie, Link2, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="shadow-md">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
              <CardDescription>Last updated: June 4, 2025</CardDescription>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Official Document
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to LinguaLens. We respect your privacy and are committed to protecting any information you share. This Privacy Policy explains how we handle your data.
              </p>
            </div>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Information Collection</h2>
              <p className="text-muted-foreground">
                LinguaLens does <strong>not</strong> collect, store, or process any personal information or translation data. All translations are performed in real-time using third-party AI services or local browser capabilities, and no input or output is retained on our servers.
              </p>
            </div>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                We do not use cookies, tracking pixels, or any other tracking technologies within this application. Your use remains private and ephemeral.
              </p>
            </div>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Third-Party Services</h2>
              <p className="text-muted-foreground">
                We integrate with AI translation services (e.g., Google Gemini, Llama, Qwen, Mistral) to perform translations. We do not retain any data sent to or received from these services beyond the immediate translation response.
              </p>
            </div>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="flex gap-4 items-start">
            <div className="bg-primary/10 p-2 rounded-full">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:neo.js.cn@gmail.com" className="text-primary underline hover:text-primary/80 transition-colors">neo.js.cn@gmail.com</a>.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-6 flex justify-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LinguaLens. All rights reserved.
        </CardFooter>
      </Card>
    </div>
  );
}
