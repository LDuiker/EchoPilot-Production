import React, { useState } from 'react'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'
import { PasswordResetForm } from './PasswordResetForm'

type AuthMode = 'signin' | 'signup' | 'password-reset'

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin')

  const handleSwitchToSignUp = () => setAuthMode('signup')
  const handleSwitchToSignIn = () => setAuthMode('signin')
  const handleShowPasswordReset = () => setAuthMode('password-reset')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EchoPilot</h1>
          <p className="text-gray-600">Review Monitoring Platform</p>
        </div>

        {/* Auth Forms */}
        {authMode === 'signin' && (
          <SignInForm
            onSwitchToSignUp={handleSwitchToSignUp}
            onShowPasswordReset={handleShowPasswordReset}
          />
        )}

        {authMode === 'signup' && (
          <SignUpForm onSwitchToSignIn={handleSwitchToSignIn} />
        )}

        {authMode === 'password-reset' && (
          <PasswordResetForm onBackToSignIn={handleSwitchToSignIn} />
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By using EchoPilot, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 