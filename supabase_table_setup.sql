-- Önceki tabloyu ve ilgili nesneleri güvenli bir şekilde kaldır
DROP TABLE IF EXISTS public.user_registrations CASCADE;

-- Kullanıcı kayıt bilgilerini saklayacak tabloyu yeniden oluştur
CREATE TABLE public.user_registrations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
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

-- RLS'yi (Row Level Security) etkinleştir
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- Yeni kayıtlar için index'ler oluştur
CREATE INDEX idx_user_registrations_user_id ON public.user_registrations(user_id);
CREATE INDEX idx_user_registrations_email ON public.user_registrations(email);

-- Politika: Kullanıcıların kendi kayıtlarını eklemesine izin ver
-- Bu politika, yeni bir kullanıcının kendi user_id'si ile bir profil oluşturabilmesini sağlar.
CREATE POLICY "Users can insert their own registration"
  ON public.user_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politika: Kullanıcıların kendi kayıtlarını görmesine izin ver
CREATE POLICY "Users can view their own registration"
  ON public.user_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Politika: Kullanıcıların kendi kayıtlarını güncellemesine izin ver
CREATE POLICY "Users can update their own registration"
  ON public.user_registrations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: updated_at sütununu otomatik güncelle
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_user_registrations_updated_at
  BEFORE UPDATE ON public.user_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();