# EchoPilot Project Setup Testing Guide

This guide provides step-by-step instructions to verify that your EchoPilot project is properly set up and configured.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Git installed and configured
- Supabase CLI installed (`npm install -g supabase`)
- A code editor (VS Code recommended)
- Access to your Supabase project dashboard

## 1. Supabase Project & Database Schema Testing

### 1.1 Verify Supabase Project Creation

```bash
# Check if you can connect to your Supabase project
supabase status

# If not linked, link your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Manual Verification:**
- [ ] Log into [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Verify your project exists and is active
- [ ] Check project settings and API keys are accessible

### 1.2 Test Database Schema

```bash
# Run database connection tests
npm run test:database

# Check specific database operations
npm run test:infrastructure --suite database
```

**Manual Verification:**
- [ ] Open Supabase Dashboard → Table Editor
- [ ] Verify all tables exist:
  - `users`
  - `businesses`
  - `reviews`
  - `sentiment_analysis`
  - `email_notifications`
  - `user_preferences`
  - `review_tags`
  - `api_keys`
- [ ] Verify views exist:
  - `business_summary`
  - `recent_reviews_with_sentiment`
- [ ] Check RLS policies are enabled
- [ ] Verify indexes are created

### 1.3 Test Database Operations

```bash
# Test CRUD operations
npm run test:infrastructure --suite database --mode integration

# Verify test data cleanup
npm run test:cleanup-verify
```

**Expected Results:**
- All database connection tests pass
- CRUD operations work for all tables
- RLS policies function correctly
- Views return expected data

## 2. Authentication System Testing

### 2.1 Test Authentication Configuration

```bash
# Run authentication tests
npm run test:infrastructure --suite authentication

# Test user registration and login
npm run test:infrastructure --mode integration
```

**Manual Verification:**
- [ ] Open Supabase Dashboard → Authentication
- [ ] Verify email provider is enabled
- [ ] Check password policy settings
- [ ] Verify email templates are configured
- [ ] Test user registration flow in your app

### 2.2 Test Authentication Flows

**User Registration:**
1. Navigate to your app's registration page
2. Create a new user account
3. Verify confirmation email is sent
4. Confirm email and verify user is created in Supabase

**User Login:**
1. Navigate to login page
2. Enter valid credentials
3. Verify successful login and session creation
4. Check user data is accessible

**Password Reset:**
1. Navigate to password reset page
2. Enter email address
3. Verify reset email is sent
4. Follow reset link and set new password
5. Verify login works with new password

### 2.3 Test Session Management

```bash
# Test session handling
npm run test:infrastructure --suite authentication --mode integration
```

**Manual Verification:**
- [ ] Test session persistence across browser refresh
- [ ] Verify logout clears session
- [ ] Test session timeout handling
- [ ] Check protected routes require authentication

## 3. Git Repository & Security Testing

### 3.1 Verify Repository Structure

```bash
# Check repository status
git status

# Verify all files are tracked
git ls-files

# Check for sensitive files
git check-ignore .env*
```

**Manual Verification:**
- [ ] Verify `.gitignore` excludes sensitive files:
  - `.env*`
  - `node_modules/`
  - `.next/`
  - `*.log`
- [ ] Check repository structure matches project requirements
- [ ] Verify no sensitive data is committed

### 3.2 Test Security Configuration

```bash
# Check for security vulnerabilities
npm audit

# Run security linting
npm run lint
```

**Manual Verification:**
- [ ] Verify environment variables are not hardcoded
- [ ] Check API keys are properly secured
- [ ] Verify HTTPS is enforced in production
- [ ] Test input validation on forms
- [ ] Check for XSS vulnerabilities

### 3.3 Test Branch Protection

**Manual Verification:**
- [ ] Verify main branch is protected
- [ ] Check pull request requirements are set
- [ ] Test code review workflow
- [ ] Verify automated tests run on PRs

## 4. Development Environment Testing

### 4.1 Verify Dependencies

```bash
# Install dependencies
npm install

