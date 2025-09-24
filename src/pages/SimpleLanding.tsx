import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, MessageSquare, Globe, Star } from 'lucide-react';

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">Learn Academy</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/languages" className="text-gray-600 hover:text-blue-600">Languages</Link>
            <Link to="/teachers" className="text-gray-600 hover:text-blue-600">Teachers</Link>
            <Link to="/programs" className="text-gray-600 hover:text-blue-600">Programs</Link>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master New Languages with Expert Guidance
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students learning languages through our innovative platform with certified teachers and interactive programs.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/languages">Browse Languages</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Expert Teachers</CardTitle>
              <CardDescription>
                Learn from certified native speakers and experienced language instructors
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Structured Programs</CardTitle>
              <CardDescription>
                Follow carefully designed curricula that take you from beginner to fluent
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Interactive Learning</CardTitle>
              <CardDescription>
                Practice through quizzes, assignments, and live video sessions
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Languages */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Available Languages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">English</h3>
              <p className="text-gray-600">Business and conversational English</p>
            </div>
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <Globe className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Spanish</h3>
              <p className="text-gray-600">Latin American and European Spanish</p>
            </div>
            <div className="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Arabic</h3>
              <p className="text-gray-600">Modern Standard Arabic</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Learn Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}