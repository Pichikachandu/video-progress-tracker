import Link from "next/link"
import VideoPlayer from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Introduction to React Hooks</h1>
          <Link href="/mongodb">
            <Button variant="outline" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              MongoDB Version
            </Button>
          </Link>
        </div>

        <p className="text-gray-600 mb-6">Learn the fundamentals of React Hooks and how they can simplify your code.</p>

        <VideoPlayer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          title="Introduction to React Hooks"
        />

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">About This Lecture</h2>
          <p className="text-gray-700">
            This lecture covers the basics of React Hooks, including useState, useEffect, and useContext. You'll learn
            how to convert class components to functional components and how to manage state and side effects in a more
            elegant way.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Duration: 9:56 minutes</p>
            <p>Instructor: John Doe</p>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">MongoDB Integration</h2>
          <p className="text-gray-700 mb-4">
            This application now supports MongoDB Atlas for storing video progress data. Click the "MongoDB Version"
            button above to try the version with MongoDB integration.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-800 mb-2">Features of MongoDB Integration:</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700">
              <li>Server-side storage of viewing progress</li>
              <li>Accurate tracking of unique video segments watched</li>
              <li>Persistent progress across devices and sessions</li>
              <li>Scalable architecture for multiple users and videos</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
