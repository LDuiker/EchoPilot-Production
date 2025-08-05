#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.test' })

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green')
}

function logError(message) {
  log(`✗ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue')
}

class TestDataCleanup {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    this.cleanedItems = {
      users: 0,
      businesses: 0,
      reviews: 0,
      apiKeys: 0,
      sentimentAnalysis: 0,
      notifications: 0
    }
  }

  async cleanupTestData() {
    log('\n🧹 Starting Test Data Cleanup...', 'blue')
    
    try {
      // Clean up in reverse dependency order
      await this.cleanupNotifications()
      await this.cleanupSentimentAnalysis()
      await this.cleanupReviews()
      await this.cleanupApiKeys()
      await this.cleanupBusinesses()
      await this.cleanupUsers()
      
      this.printSummary()
      logSuccess('Test data cleanup completed successfully!')
      
    } catch (error) {
      logError(`Cleanup failed: ${error.message}`)
      throw error
    }
  }

  async cleanupNotifications() {
    logInfo('Cleaning up test notifications...')
    
    try {
      const { data, error } = await this.supabase
        .from('email_notifications')
        .delete()
        .like('user_email', '%@echopilot.test')

      if (error) {
        logWarning(`Failed to cleanup notifications: ${error.message}`)
      } else {
        this.cleanedItems.notifications = data?.length || 0
        logSuccess(`Cleaned up ${this.cleanedItems.notifications} test notifications`)
      }
    } catch (error) {
      logWarning(`Error cleaning notifications: ${error.message}`)
    }
  }

  async cleanupSentimentAnalysis() {
    logInfo('Cleaning up test sentiment analysis...')
    
    try {
      const { data, error } = await this.supabase
        .from('sentiment_analysis')
        .delete()
        .like('review_id', '%test%')

      if (error) {
        logWarning(`Failed to cleanup sentiment analysis: ${error.message}`)
      } else {
        this.cleanedItems.sentimentAnalysis = data?.length || 0
        logSuccess(`Cleaned up ${this.cleanedItems.sentimentAnalysis} test sentiment analysis records`)
      }
    } catch (error) {
      logWarning(`Error cleaning sentiment analysis: ${error.message}`)
    }
  }

  async cleanupReviews() {
    logInfo('Cleaning up test reviews...')
    
    try {
      const { data, error } = await this.supabase
        .from('reviews')
        .delete()
        .or('id.like.%test%,id.like.%perf%,id.like.%error%,id.like.%bulk%,id.like.%concurrent%')

      if (error) {
        logWarning(`Failed to cleanup reviews: ${error.message}`)
      } else {
        this.cleanedItems.reviews = data?.length || 0
        logSuccess(`Cleaned up ${this.cleanedItems.reviews} test reviews`)
      }
    } catch (error) {
      logWarning(`Error cleaning reviews: ${error.message}`)
    }
  }

  async cleanupApiKeys() {
    logInfo('Cleaning up test API keys...')
    
    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .delete()
        .or('name.like.%test%,name.like.%Test%')

      if (error) {
        logWarning(`Failed to cleanup API keys: ${error.message}`)
      } else {
        this.cleanedItems.apiKeys = data?.length || 0
        logSuccess(`Cleaned up ${this.cleanedItems.apiKeys} test API keys`)
      }
    } catch (error) {
      logWarning(`Error cleaning API keys: ${error.message}`)
    }
  }

  async cleanupBusinesses() {
    logInfo('Cleaning up test businesses...')
    
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .delete()
        .or('id.like.%test%,id.like.%perf%,id.like.%error%,name.like.%Test%')

      if (error) {
        logWarning(`Failed to cleanup businesses: ${error.message}`)
      } else {
        this.cleanedItems.businesses = data?.length || 0
        logSuccess(`Cleaned up ${this.cleanedItems.businesses} test businesses`)
      }
    } catch (error) {
      logWarning(`Error cleaning businesses: ${error.message}`)
    }
  }

  async cleanupUsers() {
    logInfo('Cleaning up test users...')
    
    try {
      // Get test users
      const { data: users, error: fetchError } = await this.supabase
        .from('auth.users')
        .select('id, email')
        .like('email', '%@echopilot.test')

      if (fetchError) {
        logWarning(`Failed to fetch test users: ${fetchError.message}`)
        return
      }

      if (users && users.length > 0) {
        // Delete test users using admin API
        for (const user of users) {
          try {
            const { error: deleteError } = await this.supabase.auth.admin.deleteUser(user.id)
            if (deleteError) {
              logWarning(`Failed to delete user ${user.email}: ${deleteError.message}`)
            } else {
              this.cleanedItems.users++
            }
          } catch (error) {
            logWarning(`Error deleting user ${user.email}: ${error.message}`)
          }
        }
        
        logSuccess(`Cleaned up ${this.cleanedItems.users} test users`)
      } else {
        logInfo('No test users found to clean up')
      }
    } catch (error) {
      logWarning(`Error cleaning users: ${error.message}`)
    }
  }

  async cleanupUserPreferences() {
    logInfo('Cleaning up test user preferences...')
    
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .delete()
        .like('user_id', '%test%')

      if (error) {
        logWarning(`Failed to cleanup user preferences: ${error.message}`)
      } else {
        logSuccess(`Cleaned up ${data?.length || 0} test user preferences`)
      }
    } catch (error) {
      logWarning(`Error cleaning user preferences: ${error.message}`)
    }
  }

  async cleanupReviewTags() {
    logInfo('Cleaning up test review tags...')
    
    try {
      const { data, error } = await this.supabase
        .from('review_tags')
        .delete()
        .like('review_id', '%test%')

      if (error) {
        logWarning(`Failed to cleanup review tags: ${error.message}`)
      } else {
        logSuccess(`Cleaned up ${data?.length || 0} test review tags`)
      }
    } catch (error) {
      logWarning(`Error cleaning review tags: ${error.message}`)
    }
  }

  printSummary() {
    log('\n📊 Cleanup Summary:', 'blue')
    log('─'.repeat(40), 'blue')
    
    const total = Object.values(this.cleanedItems).reduce((sum, count) => sum + count, 0)
    
    Object.entries(this.cleanedItems).forEach(([item, count]) => {
      if (count > 0) {
        log(`${item}: ${count}`, 'green')
      }
    })
    
    log('─'.repeat(40), 'blue')
    log(`Total items cleaned: ${total}`, 'green')
  }

  async verifyCleanup() {
    log('\n🔍 Verifying cleanup...', 'blue')
    
    const checks = [
      { table: 'reviews', pattern: '%test%' },
      { table: 'businesses', pattern: '%test%' },
      { table: 'api_keys', pattern: '%test%' },
      { table: 'email_notifications', pattern: '%@echopilot.test' }
    ]

    for (const check of checks) {
      try {
        const { data, error } = await this.supabase
          .from(check.table)
          .select('count')
          .like('id', check.pattern)
          .limit(1)

        if (error) {
          logWarning(`Failed to verify ${check.table}: ${error.message}`)
        } else {
          const count = data?.[0]?.count || 0
          if (count === 0) {
            logSuccess(`${check.table}: Clean`)
          } else {
            logWarning(`${check.table}: ${count} items remaining`)
          }
        }
      } catch (error) {
        logWarning(`Error verifying ${check.table}: ${error.message}`)
      }
    }
  }
}

// CLI argument parsing
function parseArguments() {
  const args = process.argv.slice(2)
  const options = {
    verify: false,
    help: false
  }

  for (const arg of args) {
    switch (arg) {
      case '--verify':
      case '-v':
        options.verify = true
        break
      case '--help':
      case '-h':
        options.help = true
        break
    }
  }

  return options
}

function showHelp() {
  log('\n🧹 EchoPilot Test Data Cleanup', 'blue')
  log('\nUsage:', 'green')
  log('  node scripts/cleanup-test-data.js [options]', 'cyan')
  
  log('\nOptions:', 'green')
  log('  -v, --verify    Verify cleanup was successful', 'cyan')
  log('  -h, --help      Show this help message', 'cyan')
  
  log('\nExamples:', 'green')
  log('  node scripts/cleanup-test-data.js', 'cyan')
  log('  node scripts/cleanup-test-data.js --verify', 'cyan')
}

// Main execution
async function main() {
  const options = parseArguments()
  
  if (options.help) {
    showHelp()
    return
  }

  const cleanup = new TestDataCleanup()
  
  try {
    await cleanup.cleanupTestData()
    
    if (options.verify) {
      await cleanup.verifyCleanup()
    }
    
  } catch (error) {
    logError(`Cleanup failed: ${error.message}`)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:')
  logError(`  Promise: ${promise}`)
  logError(`  Reason: ${reason}`)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError('Uncaught Exception:')
  logError(`  ${error.message}`)
  logError(`  ${error.stack}`)
  process.exit(1)
})

// Run the main function
if (require.main === module) {
  main()
}

module.exports = { TestDataCleanup } 