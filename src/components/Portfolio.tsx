'use client'

import { motion } from 'framer-motion'
import { Scan, Users, FileText, BarChart3, Shield, Clock, Camera, Download } from 'lucide-react'

export function Portfolio() {
  const features = [
    {
      icon: Scan,
      title: "AI Face Recognition",
      description: "Advanced DeepFace AI technology for accurate student identification in real-time with 99.5% accuracy.",
      color: "accent-blue"
    },
    {
      icon: Users,
      title: "Student Management",
      description: "Easy enrollment with photo capture, class assignment, and comprehensive student profiles.",
      color: "accent-emerald"
    },
    {
      icon: Clock,
      title: "Instant Attendance",
      description: "Mark attendance automatically when students face the camera - no manual input required.",
      color: "accent-purple"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time statistics, attendance trends, and class-wise reports at your fingertips.",
      color: "accent-blue"
    },
    {
      icon: FileText,
      title: "Report Generation",
      description: "Export detailed attendance reports in CSV and PDF formats for records and compliance.",
      color: "accent-emerald"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "All facial data is encrypted and stored locally - student privacy is our top priority.",
      color: "accent-purple"
    },
    {
      icon: Camera,
      title: "Live Camera Feed",
      description: "Real-time webcam integration with face detection overlay and instant visual feedback.",
      color: "accent-blue"
    },
    {
      icon: Download,
      title: "Multi-Format Export",
      description: "Download attendance data as CSV for spreadsheets or professional PDF reports.",
      color: "accent-emerald"
    }
  ]

  return (
    <section id="features" className="relative py-24 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Powerful Capabilities
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
            Features That Matter
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to modernize attendance tracking with cutting-edge facial recognition technology.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card clean-border rounded-2xl p-6 h-full hover:shadow-lg gentle-animation hover:-translate-y-1">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-5`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-card clean-border rounded-2xl px-8 py-5">
            <span className="text-sm font-medium text-muted-foreground">Powered by:</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-accent-blue/10 text-accent-blue px-3 py-1.5 rounded-lg text-sm font-semibold">DeepFace AI</span>
              <span className="bg-accent-emerald/10 text-accent-emerald px-3 py-1.5 rounded-lg text-sm font-semibold">Flask API</span>
              <span className="bg-accent-purple/10 text-accent-purple px-3 py-1.5 rounded-lg text-sm font-semibold">SQLite</span>
              <span className="bg-accent-blue/10 text-accent-blue px-3 py-1.5 rounded-lg text-sm font-semibold">OpenCV</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
