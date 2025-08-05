import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { UserRole } from '../../database-types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback,
  redirectTo = '/auth'
}) => {
  const { user, profile, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!user || !profile) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Redirect to auth page
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo
    }
    return null
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Required roles: {requiredRoles.join(', ')}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and has required role
  return <>{children}</>
}

// Convenience components for specific roles
export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={['admin']} />
)

export const ManagerRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={['admin', 'manager']} />
)

export const UserRoute: React.FC<Omit<ProtectedRouteProps, 'requiredRoles'>> = (props) => (
  <ProtectedRoute {...props} requiredRoles={['admin', 'manager', 'user']} />
) 