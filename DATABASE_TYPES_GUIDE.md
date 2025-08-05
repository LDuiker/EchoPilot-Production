# Database Types Import Guide

This guide explains where and how to import database types in your EchoPilot project.

## 📍 **Where Database Types Are Located**

### **Main Types File**
- **File**: `database-types.ts` (root directory)
- **Purpose**: Contains all TypeScript types generated from your Supabase schema
- **Generated**: Automatically from your Supabase database schema

### **Current Import Location**
- **File**: `lib/supabase.ts`
- **Status**: ✅ Already properly configured
- **Import**: `import { Database } from '../database-types'`

## 🔧 **How to Import Database Types**

### **1. In Your Supabase Client (Already Done)**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '../database-types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### **2. In Your Components and Pages**

```typescript
// components/BusinessCard.tsx
import type { Business, User } from '@/database-types'

interface BusinessCardProps {
  business: Business
  user: User
}

export function BusinessCard({ business, user }: BusinessCardProps) {
  return (
    <div>
      <h3>{business.name}</h3>
      <p>Owner: {user.full_name}</p>
    </div>
  )
}
```

### **3. In Your API Routes**

```typescript
// pages/api/businesses/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Business, ApiResponse } from '@/database-types'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Business>>
) {
  const { id } = req.query
  
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    res.status(200).json({
      data,
      error: null,
      success: true
    })
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    })
  }
}
```

### **4. In Your Hooks**

```typescript
// hooks/useBusinesses.ts
import { useState, useEffect } from 'react'
import type { Business, ApiResponse } from '@/database-types'
import { supabase } from '@/lib/supabase'

export function useBusinesses(userId: string) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', userId)

        if (error) throw error
        setBusinesses(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [userId])

  return { businesses, loading, error }
}
```

## 📋 **Available Types to Import**

### **Table Types**
```typescript
import type {
  User,                    // users table
  Business,                // businesses table
  Review,                  // reviews table
  SentimentAnalysis,       // sentiment_analysis table
  EmailNotification,       // email_notifications table
  UserPreference,          // user_preferences table
  ReviewTag,               // review_tags table
  ApiKey                   // api_keys table
} from '@/database-types'
```

### **View Types**
```typescript
import type {
  BusinessSummary,         // business_summary view
  RecentReviewWithSentiment // recent_reviews_with_sentiment view
} from '@/database-types'
```

### **Composite Types**
```typescript
import type {
  ReviewWithSentiment,     // Review + SentimentAnalysis
  BusinessWithReviews,     // Business + Reviews
  UserWithBusinesses,      // User + Businesses
  NotificationWithBusiness // EmailNotification + Business
} from '@/database-types'
```

### **Utility Types**
```typescript
import type {
  Platform,               // 'google' | 'yelp' | 'facebook' | 'tripadvisor'
  UserRole,               // 'user' | 'admin' | 'manager'
  ReviewStatus,           // 'pending' | 'processed' | 'flagged' | 'error'
  Sentiment,              // 'positive' | 'negative' | 'neutral'
  NotificationType,       // 'new_review' | 'low_rating' | 'sentiment_alert' | 'weekly_summary' | 'system'
  NotificationStatus      // 'pending' | 'sent' | 'failed' | 'bounced'
} from '@/database-types'
```

### **Response Types**
```typescript
import type {
  ApiResponse<T>,         // Standard API response wrapper
  PaginatedResponse<T>,   // Paginated API response
  ReviewFilters,          // Review filtering options
  BusinessFilters,        // Business filtering options
  DashboardMetrics,       // Dashboard statistics
  BusinessDashboardData   // Business-specific dashboard data
} from '@/database-types'
```

## 🎯 **Common Import Patterns**

### **1. Type-Only Imports (Recommended)**
```typescript
import type { Business, User } from '@/database-types'
```

### **2. Multiple Types Import**
```typescript
import type {
  Business,
  Review,
  SentimentAnalysis,
  Platform,
  ApiResponse
} from '@/database-types'
```

### **3. All Types Import (Use Sparingly)**
```typescript
import type * as DatabaseTypes from '@/database-types'
// Usage: DatabaseTypes.Business, DatabaseTypes.User, etc.
```

### **4. Re-export for Convenience**
```typescript
// types/index.ts
export type {
  Business,
  User,
  Review,
  // ... other commonly used types
} from '@/database-types'
```

## 🔍 **TypeScript Configuration**

### **Path Mapping (Already Configured)**
Your `tsconfig.json` should include:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### **Type Checking**
```bash
# Check if types are working correctly
npm run type-check
```

## 📝 **Best Practices**

### **1. Use Type-Only Imports**
```typescript
// ✅ Good
import type { Business } from '@/database-types'

// ❌ Avoid (unless you need runtime access)
import { Business } from '@/database-types'
```

### **2. Import Only What You Need**
```typescript
// ✅ Good - specific imports
import type { Business, User } from '@/database-types'

// ❌ Avoid - importing everything
import type * as DatabaseTypes from '@/database-types'
```

### **3. Use Type Guards for Runtime Validation**
```typescript
import type { Platform } from '@/database-types'

function isValidPlatform(platform: string): platform is Platform {
  return ['google', 'yelp', 'facebook', 'tripadvisor'].includes(platform)
}
```

### **4. Leverage TypeScript's Type Inference**
```typescript
// TypeScript will infer the correct types from Supabase queries
const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('user_id', userId)

// businesses will be typed as Business[]
```

## 🛠️ **Updating Database Types**

### **When to Update**
- After schema changes in Supabase
- When adding new tables/views
- When modifying existing table structures

### **How to Update**
```bash
# Generate new types from Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > database-types.ts

# Or use the Supabase CLI
supabase gen types typescript --local > database-types.ts
```

## 🔧 **Troubleshooting**

### **Common Issues**

**1. Type Not Found**
```typescript
// ❌ Error: Cannot find type 'Business'
import type { Business } from '@/database-types'

// ✅ Solution: Check the exact export name
import type { Business } from '@/database-types'
```

**2. Path Resolution Issues**
```typescript
// ❌ Error: Module not found
import type { Business } from '@/database-types'

// ✅ Solution: Check tsconfig.json paths
// Make sure @/* is mapped to ./*
```

**3. Supabase Client Not Typed**
```typescript
// ❌ Untyped client
const supabase = createClient(url, key)

// ✅ Typed client
const supabase = createClient<Database>(url, key)
```

### **Verification Commands**
```bash
# Check if types are valid
npm run type-check

# Check if database-types.ts exists
ls database-types.ts

# Check TypeScript configuration
npx tsc --showConfig
```

## 📚 **Examples Directory**

See `examples/database-types-usage.ts` for comprehensive examples of:
- Basic type usage
- Supabase queries with types
- Insert/update operations
- Filtered queries
- Dashboard data
- React components
- Custom hooks
- Utility functions
- Error handling
- Constants with types

## 🎯 **Quick Reference**

### **Most Common Imports**
```typescript
// Basic table types
import type { User, Business, Review } from '@/database-types'

// Composite types
import type { ReviewWithSentiment, BusinessWithReviews } from '@/database-types'

// Utility types
import type { Platform, UserRole, Sentiment } from '@/database-types'

// Response types
import type { ApiResponse, PaginatedResponse } from '@/database-types'
```

### **Import Path**
```typescript
// Always use this path
import type { ... } from '@/database-types'
```

This guide should help you understand exactly where and how to import database types in your EchoPilot project. The types are already properly configured in your main Supabase client, so you can start using them immediately in your components, pages, and API routes. 