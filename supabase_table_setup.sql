-- Önce mevcut tabloyu ve ilgili nesneleri silelim (verileri yedeklediğinizden emin olun)
DROP TABLE IF EXISTS public.user_registrations CASCADE;

-- Kullanıcı profil bilgilerini saklayacak yeni tablo
-- Bu tablo, Supabase Auth kullanıcılarına 1-e-1 ilişkili olacak
CREATE TABLE public.user_registrations (
  id UUID NOT NULL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  gender VARCHAR(20),
  country_code VARCHAR(10),
  phone VARCHAR(20),
  birthdate DATE,
  agree_marketing BOOLEAN DEFAULT FALSE,
  agree_membership BOOLEAN DEFAULT FALSE,
  agree_privacy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- `auth.users` tablosundaki `id`'ye referans veren foreign key
  CONSTRAINT fk_user
    FOREIGN KEY(id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Email için index oluştur (hızlı arama için)
CREATE INDEX idx_user_registrations_email ON public.user_registrations(email);

-- Timestamp otomatik güncelleme için trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger oluştur
CREATE TRIGGER update_user_registrations_updated_at 
    BEFORE UPDATE ON public.user_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security (RLS) aktif et
ALTER TABLE public.user_registrations ENABLE ROW LEVEL SECURITY;

-- Yeni RLS politikaları
-- Kullanıcılar kendi profil bilgilerini güncelleyebilir
CREATE POLICY "Users can update their own profile" 
ON public.user_registrations
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Kullanıcılar kendi profil bilgilerini görebilir
CREATE POLICY "Users can view their own profile" 
ON public.user_registrations
FOR SELECT USING (auth.uid() = id);

-- NOT: "Users can insert their own profile" politikası kaldırıldı çünkü bu işlem artık trigger ile yönetiliyor.

-- KULLANICI PROFİLİ OLUŞTURMAK İÇİN TRIGGER
-- Yeni bir kullanıcı auth.users'a eklendiğinde user_registrations tablosunda bir profil oluşturur.

-- 1. Bu işlemi yapacak fonksiyonu tanımla
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_registrations (id, email, first_name, last_name, gender, country_code, phone, birthdate, agree_marketing, agree_membership, agree_privacy)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'country_code',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'birthdate')::date,
    (new.raw_user_meta_data->>'agree_marketing')::boolean,
    (new.raw_user_meta_data->>'agree_membership')::boolean,
    (new.raw_user_meta_data->>'agree_privacy')::boolean
  );
  RETURN new;
END;
$$;

-- 2. Fonksiyonu tetikleyecek trigger'ı oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- NOT: `password` sütunu kaldırıldı çünkü artık Supabase Auth tarafından yönetiliyor.
-- INSERT policy'si, trigger tarafından yönetildiği için kaldırılmıştır.

-- ADMIN PANEL İÇİN GÜVENLİ VERİ ÇEKME FONKSİYONU
-- Bu RPC fonksiyonu, sadece admin e-postasına sahip kullanıcının
-- tüm kullanıcı kayıtlarını çekmesine izin verir.

DROP FUNCTION IF EXISTS get_all_users();
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Sadece adminin bu fonksiyonu çalıştırabildiğinden emin ol
  IF (SELECT auth.jwt()->>'email') = 'yozdzhansyonmez@gmail.com' THEN
    RETURN QUERY
    SELECT json_build_object(
      'id', u.id,
      'email', u.email,
      'created_at', u.created_at,
      'last_sign_in_at', u.last_sign_in_at,
      'first_name', u.raw_user_meta_data->>'first_name',
      'last_name', u.raw_user_meta_data->>'last_name',
      'provider', u.raw_app_meta_data->>'provider'
    )
    FROM auth.users u;
  ELSE
    -- Eğer çağıran admin değilse, boş bir set döndür
    RETURN;
  END IF;
END;
$$;