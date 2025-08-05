// =====================================================
// EchoPilot Database Types
// Generated from Supabase schema
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'user' | 'admin' | 'manager'
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'manager'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'manager'
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string | null
          phone: string | null
          website: string | null
          google_place_id: string | null
          yelp_business_id: string | null
          facebook_page_id: string | null
          is_active: boolean
          monitor_google: boolean
          monitor_yelp: boolean
          monitor_facebook: boolean
          rating_threshold: number
          review_count_threshold: number
          industry: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address?: string | null
          phone?: string | null
          website?: string | null
          google_place_id?: string | null
          yelp_business_id?: string | null
          facebook_page_id?: string | null
          is_active?: boolean
          monitor_google?: boolean
          monitor_yelp?: boolean
          monitor_facebook?: boolean
          rating_threshold?: number
          review_count_threshold?: number
          industry?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string | null
          phone?: string | null
          website?: string | null
          google_place_id?: string | null
          yelp_business_id?: string | null
          facebook_page_id?: string | null
          is_active?: boolean
          monitor_google?: boolean
          monitor_yelp?: boolean
          monitor_facebook?: boolean
          rating_threshold?: number
          review_count_threshold?: number
          industry?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          business_id: string
          review_text: string
          rating: number
          review_date: string
          platform: 'google' | 'yelp' | 'facebook' | 'tripadvisor'
          platform_review_id: string | null
          platform_user_name: string | null
          platform_user_avatar: string | null
          status: 'pending' | 'processed' | 'flagged' | 'error'
          is_verified: boolean
          language: string
          helpful_votes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          review_text: string
          rating: number
          review_date: string
          platform: 'google' | 'yelp' | 'facebook' | 'tripadvisor'
          platform_review_id?: string | null
          platform_user_name?: string | null
          platform_user_avatar?: string | null
          status?: 'pending' | 'processed' | 'flagged' | 'error'
          is_verified?: boolean
          language?: string
          helpful_votes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          review_text?: string
          rating?: number
          review_date?: string
          platform?: 'google' | 'yelp' | 'facebook' | 'tripadvisor'
          platform_review_id?: string | null
          platform_user_name?: string | null
          platform_user_avatar?: string | null
          status?: 'pending' | 'processed' | 'flagged' | 'error'
          is_verified?: boolean
          language?: string
          helpful_votes?: number
          created_at?: string
          updated_at?: string
        }
      }
      sentiment_analysis: {
        Row: {
          id: string
          review_id: string
          overall_sentiment: 'positive' | 'negative' | 'neutral'
          sentiment_score: number
          positive_aspects: string[] | null
          negative_aspects: string[] | null
          key_phrases: string[] | null
          model_version: string | null
          confidence_score: number | null
          processed_at: string
          processing_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          overall_sentiment: 'positive' | 'negative' | 'neutral'
          sentiment_score: number
          positive_aspects?: string[] | null
          negative_aspects?: string[] | null
          key_phrases?: string[] | null
          model_version?: string | null
          confidence_score?: number | null
          processed_at?: string
          processing_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          overall_sentiment?: 'positive' | 'negative' | 'neutral'
          sentiment_score?: number
          positive_aspects?: string[] | null
          negative_aspects?: string[] | null
          key_phrases?: string[] | null
          model_version?: string | null
          confidence_score?: number | null
          processed_at?: string
          processing_time_ms?: number | null
          created_at?: string
        }
      }
      email_notifications: {
        Row: {
          id: string
          user_id: string
          business_id: string | null
          subject: string
          body: string
          notification_type: 'new_review' | 'low_rating' | 'sentiment_alert' | 'weekly_summary' | 'system'
          status: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id?: string | null
          subject: string
          body: string
          notification_type: 'new_review' | 'low_rating' | 'sentiment_alert' | 'weekly_summary' | 'system'
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string | null
          subject?: string
          body?: string
          notification_type?: 'new_review' | 'low_rating' | 'sentiment_alert' | 'weekly_summary' | 'system'
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications_enabled: boolean
          daily_digest_enabled: boolean
          weekly_summary_enabled: boolean
          low_rating_alerts: boolean
          sentiment_alerts: boolean
          new_review_alerts: boolean
          rating_alert_threshold: number
          sentiment_threshold: number
          timezone: string
          quiet_hours_start: string
          quiet_hours_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications_enabled?: boolean
          daily_digest_enabled?: boolean
          weekly_summary_enabled?: boolean
          low_rating_alerts?: boolean
          new_review_alerts?: boolean
          sentiment_alerts?: boolean
          rating_alert_threshold?: number
          sentiment_threshold?: number
          timezone?: string
          quiet_hours_start?: string
          quiet_hours_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications_enabled?: boolean
          daily_digest_enabled?: boolean
          weekly_summary_enabled?: boolean
          low_rating_alerts?: boolean
          sentiment_alerts?: boolean
          new_review_alerts?: boolean
          rating_alert_threshold?: number
          sentiment_threshold?: number
          timezone?: string
          quiet_hours_start?: string
          quiet_hours_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      review_tags: {
        Row: {
          id: string
          review_id: string
          tag_name: string
          tag_category: string
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          tag_name: string
          tag_category?: string
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          tag_name?: string
          tag_category?: string
          confidence_score?: number | null
          created_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          permissions: string[]
          is_active: boolean
          last_used_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          permissions?: string[]
          is_active?: boolean
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          permissions?: string[]
          is_active?: boolean
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      business_summary: {
        Row: {
          id: string | null
          name: string | null
          user_id: string | null
          is_active: boolean | null
          total_reviews: number | null
          average_rating: number | null
          low_rating_count: number | null
          negative_sentiment_count: number | null
          latest_review_date: string | null
        }
      }
      recent_reviews_with_sentiment: {
        Row: {
          id: string | null
          business_id: string | null
          business_name: string | null
          review_text: string | null
          rating: number | null
          review_date: string | null
          platform: string | null
          overall_sentiment: string | null
          sentiment_score: number | null
          confidence_score: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// =====================================================
// Type Aliases for Common Patterns
// =====================================================

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type SentimentAnalysis = Database['public']['Tables']['sentiment_analysis']['Row']
export type SentimentAnalysisInsert = Database['public']['Tables']['sentiment_analysis']['Insert']
export type SentimentAnalysisUpdate = Database['public']['Tables']['sentiment_analysis']['Update']

export type EmailNotification = Database['public']['Tables']['email_notifications']['Row']
export type EmailNotificationInsert = Database['public']['Tables']['email_notifications']['Insert']
export type EmailNotificationUpdate = Database['public']['Tables']['email_notifications']['Update']

export type UserPreference = Database['public']['Tables']['user_preferences']['Row']
export type UserPreferenceInsert = Database['public']['Tables']['user_preferences']['Insert']
export type UserPreferenceUpdate = Database['public']['Tables']['user_preferences']['Update']

export type ReviewTag = Database['public']['Tables']['review_tags']['Row']
export type ReviewTagInsert = Database['public']['Tables']['review_tags']['Insert']
export type ReviewTagUpdate = Database['public']['Tables']['review_tags']['Update']

export type ApiKey = Database['public']['Tables']['api_keys']['Row']
export type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert']
export type ApiKeyUpdate = Database['public']['Tables']['api_keys']['Update']

export type BusinessSummary = Database['public']['Views']['business_summary']['Row']
export type RecentReviewWithSentiment = Database['public']['Views']['recent_reviews_with_sentiment']['Row']

// =====================================================
// Utility Types
// =====================================================

export type Platform = 'google' | 'yelp' | 'facebook' | 'tripadvisor'
export type UserRole = 'user' | 'admin' | 'manager'
export type ReviewStatus = 'pending' | 'processed' | 'flagged' | 'error'
export type Sentiment = 'positive' | 'negative' | 'neutral'
export type NotificationType = 'new_review' | 'low_rating' | 'sentiment_alert' | 'weekly_summary' | 'system'
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'bounced'

// =====================================================
// Extended Types for Business Logic
// =====================================================

export interface ReviewWithSentiment extends Review {
  sentiment_analysis?: SentimentAnalysis | null
  tags?: ReviewTag[]
}

export interface BusinessWithReviews extends Business {
  reviews?: ReviewWithSentiment[]
  summary?: BusinessSummary
}

export interface UserWithBusinesses extends User {
  businesses?: BusinessWithReviews[]
  preferences?: UserPreference
}

export interface NotificationWithBusiness extends EmailNotification {
  business?: Business | null
}

// =====================================================
// API Response Types
// =====================================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error: string | null
  success: boolean
}

// =====================================================
// Filter and Query Types
// =====================================================

export interface ReviewFilters {
  business_id?: string
  platform?: Platform
  rating?: number
  status?: ReviewStatus
  date_from?: string
  date_to?: string
  sentiment?: Sentiment
  search?: string
}

export interface BusinessFilters {
  user_id?: string
  is_active?: boolean
  industry?: string
  search?: string
}

export interface NotificationFilters {
  user_id?: string
  business_id?: string
  type?: NotificationType
  status?: NotificationStatus
  date_from?: string
  date_to?: string
}

// =====================================================
// Dashboard Types
// =====================================================

export interface DashboardMetrics {
  totalBusinesses: number
  totalReviews: number
  averageRating: number
  negativeReviewsCount: number
  recentReviewsCount: number
  sentimentDistribution: {
    positive: number
    negative: number
    neutral: number
  }
  platformDistribution: Record<Platform, number>
}

export interface BusinessDashboardData {
  business: Business
  summary: BusinessSummary
  recentReviews: RecentReviewWithSentiment[]
  metrics: {
    totalReviews: number
    averageRating: number
    negativeReviewsCount: number
    sentimentDistribution: {
      positive: number
      negative: number
      neutral: number
    }
  }
}

// =====================================================
// Webhook and Integration Types
// =====================================================

export interface PlatformWebhookPayload {
  platform: Platform
  business_id: string
  review_id: string
  review_data: {
    text: string
    rating: number
    date: string
    user_name?: string
    user_avatar?: string
  }
}

export interface SentimentAnalysisRequest {
  review_id: string
  text: string
  language?: string
}

export interface SentimentAnalysisResponse {
  review_id: string
  overall_sentiment: Sentiment
  sentiment_score: number
  positive_aspects?: string[]
  negative_aspects?: string[]
  key_phrases?: string[]
  confidence_score: number
  processing_time_ms: number
}

// =====================================================
// Configuration Types
// =====================================================

export interface NotificationConfig {
  email_notifications_enabled: boolean
  daily_digest_enabled: boolean
  weekly_summary_enabled: boolean
  low_rating_alerts: boolean
  sentiment_alerts: boolean
  new_review_alerts: boolean
  rating_alert_threshold: number
  sentiment_threshold: number
  timezone: string
  quiet_hours_start: string
  quiet_hours_end: string
}

export interface BusinessConfig {
  is_active: boolean
  monitor_google: boolean
  monitor_yelp: boolean
  monitor_facebook: boolean
  rating_threshold: number
  review_count_threshold: number
  timezone: string
}

// =====================================================
// Export Default
// =====================================================

export default Database 