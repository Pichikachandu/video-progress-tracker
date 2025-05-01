"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VideoPlayerProps {
  src: string
  title: string
}

interface Interval {
  start: number
  end: number
}

export default function VideoPlayer({ src, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressContainerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [watchedIntervals, setWatchedIntervals] = useState<Interval[]>([])
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [currentInterval, setCurrentInterval] = useState<Interval | null>(null)
  const [isUserSeeking, setIsUserSeeking] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`video-progress-${title}`)
    if (savedData) {
      const { intervals, lastPosition } = JSON.parse(savedData)
      setWatchedIntervals(intervals)

      // Calculate progress percentage
      if (videoRef.current) {
        const videoDuration = videoRef.current.duration || 0
        if (videoDuration > 0) {
          const uniqueWatchedTime = calculateUniqueWatchedTime(intervals)
          setProgressPercentage((uniqueWatchedTime / videoDuration) * 100)
        }
      }

      // Set video to last position
      if (videoRef.current && lastPosition) {
        videoRef.current.currentTime = lastPosition
        setCurrentTime(lastPosition)
      }
    }
  }, [title])

  // Save progress to localStorage
  const saveProgress = () => {
    const data = {
      intervals: watchedIntervals,
      lastPosition: currentTime,
    }
    localStorage.setItem(`video-progress-${title}`, JSON.stringify(data))
  }

  // Calculate unique watched time by merging intervals
  const calculateUniqueWatchedTime = (intervals: Interval[]): number => {
    if (intervals.length === 0) return 0

    // Sort intervals by start time
    const sortedIntervals = [...intervals].sort((a, b) => a.start - b.start)

    // Merge overlapping intervals
    const mergedIntervals: Interval[] = []
    let currentMergedInterval = { ...sortedIntervals[0] }

    for (let i = 1; i < sortedIntervals.length; i++) {
      const interval = sortedIntervals[i]

      // If current interval overlaps with merged interval, extend the merged interval
      if (interval.start <= currentMergedInterval.end) {
        currentMergedInterval.end = Math.max(currentMergedInterval.end, interval.end)
      } else {
        // No overlap, add the merged interval to result and start a new one
        mergedIntervals.push(currentMergedInterval)
        currentMergedInterval = { ...interval }
      }
    }

    // Add the last merged interval
    mergedIntervals.push(currentMergedInterval)

    // Calculate total unique time
    return mergedIntervals.reduce((total, interval) => {
      return total + (interval.end - interval.start)
    }, 0)
  }

  // Update progress when intervals change
  useEffect(() => {
    if (duration > 0) {
      const uniqueWatchedTime = calculateUniqueWatchedTime(watchedIntervals)
      setProgressPercentage((uniqueWatchedTime / duration) * 100)
    }
  }, [watchedIntervals, duration])

  // Handle video metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration
      console.log("Video metadata loaded, duration:", videoDuration)
      setDuration(videoDuration)

      // Calculate progress percentage if we have saved intervals
      if (watchedIntervals.length > 0 && videoDuration > 0) {
        const uniqueWatchedTime = calculateUniqueWatchedTime(watchedIntervals)
        setProgressPercentage((uniqueWatchedTime / videoDuration) * 100)
      }
    }
  }

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()

        // End current interval when pausing
        if (currentInterval) {
          const newInterval = {
            start: currentInterval.start,
            end: currentTime,
          }

          // Only add interval if it has a meaningful duration
          if (newInterval.end - newInterval.start >= 0.5) {
            setWatchedIntervals((prev) => [...prev, newInterval])
          }
          setCurrentInterval(null)
        }
      } else {
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error)
          setAlertMessage("Unable to play video. Please try again.")
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 3000)
        })

        // Start a new interval when playing
        setCurrentInterval({
          start: currentTime,
          end: currentTime,
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current && !isUserSeeking) {
      const newTime = videoRef.current.currentTime
      setCurrentTime(newTime)

      // Update current interval end time
      if (isPlaying && currentInterval) {
        setCurrentInterval((prev) => {
          if (prev) {
            return { ...prev, end: newTime }
          }
          return prev
        })
      }

      // Save progress periodically (every 2 seconds)
      if (Math.floor(newTime) % 2 === 0) {
        saveProgress()
      }
    }
  }

  // Handle seeking
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressContainerRef.current && videoRef.current) {
      const rect = progressContainerRef.current.getBoundingClientRect()
      const clickPosition = (e.clientX - rect.left) / rect.width
      const newTime = clickPosition * duration

      // End current interval
      if (currentInterval) {
        const newInterval = {
          start: currentInterval.start,
          end: currentTime,
        }

        // Only add interval if it has a meaningful duration
        if (newInterval.end - newInterval.start >= 0.5) {
          setWatchedIntervals((prev) => [...prev, newInterval])
        }
      }

      // Set new time
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)

      // Start new interval if playing
      if (isPlaying) {
        setCurrentInterval({
          start: newTime,
          end: newTime,
        })
      }

      setIsUserSeeking(false)
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle video ended
  const handleEnded = () => {
    setIsPlaying(false)

    // End current interval
    if (currentInterval) {
      const newInterval = {
        start: currentInterval.start,
        end: duration,
      }

      setWatchedIntervals((prev) => [...prev, newInterval])
      setCurrentInterval(null)
    }

    // Save final progress
    saveProgress()
  }

  // Render watched segments on progress bar
  const renderWatchedSegments = () => {
    if (duration === 0) return null

    return watchedIntervals.map((interval, index) => {
      const startPercent = (interval.start / duration) * 100
      const widthPercent = ((interval.end - interval.start) / duration) * 100

      return (
        <div
          key={index}
          className="absolute h-full bg-green-500 opacity-50"
          style={{
            left: `${startPercent}%`,
            width: `${widthPercent}%`,
          }}
        />
      )
    })
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-xl">
      {/* Video */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onEnded={handleEnded}
        onClick={togglePlay}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Alert message */}
      {showAlert && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {alertMessage}
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress bar */}
        <div
          ref={progressContainerRef}
          className="relative w-full h-2 bg-gray-700 rounded-full mb-4 cursor-pointer"
          onClick={handleSeek}
          onMouseDown={() => setIsUserSeeking(true)}
        >
          {renderWatchedSegments()}
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className="absolute h-4 w-4 bg-white rounded-full -mt-1 shadow-md"
            style={{
              left: `${(currentTime / duration) * 100}%`,
              transform: "translateX(-50%)",
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause button */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="w-24 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white"
                />
              </div>
            </div>

            {/* Time display */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress percentage */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-primary/20 text-primary font-medium px-3 py-1 rounded-full text-sm">
                    {Math.round(progressPercentage)}% completed
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Based on unique parts watched</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Fullscreen button */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggleFullscreen}>
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