# Check for missing dependencies
npm run type-check

# Verify all scripts work
npm run dev
```

**Manual Verification:**
- [ ] All dependencies install without errors
- [ ] TypeScript compilation passes
- [ ] Development server starts successfully
- [ ] Hot reload works correctly

### 4.2 Test Development Tools

```bash
# Test linting
npm run lint

# Test type checking
npm run type-check

# Test build process
npm run build
```

**Manual Verification:**
- [ ] ESLint runs without errors
- [ ] TypeScript types are correct
- [ ] Build completes successfully
- [ ] No console errors in development

### 4.3 Test Local Development

```bash
# Start development server
npm run dev

# In another terminal, run tests
npm run test:watch
```

**Manual Verification:**
- [ ] App loads at `http://localhost:3000`
- [ ] All pages render correctly
- [ ] Navigation works properly
- [ ] Forms submit successfully
- [ ] Real-time features work

## 5. Deployment Pipeline Testing

### 5.1 Test Build Process

```bash
# Test production build
npm run build

# Verify build output
ls -la .next/
```

**Manual Verification:**
- [ ] Build completes without errors
- [ ] Static assets are generated
- [ ] Bundle size is reasonable
- [ ] No build warnings

### 5.2 Test Deployment Configuration

**For Vercel:**
- [ ] Verify `vercel.json` configuration
- [ ] Check environment variables are set
- [ ] Test deployment from Git branch
- [ ] Verify custom domain works

**For Netlify:**
- [ ] Verify `netlify.toml` configuration
- [ ] Check build settings
- [ ] Test deployment from Git branch
- [ ] Verify custom domain works

### 5.3 Test Production Environment

```bash
# Test production build locally
npm run build
npm run start
```

**Manual Verification:**
- [ ] Production build runs without errors
- [ ] Environment variables load correctly
- [ ] Database connections work
- [ ] External APIs are accessible
- [ ] Performance is acceptable

## 6. Infrastructure Testing

### 6.1 Run Complete Test Suite

```bash
# Run all infrastructure tests
npm run test:all

# Run specific test suites
npm run test:database
npm run test:api-keys
npm run test:environment
npm run test:performance
npm run test:error-handling
```

**Expected Results:**
- All tests pass
- No critical errors
- Performance benchmarks are met
- Error handling works correctly

### 6.2 Test API Key Management

```bash
# Test API key functionality
npm run test:api-keys

# Test external service connectivity
npm run test:infrastructure --suite apiKeys --mode integration
```

**Manual Verification:**
- [ ] API keys can be created and managed
- [ ] External services (Google Places, Yelp, OpenAI) are accessible
- [ ] Rate limiting is working
- [ ] API key permissions are enforced

### 6.3 Test Performance

```bash
# Run performance tests
npm run test:performance

# Test with larger datasets
npm run test:infrastructure --suite performance --mode integration
```

**Manual Verification:**
- [ ] Database queries are optimized
- [ ] Response times are acceptable
- [ ] Memory usage is reasonable
- [ ] Concurrent operations work

### 6.4 Test Error Handling

```bash
# Test error scenarios
npm run test:error-handling

# Test edge cases
npm run test:infrastructure --suite errorHandling --mode integration
```

**Manual Verification:**
- [ ] Graceful error handling
- [ ] User-friendly error messages
- [ ] Logging works correctly
- [ ] Recovery mechanisms function

## 7. Documentation Verification

### 7.1 Check Documentation Completeness

**Manual Verification:**
- [ ] `README.md` is comprehensive and up-to-date
- [ ] `TESTING_DOCUMENTATION.md` covers all testing scenarios
- [ ] `PROJECT_README.md` provides project overview
- [ ] API documentation is available
- [ ] Setup instructions are clear

### 7.2 Test Documentation Accuracy

```bash
# Follow setup instructions from scratch
# Verify all steps work as documented
```

**Manual Verification:**
- [ ] Setup instructions work end-to-end
- [ ] Configuration examples are correct
- [ ] Troubleshooting guides are helpful
- [ ] Code examples run successfully

