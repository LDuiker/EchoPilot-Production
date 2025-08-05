-- =====================================================
-- EchoPilot Database Schema
-- Review Monitoring Platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. USERS TABLE (Authentication Integration)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. BUSINESSES TABLE (Google/Yelp Integration)
-- =====================================================

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    website TEXT,
    
    -- Platform identifiers
    google_place_id VARCHAR(255) UNIQUE,
    yelp_business_id VARCHAR(255) UNIQUE,
    facebook_page_id VARCHAR(255),
    
    -- Monitoring settings
    is_active BOOLEAN DEFAULT true,
    monitor_google BOOLEAN DEFAULT true,
    monitor_yelp BOOLEAN DEFAULT true,
    monitor_facebook BOOLEAN DEFAULT false,
    
    -- Notification thresholds
    rating_threshold DECIMAL(2,1) DEFAULT 3.0,
    review_count_threshold INTEGER DEFAULT 1,
    
    -- Metadata
    industry VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. REVIEWS TABLE (Core Review Data)
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Review content
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_date DATE NOT NULL,
    
    -- Platform information
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('google', 'yelp', 'facebook', 'tripadvisor')),
    platform_review_id VARCHAR(255) UNIQUE,
    platform_user_name VARCHAR(255),
    platform_user_avatar TEXT,
    
    -- Processing status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'flagged', 'error')),
    is_verified BOOLEAN DEFAULT false,
    
    -- Metadata
    language VARCHAR(10) DEFAULT 'en',
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SENTIMENT ANALYSIS TABLE
-- =====================================================

CREATE TABLE sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    
    -- Sentiment scores
    overall_sentiment VARCHAR(20) NOT NULL CHECK (overall_sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score DECIMAL(3,2) NOT NULL CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    
    -- Detailed analysis
    positive_aspects TEXT[],
    negative_aspects TEXT[],
    key_phrases TEXT[],
    
    -- AI model info
    model_version VARCHAR(50),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    
    -- Processing metadata
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    processing_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. EMAIL NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Notification content
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('new_review', 'low_rating', 'sentiment_alert', 'weekly_summary', 'system')),
    
    -- Delivery status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. USER PREFERENCES TABLE
-- =====================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Email preferences
    email_notifications_enabled BOOLEAN DEFAULT true,
    daily_digest_enabled BOOLEAN DEFAULT false,
    weekly_summary_enabled BOOLEAN DEFAULT true,
    
    -- Alert preferences
    low_rating_alerts BOOLEAN DEFAULT true,
    sentiment_alerts BOOLEAN DEFAULT true,
    new_review_alerts BOOLEAN DEFAULT true,
    
    -- Threshold settings
    rating_alert_threshold DECIMAL(2,1) DEFAULT 3.0,
    sentiment_threshold DECIMAL(3,2) DEFAULT -0.5,
    
    -- Time preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. REVIEW TAGS TABLE (For categorization)
-- =====================================================

CREATE TABLE review_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    tag_category VARCHAR(50) DEFAULT 'general',
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. API KEYS TABLE (For external integrations)
-- =====================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['read'],
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Businesses indexes
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_google_place_id ON businesses(google_place_id);
CREATE INDEX idx_businesses_yelp_business_id ON businesses(yelp_business_id);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);
CREATE INDEX idx_businesses_name_trgm ON businesses USING gin(name gin_trgm_ops);

