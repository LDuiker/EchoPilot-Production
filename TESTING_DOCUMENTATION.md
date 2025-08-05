# EchoPilot Testing Documentation

## Overview

This document provides comprehensive documentation for EchoPilot's testing infrastructure, including automated tests, manual testing procedures, and best practices for maintaining test quality.

## Table of Contents

1. [Test Architecture](#test-architecture)
2. [Setup and Installation](#setup-and-installation)
3. [Test Suites](#test-suites)
4. [Running Tests](#running-tests)
5. [Test Configuration](#test-configuration)
6. [Manual Testing](#manual-testing)
7. [Continuous Integration](#continuous-integration)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Test Architecture

### Test Structure

```
EchoPilot-Production/
├── __tests__/
│   ├── infrastructure/
│   │   ├── database.test.ts          # Database connection and CRUD tests
│   │   ├── api-keys.test.ts          # API key validation and external services
│   │   ├── environment.test.ts       # Environment variable and security tests
│   │   ├── performance.test.ts       # Performance and load testing
│   │   └── error-handling.test.ts    # Error handling and edge cases
│   ├── e2e/                          # End-to-end tests
│   └── unit/                         # Unit tests for components
├── scripts/
│   ├── run-tests.js                  # Test runner script
│   └── cleanup-test-data.js          # Test data cleanup
├── jest.config.js                    # Jest configuration
├── jest.setup.js                     # Jest setup and mocks
└── TESTING_DOCUMENTATION.md          # This file
```

### Test Categories

1. **Infrastructure Tests**: Core system functionality
2. **Unit Tests**: Individual component testing
3. **Integration Tests**: Component interaction testing
4. **End-to-End Tests**: Full user workflow testing
5. **Performance Tests**: Load and stress testing
6. **Security Tests**: Security validation and penetration testing

## Setup and Installation

### Prerequisites

- Node.js 18+ and npm 8+
- Supabase project with proper configuration
- External API keys (Google Places, Yelp, OpenAI)
- SMTP configuration for email testing

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd EchoPilot-Production
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp env.example .env.test
   # Edit .env.test with your test configuration
   ```

4. **Set up Supabase**:
   ```bash
   # Apply database schema
   npm run db:migrate
   
   # Start local Supabase (optional)
   npm run supabase:start
   ```

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External API Keys
GOOGLE_PLACES_API_KEY=your_google_places_api_key
YELP_API_KEY=your_yelp_api_key
OPENAI_API_KEY=your_openai_api_key

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@echopilot.test

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Test Suites

### 1. Database Tests (`database.test.ts`)

Tests database connection, CRUD operations, and data integrity.

**Coverage**:
- Database connection establishment
- User authentication flows
- Business CRUD operations
- Review CRUD operations
- Sentiment analysis CRUD operations
- Database views and queries
- Row-level security
- Performance benchmarks
- Error handling

**Key Features**:
- Automatic test data creation and cleanup
- Authentication flow testing
- Concurrent operation testing
- Performance benchmarking
- Security validation

### 2. API Key Tests (`api-keys.test.ts`)

Tests API key management and external service connectivity.

**Coverage**:
- API key creation and validation
- Permission-based access control
- External service connectivity (Google Places, Yelp, OpenAI)
- SMTP configuration validation
- Error handling and recovery
- Security validation

**Key Features**:
- Mock external API services
- Rate limiting simulation
- Error recovery testing
- Security validation

### 3. Environment Tests (`environment.test.ts`)

Tests environment variable loading and security configuration.

**Coverage**:
- Environment variable validation
- Configuration security checks
- External API key validation
- SMTP configuration validation
- Feature flag testing
- Error handling

**Key Features**:
- Comprehensive environment validation
- Security configuration checks
- Configuration consistency validation

### 4. Performance Tests (`performance.test.ts`)

Tests system performance under various load conditions.

**Coverage**:
- Database query performance
- Concurrent operation handling
- Large dataset processing
- Memory usage monitoring
- Connection pool efficiency
- Write operation performance

**Key Features**:
- Automated performance benchmarking
- Load testing with realistic data
- Memory leak detection
- Performance regression detection

### 5. Error Handling Tests (`error-handling.test.ts`)

Tests error handling and edge cases.

**Coverage**:
- Database error handling
- Authentication error handling
- API key error handling
- External service error handling
- Network error handling
- Data validation error handling
- Edge case testing

**Key Features**:
- Comprehensive error scenario testing
- Recovery mechanism validation
- Edge case identification
- Resilience testing

## Running Tests

### Basic Test Commands

```bash
# Run all infrastructure tests
npm run test:infrastructure

# Run specific test suite
npm run test:database
npm run test:api-keys
npm run test:environment
npm run test:performance
npm run test:error-handling

# Run tests in integration mode
npm run test:integration

# Run all tests with coverage
npm run test:all
```

### Advanced Test Runner

```bash
# Run with custom options
node scripts/run-tests.js --suite database --mode integration
node scripts/run-tests.js --performance
node scripts/run-tests.js --security --no-cleanup

# Show help
node scripts/run-tests.js --help
```

### Test Data Management

```bash
# Clean up test data
npm run test:cleanup

# Clean up and verify
npm run test:cleanup-verify

# Manual cleanup
node scripts/cleanup-test-data.js --verify
```

### Jest Commands

```bash
# Run Jest directly
npx jest --testPathPattern=infrastructure/database.test.ts
npx jest --testPathPattern=infrastructure --coverage
npx jest --watch --testPathPattern=infrastructure
```

## Test Configuration

### Jest Configuration

The Jest configuration is defined in `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testMatch: [
    '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
}
```

### Test Setup

The test setup is configured in `jest.setup.js`:

- Next.js router mocking
- Supabase client mocking
- Global test utilities
- Browser API mocking

### Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80,
  },
}
```

## Manual Testing

### Manual Testing Checklist

Refer to `__tests__/infrastructure/manual-testing-checklist.md` for a comprehensive manual testing checklist.

### Key Manual Test Areas

1. **User Interface Testing**
   - User registration and login flows
   - Business management interface
   - Review monitoring dashboard
   - Settings and preferences

2. **Integration Testing**
   - External API integration
   - Email notification delivery
   - Real-time data updates
   - Cross-browser compatibility

3. **Performance Testing**
   - Load testing with realistic data
   - Stress testing under high load
   - Memory usage monitoring
   - Response time validation

4. **Security Testing**
   - Authentication security
   - Data encryption validation
   - Input validation testing
   - SQL injection prevention

## Continuous Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup environment
      run: |
        cp env.example .env.test
        # Add environment variables via GitHub Secrets
    
    - name: Run infrastructure tests
      run: npm run test:infrastructure
    
    - name: Run unit tests
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

Install husky for pre-commit hooks:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test:infrastructure"
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check Supabase configuration
   npm run supabase:status
   
   # Reset database
   npm run db:reset
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify environment file
   cat .env.test
   
   # Check variable loading
   node -e "require('dotenv').config({path: '.env.test'}); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```

3. **Test Data Cleanup Issues**
   ```bash
   # Manual cleanup
   npm run test:cleanup-verify
   
   # Force cleanup
   node scripts/cleanup-test-data.js --force
   ```

4. **Performance Test Failures**
   ```bash
   # Run with increased timeouts
   node scripts/run-tests.js --suite performance --timeout 30000
   
   # Check system resources
   top
   free -h
   ```

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
DEBUG=* npm run test:infrastructure

# Run with verbose output
node scripts/run-tests.js --verbose
```

### Test Isolation

Ensure test isolation:

```bash
# Run tests in isolation
npm run test:infrastructure -- --runInBand

# Clean up between tests
npm run test:cleanup
```

## Best Practices

### Test Development

1. **Test Structure**
   - Use descriptive test names
   - Group related tests in describe blocks
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Test Data Management**
   - Create unique test data for each test
   - Clean up test data after tests
   - Use factories for test data creation

3. **Mocking**
   - Mock external dependencies
   - Use realistic mock data
   - Test error scenarios with mocks

4. **Assertions**
   - Use specific assertions
   - Test both positive and negative cases
   - Validate error messages and codes

### Performance Testing

1. **Baseline Establishment**
   - Establish performance baselines
   - Monitor performance trends
   - Set realistic performance targets

2. **Load Testing**
   - Test with realistic data volumes
   - Simulate concurrent users
   - Monitor resource usage

3. **Stress Testing**
   - Test system limits
   - Identify breaking points
   - Validate recovery mechanisms

### Security Testing

1. **Input Validation**
   - Test with malicious input
   - Validate boundary conditions
   - Test injection attacks

2. **Authentication Testing**
   - Test authentication flows
   - Validate session management
   - Test authorization controls

3. **Data Protection**
   - Validate data encryption
   - Test data isolation
   - Verify secure transmission

### Maintenance

1. **Regular Updates**
   - Update test dependencies
   - Review and update test data
   - Maintain test documentation

2. **Monitoring**
   - Monitor test execution times
   - Track test failure rates
   - Analyze coverage trends

3. **Documentation**
   - Keep test documentation updated
   - Document test scenarios
   - Maintain troubleshooting guides

## Contributing

### Adding New Tests

1. **Test File Structure**
   ```typescript
   describe('Feature Name', () => {
     let testData: TestDataType
     
     beforeAll(async () => {
       // Setup test data
     })
     
     afterAll(async () => {
       // Cleanup test data
     })
     
     describe('Specific Functionality', () => {
       test('should perform expected behavior', async () => {
         // Test implementation
       })
     })
   })
   ```

2. **Test Data Management**
   ```typescript
   // Create unique test identifiers
   const testId = `test-${Date.now()}-${Math.random()}`
   
   // Use test factories
   const createTestUser = (overrides = {}) => ({
     email: `test-${Date.now()}@echopilot.test`,
     password: 'TestPassword123!',
     ...overrides
   })
   ```

3. **Error Testing**
   ```typescript
   test('should handle errors gracefully', async () => {
     try {
       await operationThatShouldFail()
       fail('Expected operation to fail')
     } catch (error) {
       expect(error.message).toContain('expected error message')
     }
   })
   ```

### Test Review Process

1. **Code Review Checklist**
   - [ ] Tests cover all scenarios
   - [ ] Test data is properly managed
   - [ ] Error cases are tested
   - [ ] Performance implications considered
   - [ ] Documentation is updated

2. **Quality Gates**
   - [ ] All tests pass
   - [ ] Coverage meets thresholds
   - [ ] Performance tests pass
   - [ ] Security tests pass
   - [ ] Manual testing completed

---

## Support

For questions or issues with the testing suite:

1. Check the troubleshooting section
2. Review test documentation
3. Check GitHub issues
4. Contact the development team

**Last Updated**: [Current Date]
**Version**: 1.0.0 