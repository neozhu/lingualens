"use client"

import { motion } from "framer-motion"
import { 
  Languages, 
  Palette, 
  Layout, 
  Sparkles, 
  Lightbulb, 
  Clapperboard,
  Layers,
  Wifi
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FeaturesPage() {
  return (
    <div className="container max-w-6xl py-10 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          LinguaLens Features
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover the powerful translation capabilities that make LinguaLens your ultimate language companion
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="h-full overflow-hidden border hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {feature.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to break language barriers?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start using LinguaLens today and experience the next generation of contextual translation.
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/">
              Try it now
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="https://github.com/neozhu/lingualens" target="_blank">
              View on GitHub
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    title: "Bidirectional Translation",
    description: "Intelligent language detection and translation in both directions",
    icon: <Languages className="w-6 h-6 text-primary" />,
    points: [
      "Automatically detects input language",
      "Translates between your native language and others",
      "Supports 12+ languages including English, Chinese, Spanish, and more",
      "Natural, high-quality translations that preserve context"
    ],
  },
  {
    title: "Context-Aware Translation",
    description: "Translations tailored to the specific context of your content",
    icon: <Lightbulb className="w-6 h-6 text-primary" />,
    points: [
      "Maintains the original tone and intent of your message",
      "Preserves idioms and cultural references",
      "Adapts to various writing styles",
      "Ensures consistent terminology"
    ],
  },
  {
    title: "Scene-Based Translation",
    description: "Customizable translation scenes for different contexts",
    icon: <Clapperboard className="w-6 h-6 text-primary" />,
    points: [
      "Preset scenes for business, casual, technical content",
      "Create and manage custom translation scenes",
      "Tailor translation style to your specific needs",
      "Save and reuse your favorite translation contexts",
      "Automatically generate optimal prompts for each scene"
    ],
  },
  {
    title: "Modern UI Experience",
    description: "Clean, intuitive interface with customizable themes",
    icon: <Palette className="w-6 h-6 text-primary" />,
    points: [
      "Multiple theme options including light and dark mode",
      "Responsive design works across all devices",
      "Animated transitions for a fluid experience",
      "Minimal and focused interface"
    ],
  },
  {
    title: "Advanced AI Integration",
    description: "Powered by state-of-the-art AI models",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    points: [
      "Leverages multiple AI providers (Gemini, GPT, etc.)",
      "High-accuracy translations even for complex text",
      "Fast, responsive performance",
      "Continuous improvements with AI advancements"
    ],
  },
  {
    title: "Multi-language Support",
    description: "Global accessibility with localized interfaces",
    icon: <Layout className="w-6 h-6 text-primary" />,
    points: [
      "UI available in multiple languages",
      "Seamless language switching",
      "Retain preferences across sessions",
      "Culturally appropriate interactions"
    ],
  },
  {
    title: "Format Preservation",
    description: "Maintains formatting in your translations",
    icon: <Layers className="w-6 h-6 text-primary" />,
    points: [
      "Preserves markdown formatting",
      "Keeps code snippets intact",
      "Maintains document structure",
      "Handles special characters correctly"
    ],
  },
  {
    title: "Cross-Platform Compatibility",
    description: "Use LinguaLens anywhere, anytime",
    icon: <Wifi className="w-6 h-6 text-primary" />,
    points: [
      "Works on desktop and mobile devices",
      "No installation required - fully web-based",
      "Optimized performance across all platforms",
      "Consistent experience everywhere"
    ],
  },
]