-- Reviews indexes
CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_platform ON reviews(platform);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_review_date ON reviews(review_date);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_platform_review_id ON reviews(platform_review_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_text_trgm ON reviews USING gin(review_text gin_trgm_ops);

-- Sentiment analysis indexes
CREATE INDEX idx_sentiment_review_id ON sentiment_analysis(review_id);
CREATE INDEX idx_sentiment_overall_sentiment ON sentiment_analysis(overall_sentiment);
CREATE INDEX idx_sentiment_score ON sentiment_analysis(sentiment_score);
CREATE INDEX idx_sentiment_processed_at ON sentiment_analysis(processed_at);

-- Email notifications indexes
CREATE INDEX idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX idx_email_notifications_business_id ON email_notifications(business_id);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_created_at ON email_notifications(created_at);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Review tags indexes
CREATE INDEX idx_review_tags_review_id ON review_tags(review_id);
CREATE INDEX idx_review_tags_tag_name ON review_tags(tag_name);
CREATE INDEX idx_review_tags_category ON review_tags(tag_category);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Businesses policies
CREATE POLICY "Users can view own businesses" ON businesses
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own businesses" ON businesses
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own businesses" ON businesses
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own businesses" ON businesses
    FOR DELETE USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Users can view reviews for own businesses" ON reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM businesses 
            WHERE businesses.id = reviews.business_id 
            AND businesses.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Sentiment analysis policies
CREATE POLICY "Users can view sentiment for own business reviews" ON sentiment_analysis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reviews 
            JOIN businesses ON businesses.id = reviews.business_id
            WHERE reviews.id = sentiment_analysis.review_id 
            AND businesses.user_id = auth.uid()
        )
    );

-- Email notifications policies
CREATE POLICY "Users can view own notifications" ON email_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON email_notifications
    FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (user_id = auth.uid());

-- Review tags policies
CREATE POLICY "Users can view tags for own business reviews" ON review_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM reviews 
            JOIN businesses ON businesses.id = reviews.business_id
            WHERE reviews.id = review_tags.review_id 
            AND businesses.user_id = auth.uid()
        )
    );

-- API keys policies
CREATE POLICY "Users can view own API keys" ON api_keys
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own API keys" ON api_keys
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own API keys" ON api_keys
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own API keys" ON api_keys
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default preferences when user is created
CREATE TRIGGER create_user_preferences_trigger
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_default_user_preferences();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Business summary view
CREATE VIEW business_summary AS
SELECT 
    b.id,
    b.name,
    b.user_id,
    b.is_active,
    COUNT(r.id) as total_reviews,
    AVG(r.rating) as average_rating,
    COUNT(CASE WHEN r.rating <= 3 THEN 1 END) as low_rating_count,
    COUNT(CASE WHEN sa.overall_sentiment = 'negative' THEN 1 END) as negative_sentiment_count,
    MAX(r.review_date) as latest_review_date
FROM businesses b
LEFT JOIN reviews r ON b.id = r.business_id
LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
GROUP BY b.id, b.name, b.user_id, b.is_active;

-- Recent reviews with sentiment view
CREATE VIEW recent_reviews_with_sentiment AS
SELECT 
    r.id,
    r.business_id,
    b.name as business_name,
    r.review_text,
    r.rating,
    r.review_date,
    r.platform,
    sa.overall_sentiment,
    sa.sentiment_score,
    sa.confidence_score
FROM reviews r
JOIN businesses b ON r.business_id = b.id
LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
WHERE r.status = 'processed'
ORDER BY r.review_date DESC;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with authentication integration';
COMMENT ON TABLE businesses IS 'Businesses being monitored with platform identifiers';
COMMENT ON TABLE reviews IS 'Reviews from various platforms with full text and metadata';
COMMENT ON TABLE sentiment_analysis IS 'AI-powered sentiment analysis results for reviews';
COMMENT ON TABLE email_notifications IS 'Email notification history and delivery status';
COMMENT ON TABLE user_preferences IS 'User notification and alert preferences';
COMMENT ON TABLE review_tags IS 'Categorized tags for review classification';
COMMENT ON TABLE api_keys IS 'API keys for external integrations';

COMMENT ON COLUMN businesses.google_place_id IS 'Google Places API identifier';
COMMENT ON COLUMN businesses.yelp_business_id IS 'Yelp Business API identifier';
COMMENT ON COLUMN reviews.platform_review_id IS 'Original review ID from the platform';
COMMENT ON COLUMN sentiment_analysis.sentiment_score IS 'Sentiment score from -1.0 (negative) to 1.0 (positive)'; 