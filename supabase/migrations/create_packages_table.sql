-- Create packages table for fitness packages
CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body_fat_range VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    features TEXT[] NOT NULL DEFAULT '{}',
    image_url VARCHAR(500),
    price_usd INTEGER NOT NULL, -- Price in cents
    price_gbp INTEGER NOT NULL, -- Price in cents
    discounted_price_gbp INTEGER, -- Price in cents
    discount_percentage INTEGER NOT NULL DEFAULT 0,
    emoji VARCHAR(10) NOT NULL,
    specifications TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    duration_weeks INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_sort_order ON packages(sort_order);
CREATE INDEX IF NOT EXISTS idx_packages_body_fat_range ON packages(body_fat_range);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - packages are public, everyone can read
CREATE POLICY "Anyone can view active packages" ON packages
    FOR SELECT USING (is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_packages_updated_at_trigger 
    BEFORE UPDATE ON packages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_packages_updated_at();

-- Package verilerini mevcut tablo yapısına uygun olarak ekle
INSERT INTO packages (
    title, 
    body_fat_range, 
    description, 
    long_description, 
    features, 
    price_usd,  -- Bu kolon NOT NULL
    price_gbp,  -- Bu kolon da NOT NULL
    discounted_price_gbp,  -- Bu kolon da var
    discount_percentage, 
    emoji, 
    specifications, 
    recommendations, 
    duration_weeks,  -- Bu kolon da var
    sort_order,
    is_active
) VALUES 
(
    'Elite Athletes Package',
    '6-10% Body Fat',
    'Designed for professional athletes and bodybuilders. Extreme cutting and muscle definition workouts with advanced techniques.',
    'This elite-level program is specifically designed for professional athletes, competitive bodybuilders, and individuals who have already achieved a high level of fitness. The program focuses on extreme cutting protocols, advanced training techniques, and precise nutrition strategies.',
    ARRAY['Advanced cutting protocols', 'Competition prep guidance', 'Supplement optimization', 'Performance tracking', 'Elite nutrition plans'],
    299.00,  -- price_usd (USD cinsinden)
    236.00,  -- price_gbp (GBP cinsinden)
    157.00,  -- discounted_price_gbp (GBP cinsinden)
    33,      -- discount_percentage
    '💎',
    ARRAY['12-week intensive program', '6 days per week training', 'Advanced nutrition protocols', 'Weekly progress assessments'],
    ARRAY['Minimum 2 years of training experience', 'Current body fat below 12%', 'Access to well-equipped gym'],
    12,      -- duration_weeks
    1,       -- sort_order
    true     -- is_active
),
(
    'Advanced Fitness Package',
    '10-14% Body Fat',
    'Perfect for experienced fitness enthusiasts. Focus on strength building and lean muscle maintenance with scientific approach.',
    'Built for experienced fitness enthusiasts who want to take their physique to the next level. This program combines advanced strength training protocols with lean muscle maintenance strategies.',
    ARRAY['Advanced strength training', 'Muscle maintenance protocols', 'Progressive overload systems', 'Recovery optimization', 'Performance nutrition'],
    249.00,  -- price_usd
    197.00,  -- price_gbp
    134.00,  -- discounted_price_gbp
    32,
    '🏆',
    ARRAY['10-week progressive program', '5 days per week training', 'Strength-focused protocols', 'Bi-weekly progress assessments'],
    ARRAY['Minimum 1 year of training', 'Basic compound movement knowledge', 'Access to free weights'],
    10,
    2,
    true
),
(
    'Active Lifestyle Package',
    '14-18% Body Fat',
    'Great for active individuals looking to improve their physique. Balanced cardio and strength training for optimal results.',
    'Perfect program for active individuals who want to balance fitness with their busy lifestyle. Combines efficient workouts with flexible scheduling options.',
    ARRAY['Balanced training approach', 'Cardio-strength integration', 'Lifestyle-friendly schedules', 'Flexible meal plans', 'Progress tracking tools'],
    199.00,  -- price_usd
    157.00,  -- price_gbp
    110.00,  -- discounted_price_gbp
    30,
    '🎯',
    ARRAY['8-week balanced program', '4 days per week training', 'Flexible scheduling options', 'Weekly progress check-ins'],
    ARRAY['Basic fitness foundation', 'Consistent workout habit', 'Time for 4 weekly sessions'],
    8,
    3,
    true
),
(
    'Transformation Package',
    '18-22% Body Fat',
    'Ideal for those starting their fitness journey. Progressive workouts for sustainable weight loss and body transformation.',
    'Comprehensive transformation program designed for beginners who want to make lasting changes. Focus on building healthy habits and sustainable progress.',
    ARRAY['Progressive workout system', 'Weight loss strategies', 'Habit formation guidance', 'Motivation techniques', 'Community support'],
    179.00,  -- price_usd
    141.00,  -- price_gbp
    102.00,  -- discounted_price_gbp
    28,
    '🔥',
    ARRAY['12-week transformation program', '3-4 days per week training', 'Progressive difficulty increase', 'Habit tracking tools'],
    ARRAY['Ready to commit to change', 'Basic gym access', 'Willingness to track progress'],
    12,
    4,
    true
),
(
    'Beginner Boost Package',
    '22-26% Body Fat',
    'Perfect starting point for fitness beginners. Low-impact exercises with gradual intensity increase for safe progress.',
    'Gentle introduction to fitness with low-impact exercises and gradual progression. Perfect for those who are new to exercise or returning after a long break.',
    ARRAY['Beginner-friendly exercises', 'Low-impact movements', 'Gradual progression', 'Basic nutrition education', 'Weekly check-ins'],
    149.00,  -- price_usd
    118.00,  -- price_gbp
    78.00,   -- discounted_price_gbp
    34,
    '⚡',
    ARRAY['8-week beginner program', '3 days per week training', 'Low-impact focus', 'Educational materials included'],
    ARRAY['New to exercise', 'Previous injuries or concerns', 'Prefer gentle approach'],
    8,
    5,
    true
),
(
    'Health Foundation Package',
    '26-30% Body Fat',
    'Focus on building healthy habits and basic fitness. Gentle movements and lifestyle changes for long-term health.',
    'Foundational program focusing on health improvement rather than intense fitness. Emphasis on building sustainable healthy habits and gentle movement.',
    ARRAY['Gentle movement protocols', 'Lifestyle modification', 'Health habit building', 'Stress management', 'Sleep optimization'],
    129.00,  -- price_usd
    102.00,  -- price_gbp
    70.00,   -- discounted_price_gbp
    31,
    '🌟',
    ARRAY['10-week foundation program', '2-3 days per week activities', 'Health-focused approach', 'Lifestyle coaching included'],
    ARRAY['Health improvement focus', 'Gentle approach preferred', 'Building basic habits'],
    10,
    6,
    true
),
(
    'Wellness Journey Package',
    '30%+ Body Fat',
    'Comprehensive approach to health improvement. Medical support and supervised progress tracking for safe transformation.',
    'Holistic wellness program with medical support and comprehensive health assessment. Focus on safe, sustainable health improvement with professional guidance.',
    ARRAY['Medical supervision', 'Comprehensive health assessment', 'Safe progression protocols', 'Mental health support', 'Long-term sustainability'],
    199.00,  -- price_usd
    157.00,  -- price_gbp
    118.00,  -- discounted_price_gbp
    25,
    '💪',
    ARRAY['16-week wellness program', 'Medical assessment included', 'Supervised progression', 'Mental health resources'],
    ARRAY['Medical clearance obtained', 'Commitment to long-term change', 'Open to professional guidance'],
    16,
    7,
    true
),
(
    'Personalized Package',
    'Custom Body Fat',
    'Tailored specifically to your body composition and goals. One-on-one coaching available with personalized meal and workout plans.',
    'Completely customized program designed specifically for your unique needs, goals, and circumstances. Includes one-on-one coaching and personalized meal and workout plans.',
    ARRAY['Complete personalization', 'One-on-one coaching', 'Custom meal plans', 'Individual workout design', 'Unlimited support'],
    399.00,  -- price_usd
    315.00,  -- price_gbp
    236.00,  -- discounted_price_gbp
    25,
    '🚀',
    ARRAY['Fully customized duration', 'Personalized schedule', 'Individual assessment', 'Unlimited coach access'],
    ARRAY['Specific unique goals', 'Previous program experience', 'Investment in personalization'],
    12,  -- Custom duration
    8,
    true
);
