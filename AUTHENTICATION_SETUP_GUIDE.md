# EchoPilot Authentication System Setup Guide

This guide will help you set up the complete authentication system for EchoPilot using Supabase Auth.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Schema Setup](#database-schema-setup)
6. [Installation and Setup](#installation-and-setup)
7. [Usage Examples](#usage-examples)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- (Optional) Google Cloud Console account for OAuth

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note down your project URL and anon key

### 2. Configure Authentication Settings

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`
   - **Enable email confirmations**: Yes
   - **Enable email change confirmations**: Yes

### 3. Set Up Email Templates

1. Go to **Authentication > Email Templates**
2. Customize the following templates:
   - **Confirm signup**
   - **Reset password**
   - **Change email address**

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Configure the consent screen:
   - User Type: External
   - App name: EchoPilot
   - User support email: your email
   - Developer contact information: your email

### 3. Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Configure:
   - Application type: Web application
   - Name: EchoPilot Web Client
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
4. Note down the Client ID and Client Secret

### 4. Configure Supabase OAuth

1. In Supabase dashboard, go to **Authentication > Providers**
2. Enable Google provider
3. Enter your Google Client ID and Client Secret
4. Save the configuration

## Environment Configuration

1. Copy `env.example` to `.env.local`
2. Fill in the required values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema Setup

1. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
2. This will create all necessary tables, indexes, and RLS policies

## Installation and Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access the Application

Open [http://localhost:3000/auth](http://localhost:3000/auth) in your browser.

## Usage Examples

### Basic Authentication Flow

```tsx
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { user, profile, signIn, signOut } = useAuth()

  if (!user) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <h1>Welcome, {profile?.full_name}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protected Routes

```tsx
import { ProtectedRoute, AdminRoute } from '../components/auth/ProtectedRoute'

// Basic protection
<ProtectedRoute>
  <AdminDashboard />
</ProtectedRoute>

// Role-based protection
<AdminRoute>
  <AdminOnlyComponent />
</AdminRoute>

<ManagerRoute>
  <ManagerComponent />
</ManagerRoute>
```

### User Profile Management

```tsx
import { UserProfile } from '../components/auth/UserProfile'

function SettingsPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <UserProfile />
    </div>
  )
}
```

## Features Included

### ✅ Authentication Methods
- Email/password registration and login
- Google OAuth integration
- Email verification
- Password reset functionality

### ✅ User Management
- User profile creation and updates
- Password change functionality
- Account settings management
- Session management

### ✅ Security Features
- Row Level Security (RLS) policies
- Role-based access control
- Protected routes
- Form validation
- Error handling

### ✅ UI/UX Features
- Responsive design
- Loading states
- Error messages
- Success feedback
- Modern UI with Tailwind CSS

### ✅ Role-Based Access Control
- `user` - Basic user access
- `manager` - Manager-level access
- `admin` - Full administrative access

## Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. RLS Policies
- All tables have RLS enabled
- Users can only access their own data
- Admins have broader access based on policies

### 3. Password Security
- Passwords are hashed by Supabase
- Minimum 8 characters required
- Must contain uppercase, lowercase, and number

### 4. Session Management
- Sessions are managed by Supabase
- Automatic token refresh
- Secure session storage

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- Check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Ensure the key is from the correct project

#### 2. Google OAuth Not Working
- Verify Google Client ID and Secret in Supabase
- Check redirect URIs in Google Cloud Console
- Ensure Google+ API is enabled

#### 3. Email Not Sending
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder

#### 4. RLS Policy Errors
- Ensure user is authenticated
- Check user role permissions
- Verify RLS policies are correctly applied

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
NEXT_PUBLIC_DEBUG=true
```

### Getting Help

1. Check Supabase documentation
2. Review browser console for errors
3. Check Supabase dashboard logs
4. Verify environment variables

## Production Deployment

### 1. Update Environment Variables
- Use production Supabase project
- Update redirect URLs
- Set production app URL

### 2. Build and Deploy
```bash
npm run build
npm start
```

### 3. Configure Domain
- Update Supabase site URL
- Configure custom domain if needed
- Update Google OAuth redirect URIs

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

This authentication system provides a solid foundation for EchoPilot with enterprise-grade security and user experience. All components are production-ready and follow best practices for modern web applications. 