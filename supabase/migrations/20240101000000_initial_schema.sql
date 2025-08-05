-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'business_owner' CHECK (role IN ('admin', 'business_owner')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    google_place_id TEXT,
    yelp_business_id TEXT,
    is_monitoring_enabled BOOLEAN DEFAULT true,
    monitoring_frequency TEXT DEFAULT 'daily' CHECK (monitoring_frequency IN ('hourly', 'daily', 'weekly')),
    last_review_fetch TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('google', 'yelp', 'facebook', 'tripadvisor')),
    platform_review_id TEXT NOT NULL,
    reviewer_name TEXT,
    reviewer_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    review_url TEXT,
    is_processed BOOLEAN DEFAULT false,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, platform, platform_review_id)
);

-- Create sentiment_analysis table
CREATE TABLE public.sentiment_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    overall_sentiment TEXT NOT NULL CHECK (overall_sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score DECIMAL(3,2) NOT NULL CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    key_topics TEXT[],
    key_phrases TEXT[],
    analysis_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_notifications table
CREATE TABLE public.email_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('new_review', 'sentiment_alert', 'weekly_summary', 'monthly_report')),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications_enabled BOOLEAN DEFAULT true,
    notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    sentiment_threshold DECIMAL(3,2) DEFAULT 0.3 CHECK (sentiment_threshold >= -1.0 AND sentiment_threshold <= 1.0),
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_tags table
CREATE TABLE public.review_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    tag_category TEXT CHECK (tag_category IN ('service', 'product', 'ambiance', 'staff', 'value', 'other')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['read']::TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_businesses_google_place_id ON public.businesses(google_place_id);
CREATE INDEX idx_businesses_yelp_business_id ON public.businesses(yelp_business_id);
CREATE INDEX idx_businesses_monitoring_enabled ON public.businesses(is_monitoring_enabled);

CREATE INDEX idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX idx_reviews_platform ON public.reviews(platform);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_review_date ON public.reviews(review_date);
CREATE INDEX idx_reviews_processing_status ON public.reviews(processing_status);
CREATE INDEX idx_reviews_platform_review_id ON public.reviews(platform_review_id);
CREATE INDEX idx_reviews_text_search ON public.reviews USING gin(to_tsvector('english', review_text));

CREATE INDEX idx_sentiment_analysis_review_id ON public.sentiment_analysis(review_id);
CREATE INDEX idx_sentiment_analysis_sentiment ON public.sentiment_analysis(overall_sentiment);
CREATE INDEX idx_sentiment_analysis_score ON public.sentiment_analysis(sentiment_score);

CREATE INDEX idx_email_notifications_user_id ON public.email_notifications(user_id);
CREATE INDEX idx_email_notifications_business_id ON public.email_notifications(business_id);
CREATE INDEX idx_email_notifications_type ON public.email_notifications(notification_type);
CREATE INDEX idx_email_notifications_sent ON public.email_notifications(is_sent);

CREATE INDEX idx_review_tags_review_id ON public.review_tags(review_id);
CREATE INDEX idx_review_tags_name ON public.review_tags(tag_name);
CREATE INDEX idx_review_tags_category ON public.review_tags(tag_category);

CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Unknown'),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE auth_user_id = auth.uid() AND role = 'admin'
        )
    );

-- Businesses policies
CREATE POLICY "Users can view own businesses" ON public.businesses
    FOR SELECT USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own businesses" ON public.businesses
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update own businesses" ON public.businesses
    FOR UPDATE USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own businesses" ON public.businesses
    FOR DELETE USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

-- Reviews policies
CREATE POLICY "Users can view reviews for own businesses" ON public.reviews
    FOR SELECT USING (business_id IN (
        SELECT b.id FROM public.businesses b
        JOIN public.users u ON b.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can insert reviews for own businesses" ON public.reviews
    FOR INSERT WITH CHECK (business_id IN (
        SELECT b.id FROM public.businesses b
        JOIN public.users u ON b.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update reviews for own businesses" ON public.reviews
    FOR UPDATE USING (business_id IN (
        SELECT b.id FROM public.businesses b
        JOIN public.users u ON b.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
    ));

-- Sentiment analysis policies
CREATE POLICY "Users can view sentiment analysis for own reviews" ON public.sentiment_analysis
    FOR SELECT USING (review_id IN (
        SELECT r.id FROM public.reviews r
        JOIN public.businesses b ON r.business_id = b.id
        JOIN public.users u ON b.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
    ));

-- Email notifications policies
CREATE POLICY "Users can view own notifications" ON public.email_notifications
    FOR SELECT USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

-- Review tags policies
CREATE POLICY "Users can view tags for own reviews" ON public.review_tags
    FOR SELECT USING (review_id IN (
        SELECT r.id FROM public.reviews r
        JOIN public.businesses b ON r.business_id = b.id
        JOIN public.users u ON b.user_id = u.id
        WHERE u.auth_user_id = auth.uid()
    ));

-- API keys policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
    FOR SELECT USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own API keys" ON public.api_keys
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can update own API keys" ON public.api_keys
    FOR UPDATE USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own API keys" ON public.api_keys
    FOR DELETE USING (user_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )); 