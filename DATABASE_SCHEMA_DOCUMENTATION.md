# EchoPilot Database Schema Documentation

## Overview

EchoPilot is a comprehensive review monitoring platform that tracks business reviews across multiple platforms (Google, Yelp, Facebook, TripAdvisor) and provides sentiment analysis, alerting, and reporting capabilities.

## Database Architecture

The schema is designed with the following principles:
- **Multi-tenancy**: Each user can manage multiple businesses
- **Platform agnostic**: Supports multiple review platforms
- **Real-time processing**: Efficient indexing for quick queries
- **Security**: Row-level security (RLS) policies for data isolation
- **Scalability**: Optimized indexes and views for performance

## Table Structure

### 1. Users Table
**Purpose**: User authentication and profile management

**Key Features**:
- UUID primary keys for security
- Role-based access control (user, admin, manager)
- Integration with Supabase Auth
- Activity tracking

**Important Columns**:
- `id`: UUID primary key
- `email`: Unique email address
- `role`: Access level (user/admin/manager)
- `is_active`: Account status
- `last_login_at`: Authentication tracking

### 2. Businesses Table
**Purpose**: Business entities being monitored

**Key Features**:
- Platform-specific identifiers (Google Places, Yelp Business)
- Configurable monitoring settings per platform
- Customizable alert thresholds
- Timezone support for notifications

**Important Columns**:
- `google_place_id`: Google Places API identifier
- `yelp_business_id`: Yelp Business API identifier
- `monitor_*`: Platform-specific monitoring flags
- `rating_threshold`: Alert trigger for low ratings
- `timezone`: Business timezone for notifications

### 3. Reviews Table
**Purpose**: Core review data from all platforms

**Key Features**:
- Full review text storage
- Platform metadata preservation
- Processing status tracking
- Multi-language support

**Important Columns**:
- `review_text`: Complete review content
- `platform`: Source platform (google/yelp/facebook/tripadvisor)
- `platform_review_id`: Original platform identifier
- `status`: Processing state (pending/processed/flagged/error)
- `rating`: 1-5 star rating

### 4. Sentiment Analysis Table
**Purpose**: AI-powered sentiment analysis results

**Key Features**:
- Sentiment scoring (-1.0 to 1.0)
- Aspect-based analysis
- Confidence scoring
- Model version tracking

**Important Columns**:
- `overall_sentiment`: Categorical sentiment (positive/negative/neutral)
- `sentiment_score`: Numerical sentiment (-1.0 to 1.0)
- `positive_aspects`: Array of positive elements
- `negative_aspects`: Array of negative elements
- `confidence_score`: AI model confidence (0.0 to 1.0)

### 5. Email Notifications Table
**Purpose**: Notification delivery tracking

**Key Features**:
- Multiple notification types
- Delivery status tracking
- Error handling
- Historical record keeping

**Important Columns**:
- `notification_type`: Alert category
- `status`: Delivery status (pending/sent/failed/bounced)
- `sent_at`: Delivery timestamp
- `error_message`: Failure details

### 6. User Preferences Table
**Purpose**: User notification and alert preferences

**Key Features**:
- Granular notification controls
- Customizable thresholds
- Quiet hours configuration
- Timezone preferences

**Important Columns**:
- `email_notifications_enabled`: Master toggle
- `rating_alert_threshold`: Custom rating threshold
- `sentiment_threshold`: Custom sentiment threshold
- `quiet_hours_*`: Do-not-disturb settings

### 7. Review Tags Table
**Purpose**: Categorized review classification

**Key Features**:
- Automated tagging system
- Confidence scoring
- Category organization
- Search optimization

**Important Columns**:
- `tag_name`: Classification label
- `tag_category`: Tag grouping
- `confidence_score`: AI confidence (0.0 to 1.0)

### 8. API Keys Table
**Purpose**: External integration authentication

**Key Features**:
- Secure key storage (hashed)
- Permission-based access
- Expiration management
- Usage tracking

**Important Columns**:
- `key_hash`: Securely stored API key
- `permissions`: Access level array
- `expires_at`: Key expiration
- `last_used_at`: Usage tracking

## Relationships

### Primary Relationships
```
Users (1) → (N) Businesses
Businesses (1) → (N) Reviews
Reviews (1) → (1) Sentiment Analysis
Reviews (1) → (N) Review Tags
Users (1) → (1) User Preferences
Users (1) → (N) Email Notifications
Users (1) → (N) API Keys
```

### Foreign Key Constraints
- All foreign keys use CASCADE DELETE for data integrity
- UUID references ensure type safety
- Proper indexing on all foreign key columns

## Performance Optimizations

### Indexes
**Strategic Indexing Strategy**:
- **Primary keys**: All tables use UUID primary keys
- **Foreign keys**: Indexed for join performance
- **Search columns**: Full-text search on review text
- **Filter columns**: Status, platform, rating filters
- **Date columns**: Temporal queries and sorting
- **Composite indexes**: Business + date combinations

**Key Performance Indexes**:
- `idx_reviews_business_id`: Fast business-specific queries
- `idx_reviews_text_trgm`: Full-text search optimization
- `idx_businesses_name_trgm`: Business name search
- `idx_reviews_rating`: Rating-based filtering
- `idx_sentiment_score`: Sentiment analysis queries