## 8. Final Integration Testing

### 8.1 End-to-End Testing

```bash
# Run Playwright tests
npm run test:e2e

# Run integration tests
npm run test:integration
```

**Manual Verification:**
- [ ] Complete user workflows work
- [ ] All features function correctly
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

### 8.2 Load Testing

```bash
# Test with multiple users
npm run test:performance -- --load-test
```

**Manual Verification:**
- [ ] System handles concurrent users
- [ ] Database performance under load
- [ ] API rate limiting works
- [ ] Error recovery under stress

## 9. Security & Compliance Testing

### 9.1 Security Audit

```bash
# Run security checks
npm audit
npm run lint -- --security
```

**Manual Verification:**
- [ ] No critical security vulnerabilities
- [ ] Authentication is secure
- [ ] Data is properly encrypted
- [ ] API endpoints are protected

### 9.2 Compliance Verification

**Manual Verification:**
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policies
- [ ] Privacy policy is implemented
- [ ] Terms of service are clear

## 10. Monitoring & Logging Testing

### 10.1 Test Monitoring Setup

**Manual Verification:**
- [ ] Error tracking is configured
- [ ] Performance monitoring works
- [ ] Logs are being collected
- [ ] Alerts are set up

### 10.2 Test Logging

```bash
# Generate test logs
npm run test:all

# Check log output
tail -f logs/app.log
```

**Manual Verification:**
- [ ] Logs contain relevant information
- [ ] Log levels are appropriate
- [ ] Sensitive data is not logged
- [ ] Log rotation works

## Testing Checklist Summary

### ✅ Database & Schema
- [ ] Supabase project created and accessible
- [ ] All tables and views exist
- [ ] RLS policies configured
- [ ] CRUD operations work
- [ ] Database tests pass

### ✅ Authentication
- [ ] User registration works
- [ ] Login/logout functions
- [ ] Password reset works
- [ ] Session management works
- [ ] Authentication tests pass

### ✅ Git Repository
- [ ] Repository structure is correct
- [ ] Security configuration is proper
- [ ] No sensitive data committed
- [ ] Branch protection enabled

### ✅ Development Environment
- [ ] All dependencies installed
- [ ] Development server works
- [ ] Hot reload functions
- [ ] Build process works
- [ ] Type checking passes

### ✅ Deployment Pipeline
- [ ] Build completes successfully
- [ ] Deployment configuration correct
- [ ] Environment variables set
- [ ] Production deployment works

### ✅ Infrastructure Testing
- [ ] All test suites pass
- [ ] API keys work correctly
- [ ] External services accessible
- [ ] Performance benchmarks met
- [ ] Error handling works

### ✅ Documentation
- [ ] All documentation complete
- [ ] Instructions are accurate
- [ ] Examples work correctly
- [ ] Troubleshooting guides helpful

## Troubleshooting Common Issues

### Database Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
npm run test:database
```

### Authentication Issues
```bash
# Check Supabase configuration
supabase status

# Test authentication
npm run test:infrastructure --suite authentication
```

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Test Failures
```bash
# Run tests with verbose output
npm run test:all -- --verbose

# Check specific test suite
npm run test:infrastructure --suite database --verbose
```

## Next Steps

After completing all tests:

1. **Deploy to Production**: Use your verified deployment pipeline
2. **Monitor Performance**: Set up monitoring and alerting
3. **User Acceptance Testing**: Have stakeholders test the application
4. **Documentation Updates**: Update docs based on testing findings
5. **Training**: Train team members on the new system

## Support

If you encounter issues during testing:

1. Check the troubleshooting section above
2. Review the `TESTING_DOCUMENTATION.md`
3. Check the manual testing checklist
4. Review logs for error details
5. Consult the project README for setup guidance

---

**Note**: This testing guide should be run in order, as later tests may depend on earlier ones being successful. Keep detailed notes of any issues encountered and their resolutions for future reference. 