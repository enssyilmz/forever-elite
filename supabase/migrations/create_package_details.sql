-- Create package_details table for storing detailed package information
CREATE TABLE IF NOT EXISTS package_details (
  id BIGSERIAL PRIMARY KEY,
  package_id INTEGER UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  body_fat_range VARCHAR(100),
  description TEXT,
  long_description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  original_price INTEGER,
  discounted_price INTEGER,
  discount INTEGER,
  icon_name VARCHAR(50) DEFAULT 'Package',
  icon_color VARCHAR(50) DEFAULT 'gray',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_package_details_package_id ON package_details(package_id);

-- Insert existing package data
INSERT INTO package_details (
  package_id, title, body_fat_range, description, long_description, 
  features, specifications, recommendations, 
  original_price, discounted_price, discount, icon_name, icon_color
) VALUES 
(1, 'Elite Athletes Package', '6-10% Body Fat', 
 'Designed for professional athletes and bodybuilders. Extreme cutting and muscle definition workouts with advanced techniques.',
 'This elite-level program is specifically designed for professional athletes, competitive bodybuilders, and individuals who have already achieved a high level of fitness. The program focuses on extreme cutting protocols, advanced training techniques, and precise nutrition strategies.',
 '["Advanced cutting protocols", "Competition prep guidance", "Supplement optimization", "Performance tracking", "Elite nutrition plans"]'::jsonb,
 '["12-week intensive program", "6 days per week training", "Advanced nutrition protocols", "Weekly progress assessments"]'::jsonb,
 '["Minimum 2 years of training experience", "Current body fat below 12%", "Access to well-equipped gym"]'::jsonb,
 299, 199, 33, 'Diamond', 'purple'),

(2, 'Advanced Fitness Package', '10-14% Body Fat',
 'Perfect for experienced fitness enthusiasts. Focus on strength building and lean muscle maintenance with scientific approach.',
 'Built for experienced fitness enthusiasts who want to take their physique to the next level. This program combines advanced strength training protocols with lean muscle maintenance strategies.',
 '["Advanced strength training", "Muscle maintenance protocols", "Progressive overload systems", "Recovery optimization", "Performance nutrition"]'::jsonb,
 '["10-week progressive program", "5 days per week training", "Strength-focused protocols", "Bi-weekly progress assessments"]'::jsonb,
 '["Minimum 1 year of training", "Basic compound movement knowledge", "Access to free weights"]'::jsonb,
 249, 169, 32, 'Trophy', 'yellow'),

(3, 'Active Lifestyle Package', '14-18% Body Fat',
 'Great for active individuals looking to improve their physique. Balanced cardio and strength training for optimal results.',
 'Perfect program for active individuals who want to balance fitness with their busy lifestyle. Combines efficient workouts with flexible scheduling options.',
 '["Balanced training approach", "Cardio-strength integration", "Lifestyle-friendly schedules", "Flexible meal plans", "Progress tracking tools"]'::jsonb,
 '["8-week balanced program", "4 days per week training", "Flexible scheduling options", "Weekly progress check-ins"]'::jsonb,
 '["Basic fitness foundation", "Consistent workout habit", "Time for 4 weekly sessions"]'::jsonb,
 199, 139, 30, 'Target', 'blue'),

(4, 'Transformation Package', '18-22% Body Fat',
 'Ideal for those starting their fitness journey. Progressive workouts for sustainable weight loss and body transformation.',
 'Comprehensive transformation program designed for beginners who want to make lasting changes. Focus on building healthy habits and sustainable progress.',
 '["Progressive workout system", "Weight loss strategies", "Habit formation guidance", "Motivation techniques", "Community support"]'::jsonb,
 '["12-week transformation program", "3-4 days per week training", "Progressive difficulty increase", "Habit tracking tools"]'::jsonb,
 '["Ready to commit to change", "Basic gym access", "Willingness to track progress"]'::jsonb,
 179, 129, 28, 'Flame', 'red'),

(5, 'Beginner Boost Package', '22-26% Body Fat',
 'Perfect starting point for fitness beginners. Low-impact exercises with gradual intensity increase for safe progress.',
 'Gentle introduction to fitness with low-impact exercises and gradual progression. Perfect for those who are new to exercise or returning after a long break.',
 '["Beginner-friendly exercises", "Low-impact movements", "Gradual progression", "Basic nutrition education", "Weekly check-ins"]'::jsonb,
 '["8-week beginner program", "3 days per week training", "Low-impact focus", "Educational materials included"]'::jsonb,
 '["New to exercise", "Previous injuries or concerns", "Prefer gentle approach"]'::jsonb,
 149, 99, 34, 'Zap', 'green'),

(6, 'Health Foundation Package', '26-30% Body Fat',
 'Focus on building healthy habits and basic fitness. Gentle movements and lifestyle changes for long-term health.',
 'Foundational program focusing on health improvement rather than intense fitness. Emphasis on building sustainable healthy habits and gentle movement.',
 '["Gentle movement protocols", "Lifestyle modification", "Health habit building", "Stress management", "Sleep optimization"]'::jsonb,
 '["10-week foundation program", "2-3 days per week activities", "Health-focused approach", "Lifestyle coaching included"]'::jsonb,
 '["Health improvement focus", "Gentle approach preferred", "Building basic habits"]'::jsonb,
 129, 89, 31, 'Star', 'orange'),

(7, 'Wellness Journey Package', '30%+ Body Fat',
 'Comprehensive approach to health improvement. Medical support and supervised progress tracking for safe transformation.',
 'Holistic wellness program with medical support and comprehensive health assessment. Focus on safe, sustainable health improvement with professional guidance.',
 '["Medical supervision", "Comprehensive health assessment", "Safe progression protocols", "Mental health support", "Long-term sustainability"]'::jsonb,
 '["16-week wellness program", "Medical assessment included", "Supervised progression", "Mental health resources"]'::jsonb,
 '["Medical clearance obtained", "Commitment to long-term change", "Open to professional guidance"]'::jsonb,
 199, 149, 25, 'Package', 'pink'),

(8, 'Personalized Package', 'Custom Body Fat',
 'Tailored specifically to your body composition and goals. One-on-one coaching available with personalized meal and workout plans.',
 'Completely customized program designed specifically for your unique needs, goals, and circumstances. Includes one-on-one coaching and personalized meal and workout plans.',
 '["Complete personalization", "One-on-one coaching", "Custom meal plans", "Individual workout design", "Unlimited support"]'::jsonb,
 '["Fully customized duration", "Personalized schedule", "Individual assessment", "Unlimited coach access"]'::jsonb,
 '["Specific unique goals", "Previous program experience", "Investment in personalization"]'::jsonb,
 399, 299, 25, 'Rocket', 'indigo');

-- Enable Row Level Security
ALTER TABLE package_details ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read package details
CREATE POLICY "Allow public read access to package details" ON package_details
FOR SELECT USING (true);

-- Create policy to allow only admins to modify package details
CREATE POLICY "Allow admin write access to package details" ON package_details
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@foreverelite.com'
  )
);
