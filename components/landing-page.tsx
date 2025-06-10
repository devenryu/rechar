"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Upload,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react"

interface LandingPageProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: Upload,
      title: "Smart Data Upload",
      description:
        "Drag and drop CSV files or describe your data in natural language. Our AI understands your data instantly.",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: BarChart3,
      title: "Professional Charts",
      description:
        "Choose from bar charts, line charts, pie charts, scatter plots, and more. All optimized for clarity and impact.",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Insights",
      description:
        "Get intelligent insights about your data patterns and trends. Save and organize charts in your dashboard.",
      color: "from-purple-500 to-violet-600",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate beautiful visualizations in seconds. No complex setup or learning curve required.",
      color: "from-yellow-500 to-orange-600",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. Share visualizations publicly or keep them private.",
      color: "from-red-500 to-pink-600",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share charts with your team, embed them in presentations, or export for offline use.",
      color: "from-indigo-500 to-blue-600",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Data Analyst",
      company: "TechCorp",
      content:
        "Rechart has revolutionized how we present data insights. The AI-powered analysis saves hours of work.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Marketing Manager",
      company: "GrowthCo",
      content: "Creating professional charts has never been easier. Our team productivity has increased significantly.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "Business Intelligence",
      company: "DataFlow Inc",
      content:
        "The export and sharing features are fantastic. We can easily embed charts in our reports and dashboards.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="page-container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Rechart</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Professional Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onSignIn} className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
              <Button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Trusted by 10,000+ professionals
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Data Into
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 block sm:inline">
                {" "}
                Beautiful Charts
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Upload your data, choose a chart type, and let AI create stunning visualizations instantly. Save, manage,
              and share your charts with a professional dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              >
                Start Creating Charts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg rounded-xl border-2 w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Setup in 30 seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing bg-white/50">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything you need to visualize data</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern data professionals and teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg card-hover bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base leading-relaxed text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Loved by data professionals</h2>
            <p className="text-xl text-gray-600">See what our users are saying about Rechart</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg card-hover bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 lg:p-16 text-white shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to transform your data?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals creating beautiful charts with Rechart. Start your free account today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                variant="secondary"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl shadow-lg"
              >
                Start Creating Charts
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="page-container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Rechart</span>
              </div>
              <p className="text-gray-400">Professional data visualization platform for modern teams.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Rechart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
