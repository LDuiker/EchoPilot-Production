import { supabase } from '@/lib/supabase'

describe('Performance Tests', () => {
  let testUser: any
  let testBusinesses: any[]
  let testReviews: any[]

  beforeAll(async () => {
    // Create test user
    testUser = {
      email: `perf-test-${Date.now()}@echopilot.test`,
      password: 'TestPassword123!'
    }

    await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
    })

    const { data } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    })

    if (data.user) {
      testUser.id = data.user.id
    }

    // Create test data for performance testing
    testBusinesses = []
    testReviews = []

    // Create multiple test businesses
    for (let i = 0; i < 5; i++) {
      const business = {
        id: `perf-business-${Date.now()}-${i}`,
        name: `Performance Test Business ${i}`,
        platform_identifiers: {
          google_place_id: `test-google-${i}`,
          yelp_business_id: `test-yelp-${i}`
        },
        status: 'active'
      }

      const { data: businessData } = await supabase
        .from('businesses')
        .insert(business)
        .select()
        .single()

      if (businessData) {
        testBusinesses.push(businessData)
      }
    }

    // Create test reviews for each business
    for (const business of testBusinesses) {
      for (let i = 0; i < 20; i++) {
        const review = {
          id: `perf-review-${Date.now()}-${business.id}-${i}`,
          business_id: business.id,
          platform: i % 2 === 0 ? 'google' : 'yelp',
          review_text: `Performance test review ${i} for business ${business.name}. This is a longer review text to test performance with realistic data.`,
          rating: Math.floor(Math.random() * 5) + 1,
          reviewer_name: `Reviewer ${i}`,
          review_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }

        const { data: reviewData } = await supabase
          .from('reviews')
          .insert(review)
          .select()
          .single()

        if (reviewData) {
          testReviews.push(reviewData)
        }
      }
    }
  })

  describe('Database Query Performance Tests', () => {
    test('should perform fast business listing queries', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('status', 'active')

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(1000) // Should complete within 1 second
      expect(data.length).toBeGreaterThan(0)
    })

    test('should perform fast review listing with pagination', async () => {
      const pageSize = 50
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', testBusinesses[0].id)
        .order('review_date', { ascending: false })
        .limit(pageSize)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(500) // Should complete within 500ms
      expect(data.length).toBeLessThanOrEqual(pageSize)
    })

    test('should perform fast text search queries', async () => {
      const searchTerm = 'performance test'
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .textSearch('review_text', searchTerm)
        .limit(20)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(1000) // Should complete within 1 second
    })

    test('should perform fast filtered queries', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', testBusinesses[0].id)
        .eq('platform', 'google')
        .gte('rating', 4)
        .order('review_date', { ascending: false })
        .limit(10)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(500) // Should complete within 500ms
    })

    test('should perform fast aggregation queries', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('rating, count')
        .eq('business_id', testBusinesses[0].id)
        .group('rating')

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(500) // Should complete within 500ms
    })
  })

  describe('Database View Performance Tests', () => {
    test('should perform fast business summary view queries', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('business_summary')
        .select('*')
        .eq('user_id', testUser.id)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(1000) // Should complete within 1 second
    })

    test('should perform fast recent reviews view queries', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('recent_reviews_with_sentiment')
        .select('*')
        .eq('business_id', testBusinesses[0].id)
        .limit(10)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })

  describe('Concurrent Query Performance Tests', () => {
    test('should handle concurrent business queries', async () => {
      const concurrentQueries = 10
      const startTime = Date.now()

      const promises = Array.from({ length: concurrentQueries }, async () => {
        return supabase
          .from('businesses')
          .select('*')
          .eq('user_id', testUser.id)
          .eq('status', 'active')
      })

      const results = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data).toBeDefined()
      })

      expect(totalTime).toBeLessThan(3000) // Should complete within 3 seconds
    })

    test('should handle concurrent review queries', async () => {
      const concurrentQueries = 20
      const startTime = Date.now()

      const promises = Array.from({ length: concurrentQueries }, async (_, index) => {
        const businessId = testBusinesses[index % testBusinesses.length].id
        return supabase
          .from('reviews')
          .select('*')
          .eq('business_id', businessId)
          .limit(10)
      })

      const results = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      results.forEach(result => {
        expect(result.error).toBeNull()
        expect(result.data).toBeDefined()
      })

      expect(totalTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })

  describe('Large Dataset Performance Tests', () => {
    test('should handle large result sets efficiently', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', testBusinesses[0].id)
        .limit(1000)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(2000) // Should complete within 2 seconds
    })

    test('should handle complex joins efficiently', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          businesses!inner(*),
          sentiment_analysis(*)
        `)
        .eq('businesses.user_id', testUser.id)
        .limit(50)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(queryTime).toBeLessThan(2000) // Should complete within 2 seconds
    })
  })

  describe('Index Performance Tests', () => {
    test('should use indexes for business queries', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(queryTime).toBeLessThan(500) // Should be fast with proper indexing
    })

    test('should use indexes for review queries', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', testBusinesses[0].id)
        .eq('platform', 'google')
        .gte('rating', 4)
        .order('review_date', { ascending: false })

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(queryTime).toBeLessThan(500) // Should be fast with proper indexing
    })
  })

  describe('Memory Usage Tests', () => {
    test('should not cause memory leaks with large queries', async () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Perform multiple large queries
      for (let i = 0; i < 10; i++) {
        await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', testBusinesses[0].id)
          .limit(100)
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })

  describe('Connection Pool Performance Tests', () => {
    test('should handle connection pool efficiently', async () => {
      const concurrentConnections = 50
      const startTime = Date.now()

      const promises = Array.from({ length: concurrentConnections }, async () => {
        return supabase
          .from('businesses')
          .select('count')
          .limit(1)
      })

      const results = await Promise.all(promises)
      const endTime = Date.now()
      const totalTime = endTime - startTime

      results.forEach(result => {
        expect(result.error).toBeNull()
      })

      expect(totalTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })

  describe('Write Performance Tests', () => {
    test('should perform fast bulk inserts', async () => {
      const bulkReviews = Array.from({ length: 100 }, (_, i) => ({
        id: `bulk-review-${Date.now()}-${i}`,
        business_id: testBusinesses[0].id,
        platform: 'google',
        review_text: `Bulk test review ${i}`,
        rating: Math.floor(Math.random() * 5) + 1,
        reviewer_name: `Bulk Reviewer ${i}`,
        review_date: new Date().toISOString(),
        status: 'active'
      }))

      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .insert(bulkReviews)
        .select()

      const endTime = Date.now()
      const insertTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(100)
      expect(insertTime).toBeLessThan(3000) // Should complete within 3 seconds
    })

    test('should perform fast bulk updates', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .update({ status: 'updated' })
        .eq('business_id', testBusinesses[0].id)
        .eq('status', 'active')
        .select()

      const endTime = Date.now()
      const updateTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(updateTime).toBeLessThan(2000) // Should complete within 2 seconds
    })
  })

  describe('Query Optimization Tests', () => {
    test('should optimize queries with proper field selection', async () => {
      const startTime = Date.now()
      
      // Select only needed fields
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, review_date, platform')
        .eq('business_id', testBusinesses[0].id)
        .limit(50)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(queryTime).toBeLessThan(300) // Should be faster with selective fields
    })

    test('should optimize queries with proper ordering', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', testBusinesses[0].id)
        .order('review_date', { ascending: false })
        .limit(20)

      const endTime = Date.now()
      const queryTime = endTime - startTime

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(queryTime).toBeLessThan(300) // Should be fast with proper ordering
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
      for (const business of testBusinesses) {
        await supabase.from('reviews').delete().eq('business_id', business.id)
      }
      await supabase.from('businesses').delete().in('id', testBusinesses.map(b => b.id))

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