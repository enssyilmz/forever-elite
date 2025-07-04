-- Kullanıcı kayıt tablosuna vücut ölçümü sütunları ekleme
-- Bu sütunlar fitness uygulaması için gerekli

ALTER TABLE public.user_registrations 
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2), -- Boy (cm cinsinden, örn: 175.50)
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2), -- Kilo (kg cinsinden, örn: 70.25)  
ADD COLUMN IF NOT EXISTS body_fat DECIMAL(4,2); -- Vücut yağ oranı (%, örn: 15.50)

-- Sütunlara yorum ekle
COMMENT ON COLUMN public.user_registrations.height IS 'Kullanıcının boyu (cm cinsinden)';
COMMENT ON COLUMN public.user_registrations.weight IS 'Kullanıcının kilosu (kg cinsinden)';
COMMENT ON COLUMN public.user_registrations.body_fat IS 'Kullanıcının vücut yağ oranı (% cinsinden)'; 