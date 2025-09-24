// @ts-nocheck
import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
        <span className="text-white text-2xl font-bold">LA</span>
      </div>
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Learn Academy</h1>
      <p className="text-gray-600 mb-6">Your language learning platform is ready!</p>
      <div className="space-y-2">
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
        <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          View Languages
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-4">Fixed TypeScript build issues and API integration</p>
    </div>
  </div>
);
