# EchoPilot Database Schema

A comprehensive Supabase database schema for EchoPilot, a review monitoring platform that tracks business reviews across multiple platforms (Google, Yelp, Facebook, TripAdvisor) and provides sentiment analysis, alerting, and reporting capabilities.

## 🚀 Features

- **Multi-platform Review Monitoring**: Support for Google, Yelp, Facebook, and TripAdvisor
- **AI-Powered Sentiment Analysis**: Automated sentiment scoring and aspect extraction
- **Real-time Notifications**: Configurable email alerts and preferences
- **Role-based Access Control**: User, admin, and manager roles
- **Row-level Security**: Complete data isolation between users
- **Performance Optimized**: Strategic indexing and views for fast queries
- **Type Safety**: Full TypeScript support with generated types

## 📁 File Structure

```
EchoPilot-Production/
├── supabase-schema.sql          # Complete database schema
├── database-types.ts            # TypeScript type definitions
├── DATABASE_SCHEMA_DOCUMENTATION.md  # Comprehensive documentation
└── README.md                    # This file
```

## 🗄️ Database Tables

### Core Tables
1. **`users`** - User authentication and profiles
2. **`businesses`** - Business entities with platform identifiers
3. **`reviews`** - Review data from all platforms
4. **`sentiment_analysis`** - AI-powered sentiment analysis results
5. **`email_notifications`** - Notification delivery tracking
6. **`user_preferences`** - User notification and alert preferences
7. **`review_tags`** - Automated review categorization
8. **`api_keys`** - External integration authentication

### Views
- **`business_summary`** - Aggregated business metrics
- **`recent_reviews_with_sentiment`** - Latest reviews with sentiment data

## 🛠️ Setup Instructions

### 1. Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the SQL to create all tables, indexes, policies, and views

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (for notifications)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# AI Service Configuration (for sentiment analysis)
OPENAI_API_KEY=your_openai_api_key
# or
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 3. TypeScript Integration

1. Install the Supabase client:
```bash
npm install @supabase/supabase-js
```

2. Import the database types in your project:
```typescript
import { Database } from './database-types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 4. Row Level Security (RLS)

The schema includes comprehensive RLS policies that ensure:
- Users can only access their own data
- Business owners can only see reviews for their businesses
- Admins have appropriate access levels
- System processes can insert data as needed

**Important**: RLS is enabled by default on all tables. Make sure your application uses authenticated requests.

## 🔐 Security Features

### Authentication
- UUID primary keys prevent enumeration attacks
- Hashed API keys for secure external integrations
- Role-based access control (user/admin/manager)

### Data Protection
- Row-level security policies on all tables
- Audit trails with created/updated timestamps
- Soft deletes using status flags
- Input validation constraints

### API Security
- Permission-based API key system
- Expiring API keys with usage tracking
- Secure key storage (hashed)

## 📊 Performance Optimizations

### Indexes
- **Primary keys**: UUID-based for security
- **Foreign keys**: Optimized for join performance
- **Search indexes**: Full-text search on review content
- **Filter indexes**: Platform, rating, status filters
- **Date indexes**: Temporal queries and sorting

### Views
- **Business Summary**: Pre-calculated metrics
- **Recent Reviews**: Optimized for dashboard display

### Triggers
- **Auto-update timestamps**: Automatic `updated_at` maintenance
- **Default preferences**: Auto-create user preferences on signup

## 🔄 Data Flow

### Review Processing Pipeline
1. **Collection**: Reviews fetched from platform APIs
2. **Storage**: Raw data stored in `reviews` table
3. **Analysis**: Sentiment analysis performed and stored
4. **Tagging**: Automated categorization applied
5. **Notification**: Alerts sent based on user preferences
6. **Reporting**: Data available through optimized views

### Notification System
1. **Trigger**: New review or threshold breach detected
2. **Filtering**: User preferences and quiet hours applied
3. **Generation**: Email content created
4. **Delivery**: Notification sent and status tracked
5. **Monitoring**: Error handling and retry logic

## 📈 Usage Examples

### Get User's Businesses
```typescript
const { data: businesses } = await supabase
  .from('businesses')
  .select('*')
  .eq('user_id', user.id)
```

### Get Reviews with Sentiment
```typescript
const { data: reviews } = await supabase
  .from('reviews')
  .select(`
    *,
    sentiment_analysis (*)
  `)
  .eq('business_id', businessId)
  .order('review_date', { ascending: false })
```

### Business Dashboard Data
```typescript
const { data: summary } = await supabase
  .from('business_summary')
  .select('*')
  .eq('user_id', user.id)
```

### Search Reviews
```typescript
const { data: reviews } = await supabase
  .from('reviews')
  .select('*')
  .textSearch('review_text', searchTerm)
  .eq('business_id', businessId)
```

## 🔧 Maintenance

### Regular Tasks
- **Database backups**: Daily automated backups
- **Index maintenance**: Regular VACUUM and ANALYZE
- **Performance monitoring**: Query performance analysis
- **Security audits**: Review access patterns and policies

### Data Retention
- **Reviews**: Permanent storage for historical analysis
- **Notifications**: Configurable retention (recommended: 90 days)
- **API Keys**: Regular rotation recommended
- **User Data**: GDPR compliance considerations

## 🚨 Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   ```sql
   -- Check if user is authenticated
   SELECT auth.uid();
   
   -- Verify RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'reviews';
   ```

2. **Performance Issues**
   ```sql
   -- Analyze query performance
   EXPLAIN (ANALYZE, BUFFERS) 
   SELECT * FROM reviews WHERE business_id = $1;
   
   -- Check index usage
   SELECT * FROM pg_stat_user_indexes WHERE tablename = 'reviews';
   ```

3. **Data Integrity**
   ```sql
   -- Check foreign key constraints
   SELECT * FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY';
   ```

### Debugging Queries
```sql
-- Enable query logging
SET log_statement = 'all';
SET log_min_duration_statement = 1000;

-- Check active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `DATABASE_SCHEMA_DOCUMENTATION.md`
- Review the troubleshooting section above

---

**EchoPilot Database Schema** - Built for scalable review monitoring with enterprise-grade security and performance. 