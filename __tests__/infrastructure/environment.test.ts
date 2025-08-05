import { config } from 'dotenv'
import path from 'path'

// Load environment variables for testing
config({ path: path.resolve(process.cwd(), '.env.test') })

describe('Environment Variable and Security Tests', () => {
  describe('Environment Variable Loading Tests', () => {
    test('should load all required environment variables', () => {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_APP_URL'
      ]

      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined()
        expect(process.env[varName]).not.toBe('')
      })
    })

    test('should load optional environment variables with defaults', () => {
      const optionalVars = [
        'NEXT_PUBLIC_ENABLE_ANALYTICS',
        'NEXT_PUBLIC_ENABLE_SENTIMENT_ANALYSIS',
        'NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS'
      ]

      optionalVars.forEach(varName => {
        const value = process.env[varName]
        if (value !== undefined) {
          expect(['true', 'false', '1', '0']).toContain(value.toLowerCase())
        }
      })
    })

    test('should validate Supabase URL format', () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      expect(supabaseUrl).toBeDefined()
      expect(supabaseUrl).toMatch(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/)
    })

    test('should validate Supabase API key format', () => {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      expect(anonKey).toBeDefined()
      expect(serviceKey).toBeDefined()
      
      // Supabase keys are typically base64 encoded and have specific lengths
      expect(anonKey).toMatch(/^[A-Za-z0-9+/=]+$/)
      expect(serviceKey).toMatch(/^[A-Za-z0-9+/=]+$/)
      expect(anonKey.length).toBeGreaterThan(100)
      expect(serviceKey.length).toBeGreaterThan(100)
    })

    test('should validate app URL format', () => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL
      expect(appUrl).toBeDefined()
      expect(appUrl).toMatch(/^https?:\/\/.+/)
    })
  })

  describe('External API Configuration Tests', () => {
    test('should validate Google Places API key format', () => {
      const googleKey = process.env.GOOGLE_PLACES_API_KEY
      if (googleKey) {
        // Google API keys start with AIza and are 39 characters long
        expect(googleKey).toMatch(/^AIza[A-Za-z0-9_-]{35}$/)
      }
    })

    test('should validate Yelp API key format', () => {
      const yelpKey = process.env.YELP_API_KEY
      if (yelpKey) {
        // Yelp API keys are typically 128 characters
        expect(yelpKey).toHaveLength(128)
        expect(yelpKey).toMatch(/^[A-Za-z0-9]+$/)
      }
    })

    test('should validate OpenAI API key format', () => {
      const openaiKey = process.env.OPENAI_API_KEY
      if (openaiKey) {
        // OpenAI API keys start with sk- and are 51 characters long
        expect(openaiKey).toMatch(/^sk-[A-Za-z0-9]{48}$/)
      }
    })

    test('should validate Google Cloud API key format', () => {
      const googleCloudKey = process.env.GOOGLE_CLOUD_API_KEY
      if (googleCloudKey) {
        // Google Cloud API keys are similar to Places API keys
        expect(googleCloudKey).toMatch(/^AIza[A-Za-z0-9_-]{35}$/)
      }
    })
  })

  describe('Email Configuration Tests', () => {
    test('should validate SMTP configuration', () => {
      const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.FROM_EMAIL
      }

      // All SMTP config should be present if email is enabled
      const hasSmtpConfig = Object.values(smtpConfig).every(value => value !== undefined)
      
      if (hasSmtpConfig) {
        expect(smtpConfig.host).toBeDefined()
        expect(smtpConfig.port).toBeDefined()
        expect(smtpConfig.user).toBeDefined()
        expect(smtpConfig.pass).toBeDefined()
        expect(smtpConfig.from).toBeDefined()

        // Validate port is a number
        expect(parseInt(smtpConfig.port!)).toBeGreaterThan(0)
        expect(parseInt(smtpConfig.port!)).toBeLessThan(65536)

        // Validate email format
        expect(smtpConfig.from).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      }
    })

    test('should validate from email domain', () => {
      const fromEmail = process.env.FROM_EMAIL
      if (fromEmail) {
        const domain = fromEmail.split('@')[1]
        expect(domain).toBeDefined()
        expect(domain).toMatch(/^[^\s@]+\.[^\s@]+$/)
      }
    })
  })

  describe('Security Configuration Tests', () => {
    test('should not expose sensitive keys in public environment variables', () => {
      const publicVars = Object.keys(process.env).filter(key => 
        key.startsWith('NEXT_PUBLIC_')
      )

      const sensitiveKeys = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'SMTP_PASS',
        'OPENAI_API_KEY',
        'GOOGLE_PLACES_API_KEY',
        'YELP_API_KEY'
      ]

      sensitiveKeys.forEach(sensitiveKey => {
        const publicVar = publicVars.find(key => key.includes(sensitiveKey))
        expect(publicVar).toBeUndefined()
      })
    })

    test('should validate feature flags are boolean', () => {
      const featureFlags = [
        'NEXT_PUBLIC_ENABLE_ANALYTICS',
        'NEXT_PUBLIC_ENABLE_SENTIMENT_ANALYSIS',
        'NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS'
      ]

      featureFlags.forEach(flag => {
        const value = process.env[flag]
        if (value !== undefined) {
          expect(['true', 'false', '1', '0']).toContain(value.toLowerCase())
        }
      })
    })

    test('should validate analytics configuration', () => {
      const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
      const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

      if (analyticsId) {
        // GA4 measurement IDs start with G-
        expect(analyticsId).toMatch(/^G-[A-Z0-9]{10}$/)
      }

      if (mixpanelToken) {
        // Mixpanel tokens are typically 32 characters
        expect(mixpanelToken).toHaveLength(32)
        expect(mixpanelToken).toMatch(/^[A-Za-z0-9]+$/)
      }
    })
  })

  describe('Configuration Validation Tests', () => {
    test('should validate environment consistency', () => {
      const isProduction = process.env.NODE_ENV === 'production'
      const appUrl = process.env.NEXT_PUBLIC_APP_URL

      if (isProduction) {
        expect(appUrl).toMatch(/^https:\/\//)
        expect(appUrl).not.toMatch(/localhost/)
        expect(appUrl).not.toMatch(/127\.0\.0\.1/)
      }
    })

    test('should validate required services are configured', () => {
      const hasSupabaseConfig = !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      expect(hasSupabaseConfig).toBe(true)
    })

    test('should validate external API configuration', () => {
      const hasGooglePlaces = !!process.env.GOOGLE_PLACES_API_KEY
      const hasYelp = !!process.env.YELP_API_KEY
      const hasOpenAI = !!process.env.OPENAI_API_KEY

      // At least one sentiment analysis service should be configured
      const hasSentimentService = hasOpenAI || !!process.env.GOOGLE_CLOUD_API_KEY
      
      // At least one review platform API should be configured
      const hasReviewPlatform = hasGooglePlaces || hasYelp

      expect(hasSentimentService).toBe(true)
      expect(hasReviewPlatform).toBe(true)
    })
  })

  describe('Environment Variable Security Tests', () => {
    test('should not contain hardcoded secrets', () => {
      const envContent = Object.entries(process.env)
        .filter(([key]) => key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD'))
        .map(([key, value]) => ({ key, value }))

      envContent.forEach(({ key, value }) => {
        if (value) {
          // Check for common hardcoded patterns
          expect(value).not.toBe('your_api_key_here')
          expect(value).not.toBe('your_secret_here')
          expect(value).not.toBe('password')
          expect(value).not.toBe('123456')
          expect(value).not.toBe('test')
        }
      })
    })

    test('should validate URL security', () => {
      const urls = [
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_APP_URL
      ].filter(Boolean)

      urls.forEach(url => {
        if (url) {
          // Should use HTTPS in production
          if (process.env.NODE_ENV === 'production') {
            expect(url).toMatch(/^https:\/\//)
          }
          
          // Should not contain credentials in URL
          expect(url).not.toMatch(/\/\/[^:]+:[^@]+@/)
        }
      })
    })

    test('should validate API key entropy', () => {
      const apiKeys = [
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        process.env.GOOGLE_PLACES_API_KEY,
        process.env.YELP_API_KEY,
        process.env.OPENAI_API_KEY
      ].filter(Boolean)

      apiKeys.forEach(key => {
        if (key) {
          // API keys should have sufficient length
          expect(key.length).toBeGreaterThan(20)
          
          // Should not be all the same character
          const uniqueChars = new Set(key).size
          expect(uniqueChars).toBeGreaterThan(10)
        }
      })
    })
  })

  describe('Configuration Loading Tests', () => {
    test('should load configuration from correct files', () => {
      const envFiles = [
        '.env.local',
        '.env.development',
        '.env.production',
        '.env.test'
      ]

      // Check that at least one environment file exists
      const fs = require('fs')
      const path = require('path')
      
      const hasEnvFile = envFiles.some(file => 
        fs.existsSync(path.join(process.cwd(), file))
      )

      expect(hasEnvFile).toBe(true)
    })

    test('should handle missing optional environment variables', () => {
      const optionalVars = [
        'GOOGLE_PLACES_API_KEY',
        'YELP_API_KEY',
        'OPENAI_API_KEY',
        'SMTP_HOST'
      ]

      // Should not throw errors for missing optional vars
      optionalVars.forEach(varName => {
        expect(() => {
          const value = process.env[varName]
          return value
        }).not.toThrow()
      })
    })

    test('should validate environment variable types', () => {
      // Boolean flags
      const booleanVars = [
        'NEXT_PUBLIC_ENABLE_ANALYTICS',
        'NEXT_PUBLIC_ENABLE_SENTIMENT_ANALYSIS',
        'NEXT_PUBLIC_ENABLE_REAL_TIME_NOTIFICATIONS'
      ]

      booleanVars.forEach(varName => {
        const value = process.env[varName]
        if (value !== undefined) {
          expect(['true', 'false', '1', '0']).toContain(value.toLowerCase())
        }
      })

      // Numeric values
      const numericVars = ['SMTP_PORT']
      numericVars.forEach(varName => {
        const value = process.env[varName]
        if (value !== undefined) {
          expect(parseInt(value)).not.toBeNaN()
        }
      })
    })
  })

  describe('Runtime Configuration Tests', () => {
    test('should validate runtime environment detection', () => {
      const nodeEnv = process.env.NODE_ENV
      expect(['development', 'production', 'test']).toContain(nodeEnv)
    })

    test('should validate build-time configuration', () => {
      const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
      
      if (isBuildTime) {
        // During build, all public variables should be available
        const publicVars = Object.keys(process.env).filter(key => 
          key.startsWith('NEXT_PUBLIC_')
        )
        
        expect(publicVars.length).toBeGreaterThan(0)
      }
    })

    test('should handle configuration overrides', () => {
      // Test that environment variables can be overridden
      const originalValue = process.env.NEXT_PUBLIC_APP_URL
      
      process.env.NEXT_PUBLIC_APP_URL = 'https://test-override.com'
      expect(process.env.NEXT_PUBLIC_APP_URL).toBe('https://test-override.com')
      
      // Restore original value
      if (originalValue) {
        process.env.NEXT_PUBLIC_APP_URL = originalValue
      }
    })
  })

  describe('Error Handling Tests', () => {
    test('should handle malformed environment variables', () => {
      const malformedVars = [
        'INVALID_URL=http://',
        'INVALID_PORT=abc',
        'INVALID_BOOL=maybe'
      ]

      malformedVars.forEach(varString => {
        const [key, value] = varString.split('=')
        process.env[key] = value

        // Should not crash the application
        expect(() => {
          const config = {
            url: process.env[key],
            port: parseInt(process.env[key] || '0'),
            flag: process.env[key] === 'true'
          }
          return config
        }).not.toThrow()
      })
    })

    test('should handle missing required configuration gracefully', () => {
      const requiredConfig = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }

      if (!requiredConfig.supabaseUrl || !requiredConfig.supabaseKey) {
        // Should provide meaningful error message
        expect(() => {
          if (!requiredConfig.supabaseUrl) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
          }
          if (!requiredConfig.supabaseKey) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
          }
        }).toThrow()
      }
    })
  })
}) 