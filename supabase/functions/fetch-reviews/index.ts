import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FetchReviewsRequest {
  business_id: string
  platform: 'google' | 'yelp'
  force_refresh?: boolean
}

interface ReviewData {
  platform_review_id: string
  reviewer_name: string
  reviewer_avatar?: string
  rating: number
  review_text: string
  review_date: string
  review_url: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { business_id, platform, force_refresh = false }: FetchReviewsRequest = await req.json()

    if (!business_id || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: business_id and platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single()

    if (businessError || !business) {
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if we should skip fetching (if not forced and recently fetched)
    if (!force_refresh && business.last_review_fetch) {
      const lastFetch = new Date(business.last_review_fetch)
      const now = new Date()
      const hoursSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastFetch < 24) {
        return new Response(
          JSON.stringify({ 
            message: 'Reviews recently fetched, skipping',
            last_fetch: business.last_review_fetch 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch reviews from external platform
    let reviews: ReviewData[] = []
    
    if (platform === 'google') {
      reviews = await fetchGoogleReviews(business.google_place_id)
    } else if (platform === 'yelp') {
      reviews = await fetchYelpReviews(business.yelp_business_id)
    }

    // Process and store reviews
    const processedReviews = await processAndStoreReviews(supabase, business_id, platform, reviews)

    // Update business last_fetch timestamp
    await supabase
      .from('businesses')
      .update({ last_review_fetch: new Date().toISOString() })
      .eq('id', business_id)

    return new Response(
      JSON.stringify({
        message: 'Reviews fetched successfully',
        reviews_processed: processedReviews.length,
        platform,
        business_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function fetchGoogleReviews(placeId: string): Promise<ReviewData[]> {
  // This is a mock implementation
  // In production, you would use the Google Places API
  const mockReviews: ReviewData[] = [
    {
      platform_review_id: `google_${Date.now()}_1`,
      reviewer_name: 'John Doe',
      reviewer_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      review_text: 'Great service and amazing food! Highly recommend this place.',
      review_date: new Date().toISOString(),
      review_url: `https://maps.google.com/place/${placeId}/review/1`
    },
    {
      platform_review_id: `google_${Date.now()}_2`,
      reviewer_name: 'Jane Smith',
      reviewer_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4,
      review_text: 'Good experience overall. The staff was friendly and the food was delicious.',
      review_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      review_url: `https://maps.google.com/place/${placeId}/review/2`
    }
  ]

  return mockReviews
}

async function fetchYelpReviews(businessId: string): Promise<ReviewData[]> {
  // This is a mock implementation
  // In production, you would use the Yelp Fusion API
  const mockReviews: ReviewData[] = [
    {
      platform_review_id: `yelp_${Date.now()}_1`,
      reviewer_name: 'Mike Johnson',
      reviewer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      review_text: 'Excellent service and great atmosphere. Will definitely come back!',
      review_date: new Date().toISOString(),
      review_url: `https://www.yelp.com/biz/${businessId}/review/1`
    },
    {
      platform_review_id: `yelp_${Date.now()}_2`,
      reviewer_name: 'Lisa Brown',
      reviewer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 3,
      review_text: 'The food was okay, but the service was a bit slow. Average experience.',
      review_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      review_url: `https://www.yelp.com/biz/${businessId}/review/2`
    }
  ]

  return mockReviews
}

async function processAndStoreReviews(
  supabase: any,
  businessId: string,
  platform: string,
  reviews: ReviewData[]
): Promise<any[]> {
  const processedReviews = []

  for (const review of reviews) {
    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('business_id', businessId)
      .eq('platform', platform)
      .eq('platform_review_id', review.platform_review_id)
      .single()

    if (existingReview) {
      continue // Skip if review already exists
    }

    // Insert new review
    const { data: newReview, error: insertError } = await supabase
      .from('reviews')
      .insert({
        business_id: businessId,
        platform,
        platform_review_id: review.platform_review_id,
        reviewer_name: review.reviewer_name,
        reviewer_avatar: review.reviewer_avatar,
        rating: review.rating,
        review_text: review.review_text,
        review_date: review.review_date,
        review_url: review.review_url,
        is_processed: false,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting review:', insertError)
      continue
    }

    processedReviews.push(newReview)

    // Trigger sentiment analysis (this would typically be done by another function)
    // For now, we'll just mark it as processed
    await supabase
      .from('reviews')
      .update({ 
        is_processed: true, 
        processing_status: 'completed' 
      })
      .eq('id', newReview.id)
  }

  return processedReviews
} 