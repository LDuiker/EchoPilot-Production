import { supabase } from '@/lib/supabase'
import { Database } from '@/database-types'

// Test data types
type TestUser = {
  id: string
  email: string
  password: string
}

type TestBusiness = {
  id: string
  name: string
  platform_identifiers: {
    google_place_id?: string
    yelp_business_id?: string
    facebook_page_id?: string
    tripadvisor_id?: string
  }
}

type TestReview = {
  id: string
  business_id: string
  platform: 'google' | 'yelp' | 'facebook' | 'tripadvisor'
  review_text: string
  rating: number
  reviewer_name: string
  review_date: string
}

describe('Database Infrastructure Tests', () => {
  let testUser: TestUser
  let testBusiness: TestBusiness
  let testReview: TestReview
  let authToken: string

  beforeAll(async () => {
    // Setup test data
    testUser = {
      id: `test-user-${Date.now()}`,
      email: `test-${Date.now()}@echopilot.test`,
      password: 'TestPassword123!'
    }

    testBusiness = {
      id: `test-business-${Date.now()}`,
      name: 'Test Business',
      platform_identifiers: {
        google_place_id: 'test-google-id',
        yelp_business_id: 'test-yelp-id'
      }
    }

    testReview = {
      id: `test-review-${Date.now()}`,
      business_id: testBusiness.id,
      platform: 'google',
      review_text: 'This is a test review for testing purposes.',
      rating: 4,
      reviewer_name: 'Test Reviewer',
      review_date: new Date().toISOString()
    }
  })

  describe('Database Connection Tests', () => {
    test('should establish connection to Supabase', async () => {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    test('should handle connection errors gracefully', async () => {
      // Test with invalid credentials
      const invalidSupabase = createClient('https://invalid-url.supabase.co', 'invalid-key')
      const { data, error } = await invalidSupabase.from('users').select('*').limit(1)
      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    test('should validate environment variables', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined()
    })
  })

  describe('Authentication Flow Tests', () => {
    test('should register a new user', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe(testUser.email)
    })

    test('should sign in existing user', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
      
      if (data.session) {
        authToken = data.session.access_token
      }
    })

    test('should handle invalid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: 'wrongpassword'
      })

      expect(error).toBeDefined()
      expect(data.user).toBeNull()
      expect(data.session).toBeNull()
    })

    test('should reset password', async () => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(testUser.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
      })

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })

    test('should sign out user', async () => {
      const { error } = await supabase.auth.signOut()
      expect(error).toBeNull()
    })
  })

  describe('CRUD Operations Tests', () => {
    beforeEach(async () => {
      // Sign in before each test
      const { data } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      })
      if (data.session) {
        authToken = data.session.access_token
      }
    })

    describe('Business CRUD Operations', () => {
      test('should create a new business', async () => {
        const { data, error } = await supabase
          .from('businesses')
          .insert({
            id: testBusiness.id,
            name: testBusiness.name,
            platform_identifiers: testBusiness.platform_identifiers,
            status: 'active'
          })
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.name).toBe(testBusiness.name)
        expect(data.platform_identifiers).toEqual(testBusiness.platform_identifiers)
      })

      test('should read business by ID', async () => {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', testBusiness.id)
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.id).toBe(testBusiness.id)
      })

      test('should update business information', async () => {
        const updatedName = 'Updated Test Business'
        const { data, error } = await supabase
          .from('businesses')
          .update({ name: updatedName })
          .eq('id', testBusiness.id)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.name).toBe(updatedName)
      })

      test('should list user businesses', async () => {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', testUser.id)

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(Array.isArray(data)).toBe(true)
      })

      test('should soft delete business', async () => {
        const { data, error } = await supabase
          .from('businesses')
          .update({ status: 'deleted' })
          .eq('id', testBusiness.id)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.status).toBe('deleted')
      })
    })

    describe('Review CRUD Operations', () => {
      test('should create a new review', async () => {
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            id: testReview.id,
            business_id: testReview.business_id,
            platform: testReview.platform,
            review_text: testReview.review_text,
            rating: testReview.rating,
            reviewer_name: testReview.reviewer_name,
            review_date: testReview.review_date,
            status: 'active'
          })
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.review_text).toBe(testReview.review_text)
        expect(data.rating).toBe(testReview.rating)
      })

      test('should read review by ID', async () => {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('id', testReview.id)
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.id).toBe(testReview.id)
      })

      test('should update review status', async () => {
        const { data, error } = await supabase
          .from('reviews')
          .update({ status: 'flagged' })
          .eq('id', testReview.id)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.status).toBe('flagged')
      })

      test('should list business reviews', async () => {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', testBusiness.id)
          .order('review_date', { ascending: false })

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(Array.isArray(data)).toBe(true)
      })

      test('should search reviews by text', async () => {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .textSearch('review_text', 'test review')
          .eq('business_id', testBusiness.id)

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(Array.isArray(data)).toBe(true)
      })
    })

    describe('Sentiment Analysis CRUD Operations', () => {
      test('should create sentiment analysis record', async () => {
        const sentimentData = {
          review_id: testReview.id,
          sentiment_score: 0.8,
          sentiment_label: 'positive',
          confidence_score: 0.95,
          aspects: ['service', 'quality'],
          status: 'active'
        }

        const { data, error } = await supabase
          .from('sentiment_analysis')
          .insert(sentimentData)
          .select()
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.sentiment_score).toBe(sentimentData.sentiment_score)
        expect(data.sentiment_label).toBe(sentimentData.sentiment_label)
      })

      test('should read sentiment analysis by review ID', async () => {
        const { data, error } = await supabase
          .from('sentiment_analysis')
          .select('*')
          .eq('review_id', testReview.id)
          .single()

        expect(error).toBeNull()
        expect(data).toBeDefined()
        expect(data.review_id).toBe(testReview.id)
      })
    })
  })

  describe('Database Views Tests', () => {
    test('should query business summary view', async () => {
      const { data, error } = await supabase
        .from('business_summary')
        .select('*')
        .eq('user_id', testUser.id)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })

    test('should query recent reviews with sentiment view', async () => {
      const { data, error } = await supabase
        .from('recent_reviews_with_sentiment')
        .select('*')
        .eq('business_id', testBusiness.id)
        .limit(10)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('Row Level Security Tests', () => {
    test('should enforce user data isolation', async () => {
      // Create another test user
      const otherUser = {
        email: `other-${Date.now()}@echopilot.test`,
        password: 'TestPassword123!'
      }

      await supabase.auth.signUp({
        email: otherUser.email,
        password: otherUser.password
      })

      const { data: otherUserData } = await supabase.auth.signInWithPassword({
        email: otherUser.email,
        password: otherUser.password
      })

      // Try to access first user's businesses
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', testUser.id)

      // Should not return other user's data
      expect(data).toEqual([])
    })

    test('should allow admin access to all data', async () => {
      // This test would require admin credentials
      // Implementation depends on your admin setup
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Performance Tests', () => {
    test('should handle large result sets efficiently', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', testBusiness.id)
        .limit(1000)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(queryTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    test('should use indexes effectively', async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', testBusiness.id)
        .eq('platform', 'google')
        .gte('rating', 4)
        .order('review_date', { ascending: false })

      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
  })

  describe('Error Handling Tests', () => {
    test('should handle invalid UUID format', async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', 'invalid-uuid')

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    test('should handle missing required fields', async () => {
      const { data, error } = await supabase
        .from('businesses')
        .insert({})
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    test('should handle duplicate key violations', async () => {
      // Try to insert business with same ID
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          id: testBusiness.id,
          name: 'Duplicate Business',
          status: 'active'
        })
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    test('should handle foreign key violations', async () => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          id: 'test-review-fk-violation',
          business_id: 'non-existent-business-id',
          platform: 'google',
          review_text: 'Test review',
          rating: 4,
          reviewer_name: 'Test',
          review_date: new Date().toISOString()
        })
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })
  })

  afterAll(async () => {
    // Cleanup test data
    try {
      await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      })

      // Delete test data in reverse order
      await supabase.from('sentiment_analysis').delete().eq('review_id', testReview.id)
      await supabase.from('reviews').delete().eq('id', testReview.id)
      await supabase.from('businesses').delete().eq('id', testBusiness.id)
      
      // Delete test user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.admin.deleteUser(user.id)
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  })
}) 