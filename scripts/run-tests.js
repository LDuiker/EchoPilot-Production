#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_CONFIG = {
  // Test suites to run
  suites: {
    database: 'infrastructure/database.test.ts',
    apiKeys: 'infrastructure/api-keys.test.ts',
    environment: 'infrastructure/environment.test.ts',
    performance: 'infrastructure/performance.test.ts',
    errorHandling: 'infrastructure/error-handling.test.ts'
  },
  
  // Test modes
  modes: {
    unit: '--testPathPattern=__tests__/infrastructure',
    integration: '--testPathPattern=__tests__/infrastructure --runInBand',
    e2e: '--testPathPattern=__tests__/e2e',
    all: '--testPathPattern=__tests__'
  },
  
  // Coverage options
  coverage: {
    enabled: true,
    threshold: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  }
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan')
  log(`  ${message}`, 'bright')
  log('='.repeat(60), 'cyan')
}

function logSection(message) {
  log('\n' + '-'.repeat(40), 'yellow')
  log(`  ${message}`, 'yellow')
  log('-'.repeat(40), 'yellow')
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

// Test runner class
class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    }
    this.startTime = null
    this.endTime = null
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        ...options
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve(code)
        } else {
          reject(new Error(`Command failed with exit code ${code}`))
        }
      })

      child.on('error', (error) => {
        reject(error)
      })
    })
  }

  async checkEnvironment() {
    logSection('Checking Test Environment')
    
    // Check if Jest is installed
    try {
      await this.runCommand('npx', ['jest', '--version'])
      logSuccess('Jest is available')
    } catch (error) {
      logError('Jest is not installed. Run: npm install')
      process.exit(1)
    }

    // Check if environment file exists
    const envFiles = ['.env.test', '.env.local', '.env']
    const envFile = envFiles.find(file => fs.existsSync(file))
    
    if (envFile) {
      logSuccess(`Environment file found: ${envFile}`)
    } else {
      logWarning('No environment file found. Tests may fail.')
    }

    // Check if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logSuccess('Supabase configuration found')
    } else {
      logWarning('Supabase configuration not found. Some tests may fail.')
    }

    // Check if external API keys are configured
    const apiKeys = [
      'GOOGLE_PLACES_API_KEY',
      'YELP_API_KEY',
      'OPENAI_API_KEY'
    ]

    const configuredKeys = apiKeys.filter(key => process.env[key])
    logInfo(`${configuredKeys.length}/${apiKeys.length} external API keys configured`)
  }

  async runTests(suite = 'all', mode = 'unit') {
    logHeader(`Running ${suite} Tests (${mode} mode)`)
    
    this.startTime = Date.now()
    
    const args = [
      'jest',
      '--verbose',
      '--detectOpenHandles',
      '--forceExit'
    ]

    // Add mode-specific arguments
    if (TEST_CONFIG.modes[mode]) {
      args.push(...TEST_CONFIG.modes[mode].split(' '))
    }

    // Add suite-specific pattern
    if (suite !== 'all' && TEST_CONFIG.suites[suite]) {
      args.push('--testPathPattern', TEST_CONFIG.suites[suite])
    }

    // Add coverage if enabled
    if (TEST_CONFIG.coverage.enabled) {
      args.push(
        '--coverage',
        '--coverageDirectory=coverage',
        '--coverageReporters=text,lcov,html',
        '--collectCoverageFrom=lib/**/*.{js,ts}',
        '--collectCoverageFrom=components/**/*.{js,ts}',
        '--collectCoverageFrom=hooks/**/*.{js,ts}'
      )
    }

    try {
      await this.runCommand('npx', args)
      logSuccess('All tests passed!')
    } catch (error) {
      logError('Some tests failed')
      throw error
    } finally {
      this.endTime = Date.now()
    }
  }

  async runPerformanceTests() {
    logSection('Running Performance Tests')
    
    const args = [
      'jest',
      '--testPathPattern=performance.test.ts',
      '--verbose',
      '--detectOpenHandles',
      '--forceExit'
    ]

    try {
      await this.runCommand('npx', args)
      logSuccess('Performance tests completed')
    } catch (error) {
      logError('Performance tests failed')
      throw error
    }
  }

  async runSecurityTests() {
    logSection('Running Security Tests')
    
    const args = [
      'jest',
      '--testPathPattern=security.test.ts',
      '--verbose',
      '--detectOpenHandles',
      '--forceExit'
    ]

    try {
      await this.runCommand('npx', args)
      logSuccess('Security tests completed')
    } catch (error) {
      logError('Security tests failed')
      throw error
    }
  }

  async generateReport() {
    logSection('Generating Test Report')
    
    const duration = this.endTime - this.startTime
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)

    logInfo(`Test execution time: ${minutes}m ${seconds}s`)
    
    // Generate coverage report if available
    if (TEST_CONFIG.coverage.enabled && fs.existsSync('coverage/lcov-report/index.html')) {
      logSuccess('Coverage report generated: coverage/lcov-report/index.html')
    }

    // Generate summary report
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      configuration: {
        coverage: TEST_CONFIG.coverage.enabled,
        threshold: TEST_CONFIG.coverage.threshold
      }
    }

    const reportPath = 'test-report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    logSuccess(`Test report saved: ${reportPath}`)
  }

  async cleanup() {
    logSection('Cleaning Up Test Environment')
    
    // Clean up test data
    try {
      await this.runCommand('node', ['scripts/cleanup-test-data.js'])
      logSuccess('Test data cleaned up')
    } catch (error) {
      logWarning('Failed to cleanup test data')
    }
  }
}

