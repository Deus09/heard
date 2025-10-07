"use client";

import { Utensils, Menu, Send, Star } from "lucide-react";
import { useState } from "react";

export default function AddReviewPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    city: "",
    experience: "",
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mevcut yorumları al
      const existingReviews = localStorage.getItem('reviews');
      const reviews = existingReviews ? JSON.parse(existingReviews) : [];

      // Yeni yorum oluştur
      const newReview = {
        id: Date.now().toString(),
        businessName: formData.businessName,
        city: formData.city,
        experience: formData.experience,
        rating: formData.rating,
        createdAt: new Date().toISOString()
      };

      // Yeni yorumu ekle
      reviews.push(newReview);

      // LocalStorage'a kaydet
      localStorage.setItem('reviews', JSON.stringify(reviews));

      // Custom event dispatch et (aynı sekmedeki değişiklikleri bildirmek için)
      window.dispatchEvent(new Event('reviewsUpdated'));

      // Formu temizle
      setFormData({
        businessName: "",
        city: "",
        experience: "",
        rating: 5
      });

      // Başarı mesajı göster
      alert('Yorumunuz başarıyla eklendi!');
      
      // Ana sayfaya yönlendir
      window.location.href = '/';
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Yeni Yorum Ekle</h1>
          <p className="text-gray-500">İş deneyiminizi anonim olarak paylaşın</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-4">
          {/* İş Yeri Adı */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-semibold text-gray-900 mb-2">
              İş Yeri Adı <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Örn: Starbucks, McDonald's..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>

          {/* Şehir */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2">
              Şehir <span className="text-gray-400 text-xs">(Opsiyonel)</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Örn: İstanbul, Ankara..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>

          {/* Puan */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Puan <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((starNumber) => (
                <button
                  key={starNumber}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: starNumber }))}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      starNumber <= formData.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 fill-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">({formData.rating}/5)</span>
            </div>
          </div>

          {/* Tecrübe */}
          <div>
            <label htmlFor="experience" className="block text-sm font-semibold text-gray-900 mb-2">
              Tecrübe <span className="text-red-600">*</span>
            </label>
            <textarea
              id="experience"
              name="experience"
              required
              value={formData.experience}
              onChange={handleChange}
              rows={6}
              placeholder="İş yerinizle ilgili tecrübelerinizi detaylı bir şekilde anlatın..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              Lütfen deneyiminizi detaylı ve yapıcı bir şekilde paylaşın.
            </p>
          </div>

          {/* Gönder Butonu */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-red-500/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              <span>{isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <a className="flex items-center gap-2" href="/">
            <Utensils className="h-5 w-5 text-primary" />
            <span className="font-semibold">Heard!</span>
          </a>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-foreground hover:text-primary transition-colors" href="/">
            Ana Sayfa
          </a>
          <a aria-current="page" className="text-red-600 hover:text-red-600 transition-colors font-semibold" href="/add-review">
            Yorum Ekle
          </a>
          <a className="text-foreground hover:text-primary transition-colors" href="/account/reviews">
            Yorumlarım
          </a>
        </nav>
        <div className="hidden md:block">
          <div className="">
            <a href="/auth">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" aria-label="Giriş Yap">
                Giriş Yap
              </button>
            </a>
          </div>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <div className="">
            <a href="/auth">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" aria-label="Giriş Yap">
                Giriş Yap
              </button>
            </a>
          </div>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10" aria-label="Menüyü Aç" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-:r0:" data-state="closed">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