### Views
**Business Summary View**:
- Aggregated metrics per business
- Real-time calculations
- Performance dashboard data

**Recent Reviews View**:
- Latest reviews with sentiment
- Optimized for dashboard display
- Pre-joined data for efficiency

## Security Implementation

### Row Level Security (RLS)
**Security Policies**:
- **User isolation**: Users can only access their own data
- **Business ownership**: Reviews tied to user's businesses
- **Admin access**: Administrators can view all data
- **System operations**: Automated processes can insert data

**Policy Examples**:
```sql
-- Users can only view their own businesses
CREATE POLICY "Users can view own businesses" ON businesses
    FOR SELECT USING (user_id = auth.uid());

-- Users can only see reviews for their businesses
CREATE POLICY "Users can view reviews for own businesses" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reviews.business_id 
            AND businesses.user_id = auth.uid()
        )
    );
```

### Data Protection
- **UUID primary keys**: Prevent enumeration attacks
- **Hashed API keys**: Secure credential storage
- **Audit trails**: Created/updated timestamps
- **Soft deletes**: Status flags for data retention

## Data Flow

### Review Processing Pipeline
1. **Collection**: Reviews fetched from platforms
2. **Storage**: Raw data stored in reviews table
3. **Analysis**: Sentiment analysis performed
4. **Tagging**: Automated categorization applied
5. **Notification**: Alerts sent based on preferences
6. **Reporting**: Data available through views

### Notification System
1. **Trigger**: New review or threshold breach
2. **Filtering**: User preferences applied
3. **Generation**: Email content created
4. **Delivery**: Notification sent and tracked
5. **Monitoring**: Status and error tracking

## Usage Patterns

### Common Queries

**Get Business Dashboard Data**:
```sql
SELECT * FROM business_summary 
WHERE user_id = auth.uid();
```

**Get Recent Reviews with Sentiment**:
```sql
SELECT * FROM recent_reviews_with_sentiment 
WHERE business_id = $1 
ORDER BY review_date DESC 
LIMIT 50;
```

**Find Negative Reviews**:
```sql
SELECT r.*, sa.sentiment_score 
FROM reviews r
JOIN sentiment_analysis sa ON r.id = sa.review_id
WHERE r.business_id = $1 
AND sa.sentiment_score < -0.5;
```

**Search Reviews by Text**:
```sql
SELECT * FROM reviews 
WHERE business_id = $1 
AND review_text ILIKE '%search_term%';
```

### API Integration Examples

**Add New Business**:
```sql
INSERT INTO businesses (user_id, name, google_place_id, yelp_business_id)
VALUES (auth.uid(), 'Business Name', 'google_place_id', 'yelp_id');
```

**Create API Key**:
```sql
INSERT INTO api_keys (user_id, name, key_hash, permissions)
VALUES (auth.uid(), 'Integration Key', 'hashed_key', ARRAY['read', 'write']);
```

## Maintenance Considerations

### Data Retention
- **Reviews**: Permanent storage for historical analysis
- **Notifications**: Configurable retention (suggest 90 days)
- **API Keys**: Regular rotation recommended
- **User Data**: GDPR compliance considerations

### Performance Monitoring
- **Query performance**: Monitor slow queries
- **Index usage**: Regular index analysis
- **Storage growth**: Monitor table sizes
- **Connection pooling**: Optimize connection usage

### Backup Strategy
- **Daily backups**: Full database backups
- **Point-in-time recovery**: WAL archiving
- **Cross-region replication**: Disaster recovery
- **Test restores**: Regular backup validation

## Migration and Deployment

### Schema Deployment
1. **Extensions**: Enable required PostgreSQL extensions
2. **Tables**: Create tables in dependency order
3. **Indexes**: Build indexes after data load
4. **Policies**: Apply RLS policies
5. **Views**: Create optimized views
6. **Triggers**: Set up automated functions

### Data Migration
- **Bulk imports**: Use COPY commands for large datasets
- **Incremental updates**: Use UPSERT patterns
- **Validation**: Verify data integrity after migration
- **Rollback plan**: Maintain migration scripts

## Best Practices

### Development
- **Use prepared statements**: Prevent SQL injection
- **Implement pagination**: Handle large result sets
- **Cache frequently accessed data**: Reduce database load
- **Monitor query performance**: Use EXPLAIN ANALYZE

### Production
- **Regular maintenance**: VACUUM and ANALYZE
- **Connection pooling**: Optimize connection usage
- **Monitoring**: Set up alerts for performance issues
- **Backup testing**: Regular restore validation

### Security
- **Principle of least privilege**: Minimal required permissions
- **Regular security audits**: Review access patterns
- **Key rotation**: Periodic API key updates
- **Input validation**: Sanitize all user inputs

## Troubleshooting

### Common Issues
1. **Performance**: Check index usage and query plans
2. **Permissions**: Verify RLS policies are correctly applied
3. **Data integrity**: Validate foreign key constraints
4. **Storage**: Monitor table growth and cleanup old data

### Debugging Queries
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reviews';

-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM reviews WHERE business_id = $1;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'reviews';
```

This schema provides a robust foundation for the EchoPilot review monitoring platform with comprehensive security, performance optimization, and scalability considerations. 