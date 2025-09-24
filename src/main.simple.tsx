// @ts-nocheck
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Simple main entry point
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Learn Academy</h1>
        <p className="text-gray-600 mb-6">Building your language learning platform...</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
        </div>
        <p className="text-sm text-gray-500">Please wait while we set up your experience</p>
      </div>
    </div>
  </StrictMode>,
)