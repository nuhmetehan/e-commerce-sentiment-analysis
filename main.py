# uvicorn main:app --reload (api'yi çalıştırmak için terminal komutu)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib # eğitilmiş modeli ve vektörleştiriciyi yükler
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# NLTK gereksinimleri (Sunucu ilk kalktığında eksikse indirir)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

# 1. web sunucusunu başlat
app = FastAPI(
    title="E-Commerce Sentiment API", 
    description="Machine learning-based sentiment analysis for customer reviews."
)

app.add_middleware(
    CORSMiddleware, # Next.js frontend'inin API'ye erişebilmesi için
    allow_origins=["http://localhost:3000"], # Next.js'in adresi
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelleri hafızaya yükle (Global olarak yüklüyoruz ki her istekte baştan okunmasın)
try:
    model = joblib.load('sentiment_model.pkl') # eğitilmiş model dosyası
    vectorizer = joblib.load('tfidf_vectorizer.pkl') # metni sayısal hale getiren vektörleştirici dosyası
    print("✅ Model and vectorizer successfully loaded.")
except Exception as e:
    print(f"❌ Error occurred while loading model: {e}")

# NLP Araçları
stop_words = set(stopwords.words('english')) # "the", "is" gibi anlamsız kelimeleri filtreler
lemmatizer = WordNetLemmatizer() # kelime köklerini bulur 

# Temizlik Fonksiyonu
def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    words = text.split()
    cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    return " ".join(cleaned_words)

# İstemciden (Frontend'den) gelecek verinin türünü tanımla
class ReviewRequest(BaseModel):
    text: str #json formatında {"text": "Bu ürün harika!"} şeklinde 


@app.post("/predict") # POST isteği
def predict_sentiment(request: ReviewRequest):
    
    cleaned = clean_text(request.text) # Gelen metni temizle
    
    
    vec_text = vectorizer.transform([cleaned]) # Metni sayılara (vektöre) çevir
    
    
    prediction = model.predict(vec_text)[0] # Modeli kullanarak tahmin yap
    probabilities = model.predict_proba(vec_text)[0] # güven oranı
    
    # Sonuçları formatla
    sentiment = "Pozitive" if prediction == 1 else "Negative"
    confidence = round(max(probabilities) * 100, 2)
    
    # JSON olarak geri döndür
    return {
        "original_text": request.text,
        "sentiment": sentiment,
        "confidence_score": confidence
    }