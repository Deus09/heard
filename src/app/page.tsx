import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Map, List, Filter, Search, Bookmark, Plus, ForkKnife } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-5xl font-serif text-red-600 mb-4">Heard!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Çalıştığınız yerlerdeki deneyimlerinizi anonim olarak paylaşın
          </p>
          <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 py-3">
            <Plus className="mr-2 h-5 w-5" /> Yorum Ekle
          </Button>
        </div>

        <div className="flex justify-center my-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input type="text" placeholder="Bir restoran bul" className="pl-10 w-full rounded-full" />
          </div>
        </div>

        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="default" className="bg-red-500 text-white rounded-full">
              <List className="mr-2 h-4 w-4" /> Liste Görünümü
            </Button>
            <Button variant="ghost" className="text-gray-600 rounded-full">
              <Map className="mr-2 h-4 w-4" /> Harita Görünümü
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif">Pastane Yorumları</h2>
          <Button variant="default" className="bg-red-500 text-white rounded-full p-3">
            <Filter className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ReviewCard
            company="The Cheesecake Factory"
            address="115 Huntington Ave Suite 181, Boston, MA 02199, USA"
            rating={3}
            review="Bu mekan berbat. Tam bir lüks Applebees. Yemekler vasat ve pahalı, ama o lanet çizkekler harika. Restoran sürekli..."
            date="06.01.2023"
          />
          <ReviewCard
            company="Subway"
            address="1101 4th St SW 4th Street Bldg, Unit 130, Washington, DC 20024, USA"
            rating={4}
            review="Bu lokasyonun sahibi (Luke) haftada bir çalışılan vardiya başına 2 öğüne kadar %50 indirim sağlıyor (indirim öncesi) öğün başına 20$'a kadar. Eğitim..."
            date="10.02.2023"
          />
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        <div className="flex items-center space-x-2">
          <ForkKnife className="text-red-600 h-8 w-8" />
          <span className="text-2xl font-serif text-red-600">Heard!</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-600 hover:text-red-500">Anasayfa</a>
          <a href="#" className="text-gray-600 hover:text-red-500">Yorum Ekle</a>
          <a href="#" className="text-gray-600 hover:text-red-500">Yorumlarım</a>
        </nav>
        <div>
          <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
            Giriş Yap
          </Button>
        </div>
      </div>
    </header>
  );
}

interface ReviewCardProps {
  company: string;
  address: string;
  rating: number;
  review: string;
  date: string;
}

function ReviewCard({ company, address, rating, review, date }: ReviewCardProps) {
  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{company}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{address}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">{rating}/5</span>
            <Bookmark className="text-gray-400" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{review}</p>
        <p className="text-sm text-gray-400">{date}</p>
      </CardContent>
    </Card>
  );
}