// CLI argument parsing
function parseArguments() {
  const args = process.argv.slice(2)
  const options = {
    suite: 'all',
    mode: 'unit',
    coverage: true,
    cleanup: true,
    help: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--suite':
      case '-s':
        options.suite = args[++i] || 'all'
        break
      case '--mode':
      case '-m':
        options.mode = args[++i] || 'unit'
        break
      case '--no-coverage':
        options.coverage = false
        break
      case '--no-cleanup':
        options.cleanup = false
        break
      case '--help':
      case '-h':
        options.help = true
        break
      case '--performance':
        options.suite = 'performance'
        break
      case '--security':
        options.suite = 'security'
        break
      case '--integration':
        options.mode = 'integration'
        break
      case '--e2e':
        options.mode = 'e2e'
        break
    }
  }

  return options
}

function showHelp() {
  logHeader('EchoPilot Test Runner')
  
  log('\nUsage:', 'bright')
  log('  node scripts/run-tests.js [options]', 'cyan')
  
  log('\nOptions:', 'bright')
  log('  -s, --suite <suite>     Test suite to run (database, apiKeys, environment, performance, errorHandling, all)', 'cyan')
  log('  -m, --mode <mode>       Test mode (unit, integration, e2e, all)', 'cyan')
  log('  --performance           Run performance tests only', 'cyan')
  log('  --security              Run security tests only', 'cyan')
  log('  --integration           Run tests in integration mode', 'cyan')
  log('  --e2e                   Run end-to-end tests', 'cyan')
  log('  --no-coverage           Disable coverage reporting', 'cyan')
  log('  --no-cleanup            Skip cleanup after tests', 'cyan')
  log('  -h, --help              Show this help message', 'cyan')
  
  log('\nExamples:', 'bright')
  log('  node scripts/run-tests.js', 'cyan')
  log('  node scripts/run-tests.js --suite database --mode integration', 'cyan')
  log('  node scripts/run-tests.js --performance', 'cyan')
  log('  node scripts/run-tests.js --security --no-cleanup', 'cyan')
  
  log('\nAvailable Suites:', 'bright')
  Object.keys(TEST_CONFIG.suites).forEach(suite => {
    log(`  ${suite}: ${TEST_CONFIG.suites[suite]}`, 'cyan')
  })
  
  log('\nAvailable Modes:', 'bright')
  Object.keys(TEST_CONFIG.modes).forEach(mode => {
    log(`  ${mode}: ${TEST_CONFIG.modes[mode]}`, 'cyan')
  })
}

// Main execution
async function main() {
  const options = parseArguments()
  
  if (options.help) {
    showHelp()
    return
  }

  const runner = new TestRunner()
  
  try {
    // Check environment
    await runner.checkEnvironment()
    
    // Run tests based on options
    if (options.suite === 'performance') {
      await runner.runPerformanceTests()
    } else if (options.suite === 'security') {
      await runner.runSecurityTests()
    } else {
      await runner.runTests(options.suite, options.mode)
    }
    
    // Generate report
    await runner.generateReport()
    
    // Cleanup
    if (options.cleanup) {
      await runner.cleanup()
    }
    
    logHeader('Test Execution Completed Successfully')
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`)
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

module.exports = { TestRunner, TEST_CONFIG } 