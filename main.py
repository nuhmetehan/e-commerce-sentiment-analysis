from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# NLTK gereksinimleri (Sunucu ilk kalktığında eksikse indirir)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# 1. FastAPI uygulamasını başlat
app = FastAPI(
    title="E-Commerce Sentiment API", 
    description="Müşteri yorumları için makine öğrenmesi tabanlı duygu analizi."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js'in adresi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Modelleri hafızaya yükle (Global olarak yüklüyoruz ki her istekte baştan okunmasın, hızlı olsun)
try:
    model = joblib.load('sentiment_model.pkl')
    vectorizer = joblib.load('tfidf_vectorizer.pkl')
    print("✅ Model ve Vectorizer başarıyla yüklendi.")
except Exception as e:
    print(f"❌ Model yüklenirken hata oluştu: {e}")

# NLP Araçları
stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# Temizlik Fonksiyonu (Notebook'taki ile aynı)
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    words = text.split()
    cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(cleaned_words)

# 3. İstemciden (Frontend'den) gelecek verinin şeması (Pydantic ile güvenlik)
class ReviewRequest(BaseModel):
    text: str

# 4. Tahmin Endpoint'i (POST isteği alacak)
@app.post("/predict")
def predict_sentiment(request: ReviewRequest):
    # Gelen metni temizle
    cleaned = clean_text(request.text)
    
    # Metni sayılara (vektöre) çevir
    vec_text = vectorizer.transform([cleaned])
    
    # Modeli kullanarak tahmin yap
    prediction = model.predict(vec_text)[0]
    probabilities = model.predict_proba(vec_text)[0]
    
    # Sonuçları formatla
    sentiment = "Pozitif" if prediction == 1 else "Negatif"
    confidence = round(max(probabilities) * 100, 2)
    
    # JSON olarak geri döndür
    return {
        "original_text": request.text,
        "sentiment": sentiment,
        "confidence_score": confidence
    }