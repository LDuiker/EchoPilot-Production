import { createClient } from '@supabase/supabase-js'
import { Database } from '../database-types'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create sample users
    console.log('Creating sample users...')
    
    const { data: user1, error: user1Error } = await supabase
      .from('users')
      .insert({
        full_name: 'John Smith',
        email: 'john@example.com',
        role: 'business_owner',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      })
      .select()
      .single()

    if (user1Error) throw user1Error

    const { data: user2, error: user2Error } = await supabase
      .from('users')
      .insert({
        full_name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'business_owner',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      })
      .select()
      .single()

    if (user2Error) throw user2Error

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert({
        full_name: 'Admin User',
        email: 'admin@echopilot.com',
        role: 'admin',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      })
      .select()
      .single()

    if (adminError) throw adminError

    // Create sample businesses
    console.log('Creating sample businesses...')
    
    const { data: business1, error: business1Error } = await supabase
      .from('businesses')
      .insert({
        user_id: user1.id,
        name: 'Downtown Coffee Shop',
        description: 'A cozy coffee shop in the heart of downtown',
        address: '123 Main St, Downtown, CA 90210',
        phone: '+1-555-0123',
        website: 'https://downtowncoffee.com',
        google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        yelp_business_id: 'downtown-coffee-shop-downtown',
        is_monitoring_enabled: true,
        monitoring_frequency: 'daily'
      })
      .select()
      .single()

    if (business1Error) throw business1Error

    const { data: business2, error: business2Error } = await supabase
      .from('businesses')
      .insert({
        user_id: user2.id,
        name: 'Tech Solutions Inc',
        description: 'Innovative technology solutions for modern businesses',
        address: '456 Innovation Ave, Tech City, CA 90211',
        phone: '+1-555-0456',
        website: 'https://techsolutions.com',
        google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY5',
        yelp_business_id: 'tech-solutions-inc-tech-city',
        is_monitoring_enabled: true,
        monitoring_frequency: 'daily'
      })
      .select()
      .single()

    if (business2Error) throw business2Error

    // Create sample reviews
    console.log('Creating sample reviews...')
    
    const reviews = [
      {
        business_id: business1.id,
        platform: 'google',
        platform_review_id: 'google_review_1',
        reviewer_name: 'Alice Johnson',
        reviewer_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rating: 5,
        review_text: 'Amazing coffee and great atmosphere! The baristas are friendly and the pastries are delicious. Highly recommend!',
        review_date: new Date('2024-01-15T10:30:00Z'),
        review_url: 'https://maps.google.com/review/1',
        is_processed: true,
        processing_status: 'completed'
      },
      {
        business_id: business1.id,
        platform: 'yelp',
        platform_review_id: 'yelp_review_1',
        reviewer_name: 'Bob Wilson',
        reviewer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        rating: 4,
        review_text: 'Good coffee and nice staff. The place is a bit crowded during peak hours, but the quality makes up for it.',
        review_date: new Date('2024-01-14T14:20:00Z'),
        review_url: 'https://www.yelp.com/review/1',
        is_processed: true,
        processing_status: 'completed'
      },
      {
        business_id: business1.id,
        platform: 'google',
        platform_review_id: 'google_review_2',
        reviewer_name: 'Carol Davis',
        reviewer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        rating: 3,
        review_text: 'The coffee is okay, but the service was slow. The staff seemed overwhelmed during busy times.',
        review_date: new Date('2024-01-13T09:15:00Z'),
        review_url: 'https://maps.google.com/review/2',
        is_processed: true,
        processing_status: 'completed'
      },
      {
        business_id: business2.id,
        platform: 'google',
        platform_review_id: 'google_review_3',
        reviewer_name: 'David Brown',
        reviewer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rating: 5,
        review_text: 'Excellent service and technical expertise! They helped us modernize our entire IT infrastructure. Professional team and great results.',
        review_date: new Date('2024-01-16T11:45:00Z'),
        review_url: 'https://maps.google.com/review/3',
        is_processed: true,
        processing_status: 'completed'
      },
      {
        business_id: business2.id,
        platform: 'yelp',
        platform_review_id: 'yelp_review_2',
        reviewer_name: 'Emma Garcia',
        reviewer_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        rating: 4,
        review_text: 'Great technical solutions and responsive support. The team is knowledgeable and delivered on time. Would recommend for any business looking to upgrade their tech.',
        review_date: new Date('2024-01-15T16:30:00Z'),
        review_url: 'https://www.yelp.com/review/2',
        is_processed: true,
        processing_status: 'completed'
      }
    ]

    const { data: insertedReviews, error: reviewsError } = await supabase
      .from('reviews')
      .insert(reviews)
      .select()

    if (reviewsError) throw reviewsError

    // Create sample sentiment analysis
    console.log('Creating sample sentiment analysis...')
    
    const sentimentAnalysis = [
      {
        review_id: insertedReviews[0].id,
        overall_sentiment: 'positive',
        sentiment_score: 0.85,
        confidence_score: 0.92,
        key_topics: ['coffee', 'atmosphere', 'staff', 'pastries'],
        key_phrases: ['amazing coffee', 'great atmosphere', 'friendly baristas', 'delicious pastries'],
        analysis_metadata: {
          language: 'en',
          model_version: '1.0',
          processing_time_ms: 150
        }
      },
      {
        review_id: insertedReviews[1].id,
        overall_sentiment: 'positive',
        sentiment_score: 0.65,
        confidence_score: 0.78,
        key_topics: ['coffee', 'staff', 'crowding'],
        key_phrases: ['good coffee', 'nice staff', 'bit crowded'],
        analysis_metadata: {
          language: 'en',
          model_version: '1.0',
          processing_time_ms: 120
        }
      },
      {
        review_id: insertedReviews[2].id,
        overall_sentiment: 'neutral',
        sentiment_score: 0.15,
        confidence_score: 0.85,
        key_topics: ['coffee', 'service', 'staff'],
        key_phrases: ['coffee is okay', 'service was slow', 'staff seemed overwhelmed'],
        analysis_metadata: {
          language: 'en',
          model_version: '1.0',
          processing_time_ms: 135
        }
      },
      {
        review_id: insertedReviews[3].id,
        overall_sentiment: 'positive',
        sentiment_score: 0.95,
        confidence_score: 0.96,
        key_topics: ['service', 'expertise', 'infrastructure', 'team'],
        key_phrases: ['excellent service', 'technical expertise', 'modernize infrastructure', 'professional team'],
        analysis_metadata: {
          language: 'en',
          model_version: '1.0',
          processing_time_ms: 180
        }
      },
      {
        review_id: insertedReviews[4].id,
        overall_sentiment: 'positive',
        sentiment_score: 0.80,
        confidence_score: 0.88,
        key_topics: ['solutions', 'support', 'team', 'delivery'],
        key_phrases: ['technical solutions', 'responsive support', 'knowledgeable team', 'delivered on time'],
        analysis_metadata: {
          language: 'en',
          model_version: '1.0',
          processing_time_ms: 160
        }
      }
    ]

    const { error: sentimentError } = await supabase
      .from('sentiment_analysis')
      .insert(sentimentAnalysis)

    if (sentimentError) throw sentimentError

    // Create sample review tags
    console.log('Creating sample review tags...')
    
    const reviewTags = [
      { review_id: insertedReviews[0].id, tag_name: 'friendly staff', tag_category: 'staff', confidence_score: 0.95 },
      { review_id: insertedReviews[0].id, tag_name: 'quality coffee', tag_category: 'product', confidence_score: 0.92 },
      { review_id: insertedReviews[0].id, tag_name: 'good atmosphere', tag_category: 'ambiance', confidence_score: 0.88 },
      { review_id: insertedReviews[1].id, tag_name: 'crowded space', tag_category: 'ambiance', confidence_score: 0.75 },
      { review_id: insertedReviews[1].id, tag_name: 'good coffee', tag_category: 'product', confidence_score: 0.85 },
      { review_id: insertedReviews[2].id, tag_name: 'slow service', tag_category: 'service', confidence_score: 0.90 },
      { review_id: insertedReviews[2].id, tag_name: 'overwhelmed staff', tag_category: 'staff', confidence_score: 0.82 },
      { review_id: insertedReviews[3].id, tag_name: 'technical expertise', tag_category: 'service', confidence_score: 0.96 },
      { review_id: insertedReviews[3].id, tag_name: 'professional team', tag_category: 'staff', confidence_score: 0.94 },
      { review_id: insertedReviews[4].id, tag_name: 'responsive support', tag_category: 'service', confidence_score: 0.89 },
      { review_id: insertedReviews[4].id, tag_name: 'on-time delivery', tag_category: 'service', confidence_score: 0.87 }
    ]

    const { error: tagsError } = await supabase
      .from('review_tags')
      .insert(reviewTags)

    if (tagsError) throw tagsError

    // Create sample email notifications
    console.log('Creating sample email notifications...')
    
    const notifications = [
      {
        user_id: user1.id,
        business_id: business1.id,
        notification_type: 'new_review',
        subject: 'New Review for Downtown Coffee Shop',
        content: 'You received a new 5-star review from Alice Johnson on Google.',
        is_sent: true,
        sent_at: new Date('2024-01-15T11:00:00Z')
      },
      {
        user_id: user2.id,
        business_id: business2.id,
        notification_type: 'sentiment_alert',
        subject: 'Sentiment Alert for Tech Solutions Inc',
        content: 'A new review with positive sentiment was detected for your business.',
        is_sent: true,
        sent_at: new Date('2024-01-16T12:00:00Z')
      }
    ]

    const { error: notificationsError } = await supabase
      .from('email_notifications')
      .insert(notifications)

    if (notificationsError) throw notificationsError

    // Create sample API keys
    console.log('Creating sample API keys...')
    
    const apiKeys = [
      {
        user_id: user1.id,
        name: 'Production API Key',
        key_hash: 'hashed_api_key_1',
        permissions: ['read', 'write'],
        is_active: true,
        expires_at: new Date('2025-01-01T00:00:00Z')
      },
      {
        user_id: user2.id,
        name: 'Development API Key',
        key_hash: 'hashed_api_key_2',
        permissions: ['read'],
        is_active: true,
        expires_at: new Date('2024-06-01T00:00:00Z')
      }
    ]

    const { error: apiKeysError } = await supabase
      .from('api_keys')
      .insert(apiKeys)

    if (apiKeysError) throw apiKeysError

    console.log('✅ Database seeding completed successfully!')
    console.log(`Created ${reviews.length} reviews with sentiment analysis and tags`)
    console.log(`Created ${notifications.length} email notifications`)
    console.log(`Created ${apiKeys.length} API keys`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase() 