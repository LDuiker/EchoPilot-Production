import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SentimentAnalysisRequest {
  review_id: string
  review_text: string
}

interface SentimentResult {
  overall_sentiment: 'positive' | 'negative' | 'neutral'
  sentiment_score: number
  confidence_score: number
  key_topics: string[]
  key_phrases: string[]
  analysis_metadata: Record<string, any>
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
    const { review_id, review_text }: SentimentAnalysisRequest = await req.json()

    if (!review_id || !review_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: review_id and review_text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update review status to processing
    await supabase
      .from('reviews')
      .update({ processing_status: 'processing' })
      .eq('id', review_id)

    // Analyze sentiment
    const sentimentResult = await analyzeSentiment(review_text)

    // Store sentiment analysis result
    const { data: sentimentAnalysis, error: insertError } = await supabase
      .from('sentiment_analysis')
      .insert({
        review_id,
        overall_sentiment: sentimentResult.overall_sentiment,
        sentiment_score: sentimentResult.sentiment_score,
        confidence_score: sentimentResult.confidence_score,
        key_topics: sentimentResult.key_topics,
        key_phrases: sentimentResult.key_phrases,
        analysis_metadata: sentimentResult.analysis_metadata
      })
      .select()
      .single()

    if (insertError) {
      // Update review status to failed
      await supabase
        .from('reviews')
        .update({ 
          is_processed: false, 
          processing_status: 'failed' 
        })
        .eq('id', review_id)

      throw insertError
    }

    // Generate review tags based on sentiment analysis
    await generateReviewTags(supabase, review_id, sentimentResult)

    // Update review status to completed
    await supabase
      .from('reviews')
      .update({ 
        is_processed: true, 
        processing_status: 'completed' 
      })
      .eq('id', review_id)

    return new Response(
      JSON.stringify({
        message: 'Sentiment analysis completed successfully',
        sentiment_analysis: sentimentAnalysis,
        review_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // This is a mock implementation
  // In production, you would use services like:
  // - OpenAI GPT for sentiment analysis
  // - Google Cloud Natural Language API
  // - AWS Comprehend
  // - Azure Text Analytics

  // Simple keyword-based sentiment analysis for demo purposes
  const positiveWords = [
    'amazing', 'excellent', 'great', 'good', 'wonderful', 'fantastic', 'outstanding',
    'perfect', 'love', 'enjoy', 'delicious', 'friendly', 'helpful', 'professional',
    'quick', 'fast', 'clean', 'beautiful', 'comfortable', 'recommend', 'best'
  ]

  const negativeWords = [
    'terrible', 'awful', 'horrible', 'bad', 'poor', 'disappointing', 'worst',
    'hate', 'disgusting', 'rude', 'slow', 'dirty', 'expensive', 'overpriced',
    'cold', 'burnt', 'wrong', 'broken', 'uncomfortable', 'avoid', 'never'
  ]

  const textLower = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0

  positiveWords.forEach(word => {
    if (textLower.includes(word)) positiveCount++
  })

  negativeWords.forEach(word => {
    if (textLower.includes(word)) negativeCount++
  })

  // Calculate sentiment score (-1 to 1)
  const totalWords = positiveCount + negativeCount
  let sentimentScore = 0
  let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral'

  if (totalWords > 0) {
    sentimentScore = (positiveCount - negativeCount) / totalWords
    if (sentimentScore > 0.2) {
      overallSentiment = 'positive'
    } else if (sentimentScore < -0.2) {
      overallSentiment = 'negative'
    }
  }

  // Extract key topics and phrases
  const keyTopics = extractKeyTopics(text)
  const keyPhrases = extractKeyPhrases(text)

  return {
    overall_sentiment: overallSentiment,
    sentiment_score: Math.max(-1, Math.min(1, sentimentScore)),
    confidence_score: Math.min(0.95, 0.5 + Math.abs(sentimentScore) * 0.3),
    key_topics: keyTopics,
    key_phrases: keyPhrases,
    analysis_metadata: {
      language: 'en',
      model_version: '1.0',
      processing_time_ms: Math.floor(Math.random() * 200) + 100,
      positive_words_found: positiveCount,
      negative_words_found: negativeCount,
      total_words_analyzed: text.split(' ').length
    }
  }
}

function extractKeyTopics(text: string): string[] {
  const topics = new Set<string>()
  const textLower = text.toLowerCase()

  // Define topic keywords
  const topicKeywords = {
    'service': ['service', 'staff', 'employee', 'server', 'waiter', 'waitress', 'cashier'],
    'food': ['food', 'meal', 'dish', 'cuisine', 'cooking', 'chef', 'kitchen'],
    'coffee': ['coffee', 'espresso', 'latte', 'cappuccino', 'brew', 'bean'],
    'atmosphere': ['atmosphere', 'ambiance', 'environment', 'decor', 'music', 'lighting'],
    'price': ['price', 'cost', 'expensive', 'cheap', 'affordable', 'value', 'worth'],
    'location': ['location', 'place', 'area', 'neighborhood', 'parking', 'access'],
    'cleanliness': ['clean', 'dirty', 'hygiene', 'sanitary', 'messy', 'tidy'],
    'speed': ['fast', 'slow', 'quick', 'wait', 'time', 'efficient', 'delayed']
  }

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    keywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        topics.add(topic)
      }
    })
  })

  return Array.from(topics)
}

function extractKeyPhrases(text: string): string[] {
  const phrases: string[] = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  sentences.forEach(sentence => {
    const words = sentence.trim().split(' ')
    if (words.length >= 3 && words.length <= 8) {
      phrases.push(sentence.trim())
    }
  })

  return phrases.slice(0, 5) // Return up to 5 key phrases
}

async function generateReviewTags(
  supabase: any,
  reviewId: string,
  sentimentResult: SentimentResult
): Promise<void> {
  const tags: Array<{
    tag_name: string
    tag_category: string
    confidence_score: number
  }> = []

  // Generate tags based on sentiment and topics
  sentimentResult.key_topics.forEach(topic => {
    let category = 'other'
    let tagName = topic

    // Map topics to categories
    switch (topic) {
      case 'service':
      case 'staff':
        category = 'staff'
        tagName = sentimentResult.overall_sentiment === 'positive' ? 'friendly staff' : 'poor service'
        break
      case 'food':
      case 'coffee':
        category = 'product'
        tagName = sentimentResult.overall_sentiment === 'positive' ? 'quality food' : 'poor food'
        break
      case 'atmosphere':
        category = 'ambiance'
        tagName = sentimentResult.overall_sentiment === 'positive' ? 'good atmosphere' : 'poor atmosphere'
        break
      case 'price':
        category = 'value'
        tagName = sentimentResult.overall_sentiment === 'positive' ? 'good value' : 'overpriced'
        break
      case 'speed':
        category = 'service'
        tagName = sentimentResult.overall_sentiment === 'positive' ? 'fast service' : 'slow service'
        break
    }

    tags.push({
      tag_name: tagName,
      tag_category: category,
      confidence_score: sentimentResult.confidence_score
    })
  })

  // Insert tags
  if (tags.length > 0) {
    const tagsWithReviewId = tags.map(tag => ({
      review_id: reviewId,
      ...tag
    }))

    await supabase
      .from('review_tags')
      .insert(tagsWithReviewId)
  }
} 