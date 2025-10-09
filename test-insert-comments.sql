-- Test yorumu ekle
INSERT INTO comments (
  business_name, 
  city, 
  district, 
  experience, 
  rating, 
  username, 
  anonymous,
  user_id
)
VALUES (
  'Test Kafesi', 
  'İstanbul', 
  'Kadıköy', 
  'Harika bir yer, çok beğendim. Personel güler yüzlü ve hizmet kaliteli.', 
  5, 
  'test_user_1', 
  false,
  NULL
);

-- Birkaç tane daha ekleyelim
INSERT INTO comments (
  business_name, 
  city, 
  district, 
  experience, 
  rating, 
  username, 
  anonymous,
  user_id
)
VALUES 
(
  'Güzel Restoran', 
  'Ankara', 
  'Çankaya', 
  'Yemekler lezzetli ama servis biraz yavaştı. Genel olarak memnun kaldım.', 
  4, 
  'test_user_2', 
  false,
  NULL
),
(
  'Süper Market', 
  'İzmir', 
  'Karşıyaka', 
  'Fiyatlar uygun ve ürün çeşidi çok fazla. Kesinlikle tavsiye ederim!', 
  5, 
  'test_user_3', 
  false,
  NULL
),
(
  'Ofis Plaza', 
  'İstanbul', 
  'Şişli', 
  'Modern ve ferah bir çalışma ortamı. Teknolojik altyapı çok iyi.', 
  5, 
  'test_user_4', 
  false,
  NULL
);

-- Eklenen yorumları göster
SELECT 
  id,
  business_name,
  city,
  district,
  rating,
  username,
  created_at
FROM comments
ORDER BY created_at DESC
LIMIT 10;
