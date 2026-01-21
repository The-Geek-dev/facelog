'use client'

import { Scan } from 'lucide-react'

export function Footer() {
  const techStack = [
    'DeepFace AI',
    'TensorFlow', 
    'OpenCV',
    'Flask',
    'SQLite',
    'Python',
    'ReportLab',
    'NumPy'
  ]

  return (
    <footer className="relative py-16 bg-slate-900 text-white">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-12 gap-12">
          {/* Logo and Description */}
          <div className="col-span-12 md:col-span-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scan className="w-8 h-8 text-accent-blue" />
                <span className="font-bold text-white text-2xl tracking-wider">FACELOG</span>
              </div>
              <p className="text-white/70 leading-relaxed mb-6">
                AI-powered facial recognition attendance system for modern educational institutions. 
                Fast, accurate, and completely secure.
              </p>
              {/* Quick Links */}
              <div className="flex items-center space-x-6">
                <a
                  href="#features"
                  className="text-white/60 hover:text-white gentle-animation text-sm"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-white/60 hover:text-white gentle-animation text-sm"
                >
                  How It Works
                </a>
                <a
                  href="#contact"
                  className="text-white/60 hover:text-white gentle-animation text-sm"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="col-span-12 md:col-span-8">
            <div>
              <h4 className="font-bold text-xl text-white mb-4">POWERED BY</h4>
              
              <p className="text-white/70 text-sm mb-6 leading-relaxed">
                FACELOG is built on cutting-edge AI and computer vision technologies 
                to deliver industry-leading facial recognition accuracy.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {techStack.map((tool) => (
                  <div
                    key={tool}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-center text-white/80 text-sm font-medium hover:bg-white/10 gentle-animation"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/50">
              © 2025 FACELOG. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-white gentle-animation">Privacy Policy</a>
              <a href="#" className="hover:text-white gentle-animation">Terms of Service</a>
              <a href="#" className="hover:text-white gentle-animation">API Documentation</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
