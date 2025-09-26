-- Remove emoji field and add image fields to packages table
ALTER TABLE packages 
DROP COLUMN IF EXISTS emoji,
ADD COLUMN IF NOT EXISTS image_url_1 TEXT,
ADD COLUMN IF NOT EXISTS image_url_2 TEXT;

-- Update existing packages to have placeholder image URLs (optional)
-- You can replace these with actual image URLs later
UPDATE packages 
SET 
  image_url_1 = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Package+Image+1',
  image_url_2 = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Package+Image+2'
WHERE image_url_1 IS NULL OR image_url_2 IS NULL;
