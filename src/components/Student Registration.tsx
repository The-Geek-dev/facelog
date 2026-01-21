'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff, UserPlus, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { registerStudent } from '@/lib/api'

interface RegistrationFormData {
  name: string
  student_id: string
  email: string
  class_section: string
}

export function StudentRegistration() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    student_id: '',
    email: '',
    class_section: 'Default'
  })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsStreaming(true)
        setMessage({ text: 'Camera started successfully', type: 'success' })
      }
    } catch (err) {
      console.error('Camera error:', err)
      setMessage({ text: 'Unable to access camera. Please allow camera permissions.', type: 'error' })
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
    setCapturedImage(null)
    setMessage({ text: 'Camera stopped', type: 'success' })
  }

  // Capture image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      setMessage({ text: 'Please start the camera first', type: 'error' })
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95)
    setCapturedImage(imageBase64)
    setMessage({ text: 'Image captured! Now fill the form and register.', type: 'success' })
  }

  // Handle form submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.name.trim() || !formData.student_id.trim()) {
      setMessage({ text: 'Please enter both name and student ID', type: 'error' })
      return
    }

    if (!capturedImage) {
      setMessage({ text: 'Please capture an image first', type: 'error' })
      return
    }

    setIsProcessing(true)
    setMessage({ text: 'Processing registration... Please wait', type: 'success' })

    try {
      await registerStudent({
        name: formData.name.trim(),
        student_id: formData.student_id.trim(),
        email: formData.email.trim(),
        class_section: formData.class_section,
        image: capturedImage
      })

      setMessage({ 
        text: `✅ Student ${formData.name} registered successfully!`, 
        type: 'success' 
      })

      // Reset form
      setFormData({
        name: '',
        student_id: '',
        email: '',
        class_section: 'Default'
      })
      setCapturedImage(null)
      
      // Stop camera after successful registration
      setTimeout(() => {
        stopCamera()
      }, 2000)

    } catch (err: any) {
      setMessage({ 
        text: err.message || 'Registration failed. Please try again.', 
        type: 'error' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <section className="relative py-24 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Student Registration
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-foreground">
            Register New Student
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Capture student's face photo and enter their details to register them in the system
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-card clean-border rounded-2xl overflow-hidden">
            {/* Message Display */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-6 py-4 border-b flex items-center gap-3 ${
                  message.type === 'success' 
                    ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' 
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message.text}</span>
                <button 
                  onClick={() => setMessage(null)}
                  className="ml-auto hover:opacity-70"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Camera Section */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Step 1: Capture Photo</h3>
                  
                  {/* Video Container */}
                  <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden mb-4">
                    {!isStreaming && !capturedImage && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-center p-6">
                          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-8 h-8 text-white/50" />
                          </div>
                          <p className="text-white/60">Start camera to capture photo</p>
                        </div>
                      </div>
                    )}

                    {capturedImage ? (
                      <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
                      />
                    )}

                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Camera Controls */}
                  <div className="flex gap-3">
                    {!isStreaming ? (
                      <Button 
                        onClick={startCamera}
                        className="flex-1 bg-accent-blue hover:bg-accent-blue/90"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={captureImage}
                          className="flex-1 bg-accent-emerald hover:bg-accent-emerald/90"
                          disabled={!!capturedImage}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capture
                        </Button>
                        <Button 
                          onClick={stopCamera}
                          variant="outline"
                          className="flex-1"
                        >
                          <CameraOff className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      </>
                    )}
                  </div>

                  {capturedImage && (
                    <Button
                      onClick={() => {
                        setCapturedImage(null)
                        startCamera()
                      }}
                      variant="outline"
                      className="w-full mt-3"
                    >
                      Retake Photo
                    </Button>
                  )}
                </div>

                {/* Form Section */}
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">Step 2: Enter Details</h3>
                  
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Student Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="student_id">Student ID *</Label>
                      <Input
                        id="student_id"
                        type="text"
                        placeholder="Enter student ID"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="class_section">Class Section</Label>
                      <select
                        id="class_section"
                        value={formData.class_section}
                        onChange={(e) => setFormData({ ...formData, class_section: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="Default">Default</option>
                        <option value="Class A">Class A</option>
                        <option value="Class B">Class B</option>
                        <option value="Class C">Class C</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent-blue hover:bg-accent-blue/90"
                      disabled={isProcessing || !capturedImage}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Registering...' : 'Register Student'}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-8 pt-8 border-t">
                <h4 className="font-bold text-foreground mb-3">📝 Registration Instructions:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Good lighting</strong> is essential - face a window or lamp</li>
                  <li>• <strong>Face the camera directly</strong> - keep your face centered</li>
                  <li>• <strong>Stay 2-3 feet away</strong> from the camera</li>
                  <li>• <strong>Remove sunglasses</strong> and face coverings</li>
                  <li>• <strong>Look at the camera</strong> when capturing</li>
                  <li>• The system needs a <strong>clear face photo</strong> to enable recognition</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}