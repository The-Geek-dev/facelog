'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, UserCheck, Scan, AlertCircle, RefreshCw, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { recognizeFace, checkBackendConnection, canvasToBase64 } from '@/lib/api'

interface DetectedStudent {
  student_id: string
  name: string
  confidence: number
  timestamp: Date
}

export function LiveDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detectedStudents, setDetectedStudents] = useState<DetectedStudent[]>([])
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  const [classSection, setClassSection] = useState('Default')
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check backend connection on mount
  useEffect(() => {
    checkBackendConnection().then(setBackendAvailable)
  }, [])

  // Start webcam stream
  const startCamera = async () => {
    try {
      setError(null)
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
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Unable to access camera. Please allow camera permissions.')
    }
  }

  // Stop webcam stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    setIsStreaming(false)
    setIsScanning(false)
    setFaceBox(null)
    setScanProgress(0)
  }

  // Capture image from video and send to backend
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64 with higher quality
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95)

    try {
      // Call backend API
      const result = await recognizeFace({
        image: imageBase64,
        class_section: classSection
      })

      if (result.recognized && result.recognized.length > 0) {
        const student = result.recognized[0]
        const detected: DetectedStudent = {
          student_id: student.student_id,
          name: student.name,
          confidence: student.confidence * 100, // Convert to percentage
          timestamp: new Date()
        }
        
        setDetectedStudents(prev => {
          // Avoid duplicates
          if (prev.some(s => s.student_id === detected.student_id)) {
            return prev
          }
          return [detected, ...prev].slice(0, 5)
        })

        // Flash success
        setScanProgress(100)
        setTimeout(() => setScanProgress(0), 1000)
      }
    } catch (err: any) {
      console.error('Recognition error:', err)
      // Show specific error if it's not the expected "not recognized" error
      if (err.message?.includes('No face detected')) {
        setError('No face detected. Please face the camera directly with good lighting.')
        setTimeout(() => setError(null), 3000)
      } else if (!err.message?.includes('not recognized')) {
        setError(err.message || 'Recognition failed')
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  // Face detection simulation for visual feedback
  const simulateFaceDetection = useCallback(() => {
    if (!isStreaming || !canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (isScanning && faceBox) {
      // Draw face detection box
      ctx.strokeStyle = '#0ea5e9'
      ctx.lineWidth = 3
      ctx.strokeRect(faceBox.x, faceBox.y, faceBox.width, faceBox.height)

      // Draw corner markers
      const cornerSize = 20
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 4

      // Top-left corner
      ctx.beginPath()
      ctx.moveTo(faceBox.x, faceBox.y + cornerSize)
      ctx.lineTo(faceBox.x, faceBox.y)
      ctx.lineTo(faceBox.x + cornerSize, faceBox.y)
      ctx.stroke()

      // Top-right corner
      ctx.beginPath()
      ctx.moveTo(faceBox.x + faceBox.width - cornerSize, faceBox.y)
      ctx.lineTo(faceBox.x + faceBox.width, faceBox.y)
      ctx.lineTo(faceBox.x + faceBox.width, faceBox.y + cornerSize)
      ctx.stroke()

      // Bottom-left corner
      ctx.beginPath()
      ctx.moveTo(faceBox.x, faceBox.y + faceBox.height - cornerSize)
      ctx.lineTo(faceBox.x, faceBox.y + faceBox.height)
      ctx.lineTo(faceBox.x + cornerSize, faceBox.y + faceBox.height)
      ctx.stroke()

      // Bottom-right corner
      ctx.beginPath()
      ctx.moveTo(faceBox.x + faceBox.width - cornerSize, faceBox.y + faceBox.height)
      ctx.lineTo(faceBox.x + faceBox.width, faceBox.y + faceBox.height)
      ctx.lineTo(faceBox.x + faceBox.width, faceBox.y + faceBox.height - cornerSize)
      ctx.stroke()

      // Draw scanning line animation
      const scanLineY = faceBox.y + (faceBox.height * (scanProgress / 100))
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(faceBox.x, scanLineY)
      ctx.lineTo(faceBox.x + faceBox.width, scanLineY)
      ctx.stroke()

      // Add glow effect
      ctx.shadowColor = '#0ea5e9'
      ctx.shadowBlur = 10
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.5)'
      ctx.lineWidth = 1
      ctx.strokeRect(faceBox.x - 2, faceBox.y - 2, faceBox.width + 4, faceBox.height + 4)
      ctx.shadowBlur = 0
    }

    animationRef.current = requestAnimationFrame(simulateFaceDetection)
  }, [isStreaming, isScanning, faceBox, scanProgress])

  // Start continuous scanning
  const startScanning = () => {
    if (!isStreaming) return
    
    setIsScanning(true)
    setScanProgress(0)
    
    // Simulate face detection box (centered in video)
    const videoWidth = videoRef.current?.videoWidth || 640
    const videoHeight = videoRef.current?.videoHeight || 480
    const boxWidth = 180
    const boxHeight = 220
    
    setFaceBox({
      x: (videoWidth - boxWidth) / 2,
      y: (videoHeight - boxHeight) / 2 - 20,
      width: boxWidth,
      height: boxHeight
    })

    // Animate scan progress and capture every 3 seconds
    let progress = 0
    const interval = setInterval(() => {
      progress += 2
      setScanProgress(progress)
      
      if (progress >= 100) {
        progress = 0
        // Capture and recognize when scan completes
        if (backendAvailable) {
          captureAndRecognize()
        }
      }
    }, 30)

    scanIntervalRef.current = interval
  }

  // Stop scanning
  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setIsScanning(false)
    setFaceBox(null)
    setScanProgress(0)
  }

  // Start animation loop when streaming
  useEffect(() => {
    if (isStreaming) {
      animationRef.current = requestAnimationFrame(simulateFaceDetection)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isStreaming, simulateFaceDetection])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <section id="demo" className="relative py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-purple/10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-white/60">
              {backendAvailable === false ? 'Demo Mode (Connect Backend for Real Recognition)' : 'Live Recognition'}
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            Live Demo
          </h2>
          
          <p className="text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            {backendAvailable === false 
              ? 'Visual demo mode. Start the Flask backend (python app.py) to enable real facial recognition.'
              : 'Real-time facial recognition powered by DeepFace AI.'}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Camera Feed */}
            <div className="lg:col-span-2">
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                {/* Camera Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-accent-emerald animate-pulse' : 'bg-white/30'}`} />
                    <span className="font-semibold text-white">
                      {isStreaming ? 'Camera Active' : 'Camera Off'}
                    </span>
                    {backendAvailable === false && (
                      <span className="text-xs text-yellow-400">(Backend Offline)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isStreaming && (
                      <>
                        {!isScanning ? (
                          <Button
                            onClick={startScanning}
                            disabled={backendAvailable === false}
                            className="bg-accent-blue hover:bg-accent-blue/90 text-white"
                            size="sm"
                          >
                            <Scan className="w-4 h-4 mr-2" />
                            Start Recognition
                          </Button>
                        ) : (
                          <Button
                            onClick={stopScanning}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            size="sm"
                          >
                            Stop Recognition
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Video Container */}
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-30 pointer-events-auto">
                      <div className="text-center p-6">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <p className="text-white/70 mb-4">{error}</p>
                        <Button 
                          onClick={startCamera} 
                          variant="outline" 
                          className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isStreaming && !error && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
                      <div className="text-center p-8">
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mx-auto mb-6">
                          <Camera className="w-10 h-10 text-white/50" />
                        </div>
                        <p className="text-white/60 mb-6">Click below to start the camera</p>
                        <Button 
                          onClick={startCamera} 
                          className="bg-accent-blue hover:bg-accent-blue/90 text-white px-8 py-3 cursor-pointer relative z-20"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isStreaming ? 'opacity-100 z-0' : 'opacity-0'}`}
                  />
                  
                  <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isStreaming ? 'opacity-100 z-5' : 'opacity-0'}`}
                  />

                  {/* Scanning Overlay */}
                  {isScanning && scanProgress < 100 && backendAvailable !== false && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/80">Analyzing face...</span>
                        <span className="text-sm font-mono text-accent-blue">{scanProgress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-accent-blue to-accent-emerald"
                          initial={{ width: 0 }}
                          animate={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Flash */}
                  <AnimatePresence>
                    {scanProgress >= 100 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-accent-emerald/20 pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Camera Footer */}
                {isStreaming && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                    <div className="text-sm text-white/60">
                      {backendAvailable === false ? 'Demo Mode • No real recognition' : 'Live Mode • Real-time recognition'}
                    </div>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <CameraOff className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Log */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl h-full">
                <div className="px-6 py-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-accent-emerald" />
                    <h3 className="font-bold text-white">Attendance Log</h3>
                  </div>
                  <p className="text-sm text-white/50 mt-1">
                    {detectedStudents.length} student{detectedStudents.length !== 1 ? 's' : ''} marked present
                  </p>
                </div>

                <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {detectedStudents.length === 0 ? (
                      <div className="text-center py-12 text-white/40">
                        <Scan className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No students detected yet</p>
                        <p className="text-xs mt-1">
                          {backendAvailable === false 
                            ? 'Connect backend to start recognition' 
                            : 'Start scanning to mark attendance'}
                        </p>
                      </div>
                    ) : (
                      detectedStudents.map((student, index) => (
                        <motion.div
                          key={`${student.student_id}-${student.timestamp.getTime()}`}
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white/5 border border-white/10 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-white">{student.name}</div>
                              <div className="text-sm text-white/50">{student.student_id}</div>
                            </div>
                            <div className="flex items-center gap-1 bg-accent-emerald/20 text-accent-emerald px-2 py-1 rounded-full text-xs font-medium">
                              <UserCheck className="w-3 h-3" />
                              Present
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
                            <span>Confidence: {student.confidence.toFixed(1)}%</span>
                            <span>{student.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {detectedStudents.length > 0 && (
                  <div className="px-4 py-4 border-t border-white/10">
                    <Button
                      onClick={() => setDetectedStudents([])}
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Clear Log
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-3">
              <Settings className="w-4 h-4 text-accent-blue" />
              <span className="text-sm text-white/70">
                {backendAvailable === false 
                  ? 'Run "python app.py" to enable real facial recognition with DeepFace AI'
                  : 'Connected to Flask backend • Real-time recognition active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}