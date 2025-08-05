// =====================================================
// Database Types Usage Examples
// EchoPilot Project
// =====================================================

import { supabase } from '@/lib/supabase'
import type { 
  Database,
  User,
  Business,
  Review,
  SentimentAnalysis,
  BusinessSummary,
  ReviewWithSentiment,
  BusinessWithReviews,
  UserWithBusinesses,
  Platform,
  UserRole,
  ReviewStatus,
  Sentiment,
  NotificationType,
  ApiResponse,
  PaginatedResponse,
  ReviewFilters,
  BusinessFilters,
  DashboardMetrics,
  BusinessDashboardData
} from '@/database-types'

// =====================================================
// 1. BASIC TYPE USAGE
// =====================================================

// Type-safe user data
const user: User = {
  id: 'user-uuid',
  email: 'user@example.com',
  full_name: 'John Doe',
  avatar_url: null,
  role: 'user',
  is_active: true,
  last_login_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// Type-safe business data
const business: Business = {
  id: 'business-uuid',
  user_id: 'user-uuid',
  name: 'My Restaurant',
  address: '123 Main St',
  phone: '+1234567890',
  website: 'https://myrestaurant.com',
  google_place_id: 'ChIJ...',
  yelp_business_id: 'yelp-id',
  facebook_page_id: null,
  is_active: true,
  monitor_google: true,
  monitor_yelp: true,
  monitor_facebook: false,
  rating_threshold: 3.0,
  review_count_threshold: 10,
  industry: 'Restaurant',
  timezone: 'America/New_York',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// =====================================================
// 2. SUPABASE QUERIES WITH TYPES
// =====================================================

// Get user with type safety
export async function getUser(userId: string): Promise<ApiResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    return {
      data,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// Get businesses with reviews and sentiment
export async function getBusinessesWithReviews(
  userId: string
): Promise<ApiResponse<BusinessWithReviews[]>> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        reviews (
          *,
          sentiment_analysis (*),
          review_tags (*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error

    return {
      data: data as BusinessWithReviews[],
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// Get business summary from view
export async function getBusinessSummary(
  businessId: string
): Promise<ApiResponse<BusinessSummary>> {
  try {
    const { data, error } = await supabase
      .from('business_summary')
      .select('*')
      .eq('id', businessId)
      .single()

    if (error) throw error

    return {
      data,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// =====================================================
// 3. INSERT/UPDATE OPERATIONS WITH TYPES
// =====================================================

// Insert new business with type safety
export async function createBusiness(
  businessData: Omit<Business, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<Business>> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single()

    if (error) throw error

    return {
      data,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// Update business with type safety
export async function updateBusiness(
  businessId: string,
  updates: Partial<Business>
): Promise<ApiResponse<Business>> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single()

    if (error) throw error

    return {
      data,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// =====================================================
// 4. FILTERED QUERIES WITH TYPES
// =====================================================

// Get reviews with filters
export async function getReviews(
  filters: ReviewFilters,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<ReviewWithSentiment>> {
  try {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        sentiment_analysis (*),
        review_tags (*)
      `)

    // Apply filters
    if (filters.business_id) {
      query = query.eq('business_id', filters.business_id)
    }
    if (filters.platform) {
      query = query.eq('platform', filters.platform)
    }
    if (filters.rating) {
      query = query.eq('rating', filters.rating)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.date_from) {
      query = query.gte('review_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('review_date', filters.date_to)
    }
    if (filters.search) {
      query = query.ilike('review_text', `%${filters.search}%`)
    }

    // Get total count
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    // Get paginated data
    const { data, error } = await query
      .order('review_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      data: data as ReviewWithSentiment[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      },
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// =====================================================
// 5. DASHBOARD DATA WITH TYPES
// =====================================================

// Get dashboard metrics
export async function getDashboardMetrics(
  userId: string
): Promise<ApiResponse<DashboardMetrics>> {
  try {
    // Get business summaries
    const { data: summaries, error: summaryError } = await supabase
      .from('business_summary')
      .select('*')
      .eq('user_id', userId)

    if (summaryError) throw summaryError

    // Calculate metrics
    const totalBusinesses = summaries?.length || 0
    const totalReviews = summaries?.reduce((sum, s) => sum + (s.total_reviews || 0), 0) || 0
    const averageRating = summaries?.reduce((sum, s) => sum + (s.average_rating || 0), 0) / totalBusinesses || 0
    const negativeReviewsCount = summaries?.reduce((sum, s) => sum + (s.low_rating_count || 0), 0) || 0

    // Get recent reviews count
    const { count: recentReviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', summaries?.map(s => s.id).filter(Boolean))
      .gte('review_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    // Get sentiment distribution
    const { data: sentimentData } = await supabase
      .from('sentiment_analysis')
      .select('overall_sentiment')
      .in('review_id', summaries?.map(s => s.id).filter(Boolean) || [])

    const sentimentDistribution = {
      positive: sentimentData?.filter(s => s.overall_sentiment === 'positive').length || 0,
      negative: sentimentData?.filter(s => s.overall_sentiment === 'negative').length || 0,
      neutral: sentimentData?.filter(s => s.overall_sentiment === 'neutral').length || 0
    }

    // Get platform distribution
    const { data: platformData } = await supabase
      .from('reviews')
      .select('platform')
      .in('business_id', summaries?.map(s => s.id).filter(Boolean) || [])

    const platformDistribution: Record<Platform, number> = {
      google: platformData?.filter(r => r.platform === 'google').length || 0,
      yelp: platformData?.filter(r => r.platform === 'yelp').length || 0,
      facebook: platformData?.filter(r => r.platform === 'facebook').length || 0,
      tripadvisor: platformData?.filter(r => r.platform === 'tripadvisor').length || 0
    }

    const metrics: DashboardMetrics = {
      totalBusinesses,
      totalReviews,
      averageRating,
      negativeReviewsCount,
      recentReviewsCount: recentReviewsCount || 0,
      sentimentDistribution,
      platformDistribution
    }

    return {
      data: metrics,
      error: null,
      success: true
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }
  }
}

// =====================================================
// 6. REACT COMPONENT EXAMPLES
// =====================================================

// Example React component using types
export function BusinessCard({ business }: { business: Business }) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{business.name}</h3>
      <p className="text-gray-600">{business.address}</p>
      <div className="flex gap-2 mt-2">
        {business.monitor_google && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Google</span>}
        {business.monitor_yelp && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Yelp</span>}
        {business.monitor_facebook && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Facebook</span>}
      </div>
    </div>
  )
}

// Example hook using types
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
          .eq('is_active', true)

        if (error) throw error
        setBusinesses(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch businesses')
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [userId])

  return { businesses, loading, error }
}

// =====================================================
// 7. UTILITY FUNCTIONS WITH TYPES
// =====================================================

// Type-safe platform validation
export function isValidPlatform(platform: string): platform is Platform {
  return ['google', 'yelp', 'facebook', 'tripadvisor'].includes(platform)
}

// Type-safe sentiment validation
export function isValidSentiment(sentiment: string): sentiment is Sentiment {
  return ['positive', 'negative', 'neutral'].includes(sentiment)
}

// Type-safe user role validation
export function isValidUserRole(role: string): role is UserRole {
  return ['user', 'admin', 'manager'].includes(role)
}

// Format review data with type safety
export function formatReviewData(review: Review): {
  id: string
  text: string
  rating: number
  platform: Platform
  date: string
  status: ReviewStatus
} {
  return {
    id: review.id,
    text: review.review_text,
    rating: review.rating,
    platform: review.platform,
    date: review.review_date,
    status: review.status
  }
}

// =====================================================
// 8. ERROR HANDLING WITH TYPES
// =====================================================

// Type-safe error handling
export function handleSupabaseError(error: any): string {
  if (error?.code === 'PGRST116') {
    return 'No data found'
  }
  if (error?.code === '23505') {
    return 'Duplicate entry found'
  }
  if (error?.code === '23503') {
    return 'Referenced record does not exist'
  }
  return error?.message || 'An unknown error occurred'
}

// Type-safe response validation
export function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.success === 'boolean' &&
    (response.data !== undefined || response.error !== null)
  )
}

// =====================================================
// 9. CONSTANTS WITH TYPES
// =====================================================

// Platform options with type safety
export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'google', label: 'Google' },
  { value: 'yelp', label: 'Yelp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tripadvisor', label: 'TripAdvisor' }
]

// User role options with type safety
export const USER_ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'user', label: 'User' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' }
]

// Notification type options with type safety
export const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: 'new_review', label: 'New Review' },
  { value: 'low_rating', label: 'Low Rating' },
  { value: 'sentiment_alert', label: 'Sentiment Alert' },
  { value: 'weekly_summary', label: 'Weekly Summary' },
  { value: 'system', label: 'System' }
]

// =====================================================
// 10. EXPORT ALL TYPES FOR EASY IMPORT
// =====================================================

// Re-export commonly used types
export type {
  Database,
  User,
  Business,
  Review,
  SentimentAnalysis,
  BusinessSummary,
  ReviewWithSentiment,
  BusinessWithReviews,
  UserWithBusinesses,
  Platform,
  UserRole,
  ReviewStatus,
  Sentiment,
  NotificationType,
  ApiResponse,
  PaginatedResponse,
  ReviewFilters,
  BusinessFilters,
  DashboardMetrics,
  BusinessDashboardData
} from '@/database-types' 