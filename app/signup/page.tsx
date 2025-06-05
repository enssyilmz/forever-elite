'use client'

import { useState } from 'react'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    phone: '',
    birthdate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md mt-10 text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">Yeni Üyelik</h1>
      <form className="space-y-4">
        <input name="firstName" placeholder="Adı" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="lastName" placeholder="Soyadı" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="email" placeholder="Email" type="email" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="password" placeholder="Şifre" type="password" onChange={handleChange} className="w-full border p-2 rounded" />
        
        <div className="flex gap-4 items-center">
          <label><input type="radio" name="gender" value="male" onChange={handleChange} /> Erkek</label>
          <label><input type="radio" name="gender" value="female" onChange={handleChange} /> Kadın</label>
          <label><input type="radio" name="gender" value="none" onChange={handleChange} /> Belirtmek istemiyorum</label>
        </div>

        <input name="phone" placeholder="(5XX) XXX XX XX" onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="birthdate" type="date" onChange={handleChange} className="w-full border p-2 rounded" />

        <div className="space-y-2 text-sm text-gray-700">
          <label><input type="checkbox" /> Elektronik Ticaret iletisi almak istiyorum.</label>
          <label><input type="checkbox" /> Üyelik sözleşmesini kabul ediyorum.</label>
          <label><input type="checkbox" /> Aydınlatma Metnini okudum.</label>
        </div>

        <div className="border p-4 rounded bg-gray-100">
          <p>Ben robot değilim (reCAPTCHA alanı)</p>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 bg-gray-300 rounded">İptal</button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">Kaydet</button>
        </div>
      </form>
    </div>
  )
}
