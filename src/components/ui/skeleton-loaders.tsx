import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Base skeleton components
export function SkeletonText({ 
  lines = 1, 
  className,
  width = "full" 
}: { 
  lines?: number
  className?: string
  width?: "full" | "3/4" | "1/2" | "1/3" | "1/4"
}) {
  const widthClasses = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2", 
    "1/3": "w-1/3",
    "1/4": "w-1/4"
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? widthClasses["3/4"] : widthClasses[width]
          )} 
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }
  
  return <Skeleton className={cn("rounded-full", sizeClasses[size])} />
}

export function SkeletonButton({ variant = "default" }: { variant?: "default" | "outline" | "ghost" }) {
  return <Skeleton className="h-9 w-20 rounded-md" />
}

export function SkeletonBadge() {
  return <Skeleton className="h-5 w-16 rounded-full" />
}

// Dashboard skeleton components
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <SkeletonAvatar size="sm" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}: { 
  rows?: number
  columns?: number
  showHeader?: boolean 
}) {
  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex space-x-4 pb-2 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// List skeleton
export function ListSkeleton({ 
  items = 5,
  showAvatar = true,
  showActions = true 
}: { 
  items?: number
  showAvatar?: boolean
  showActions?: boolean 
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          {showAvatar && <SkeletonAvatar />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showActions && (
            <div className="flex space-x-2">
              <SkeletonButton />
              <SkeletonButton />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Card skeleton
export function CardSkeleton({ 
  showImage = false,
  showActions = true 
}: { 
  showImage?: boolean
  showActions?: boolean 
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <SkeletonAvatar />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showImage && <Skeleton className="h-48 w-full rounded-md" />}
        <SkeletonText lines={3} />
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <SkeletonButton />
            <SkeletonButton />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Form skeleton
export function FormSkeleton({ 
  fields = 4,
  showSubmit = true 
}: { 
  fields?: number
  showSubmit?: boolean 
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      {showSubmit && (
        <div className="flex space-x-2 pt-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
        </div>
      )}
    </div>
  )
}

// Quiz skeleton
export function QuizSkeleton() {
  return (
    <div className="space-y-6">
      {/* Quiz header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-full" />
          <SkeletonText lines={2} />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  )
}

// Meeting skeleton
export function MeetingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Meeting header */}
      <div className="text-center space-y-3">
        <Skeleton className="h-10 w-72 mx-auto" />
        <div className="flex items-center justify-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Video area */}
      <Card>
        <CardContent className="p-0">
          <Skeleton className="h-96 w-full rounded-t-lg" />
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-12 rounded-full" />
        ))}
      </div>

      {/* Participants */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <SkeletonAvatar size="lg" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="text-center md:text-left space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <FormSkeleton fields={6} />
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics skeleton
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Data table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} columns={5} />
        </CardContent>
      </Card>
    </div>
  )
}