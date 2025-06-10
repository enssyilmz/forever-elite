-- Kullanıcı kayıt bilgilerini saklayacak tablo oluştur
CREATE TABLE user_registrations (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Gerçek uygulamada hash'lenmiş olmalı
  gender VARCHAR(20),
  country_code VARCHAR(10),
  phone VARCHAR(20),
  birthdate DATE,
  agree_marketing BOOLEAN DEFAULT FALSE,
  agree_membership BOOLEAN DEFAULT FALSE,
  agree_privacy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email için index oluştur (hızlı arama için)
CREATE INDEX idx_user_registrations_email ON user_registrations(email);

-- Timestamp otomatik güncelleme için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger oluştur
CREATE TRIGGER update_user_registrations_updated_at 
    BEFORE UPDATE ON user_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) aktif et
ALTER TABLE user_registrations ENABLE ROW LEVEL SECURITY;

-- Herkese insert izni ver (kayıt için)
CREATE POLICY "Anyone can insert user registrations" ON user_registrations
  FOR INSERT WITH CHECK (true);

-- Sadece kendi kayıtlarını görebilme (opsiyonel)
CREATE POLICY "Users can view own registrations" ON user_registrations
  FOR SELECT USING (auth.uid() IS NOT NULL); 