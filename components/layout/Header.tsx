import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User as DatabaseUser } from '@/database-types'

interface HeaderProps {
  user: SupabaseUser | null
  profile: DatabaseUser | null
  onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ user, profile, onMenuClick }) => {
  const { signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">EchoPilot</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && profile && (
            <>
              <span className="text-sm text-gray-600">
                Welcome, {profile.full_name || user.email}
              </span>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
} 