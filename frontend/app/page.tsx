// cd frontend (frontend dizinine geçmek için terminal komutu)
// npm run dev (frontend'i çalıştırmak için terminal komutu)

"use client"; //client component

import { useState } from "react";

// GEÇMİŞ LİSTESİ İÇİN TİP TANIMI EKLENDİ
type HistoryItem = {
  text: string;
  sentiment: string;
  confidence: number;
};

export default function Home() {
  const [review, setReview] = useState(""); // review yorum metni
  const [result, setResult] = useState<{ sentiment: string; confidence: number } | null>(null); // API'den dönen sonuç
  const [loading, setLoading] = useState(false); // API çağrısı sırasında yükleniyor durumunu göstermek için
  const [history, setHistory] = useState<HistoryItem[]>([]); // GEÇMİŞ LİSTESİ STATE'İ EKLENDİ

  const analyzeReview = async () => { 
    if (!review) return; // yorum boşsa işlem yapma
    setLoading(true); // yükleniyor durumu
    setResult(null);  // önceki sonucu temizle

    try {
      // FastAPI sunucumuza istek atıyoruz
      const res = await fetch("http://127.0.0.1:8000/predict", { // fetch: HTTP isteği yapmak için kullanılan bir JavaScript fonksiyonu
        method: "POST", // POST metodunu kullan (veri gönderme)
        headers: { "Content-Type": "application/json" }, // JSON formatında veri gönderileceğini belirt
        body: JSON.stringify({ text: review }),
      });

      const data = await res.json(); // API'den dönen yanıtı JSON formatında al
      // YENİ EKLENEN KISIM: Hem ana sonucu hem de geçmiş listesini güncelliyoruz
      const newResult = {
        sentiment: data.sentiment,
        confidence: data.confidence_score,
      };
      
      setResult(newResult);
      setHistory((prev) => [{ text: review, ...newResult }, ...prev]); // Yeni analizi geçmişin en başına ekle
    } catch (error) { // hata durumunda konsola yazdır ve kullanıcıya uyarı göster
      console.error("API'ye bağlanılamadı:", error);
      alert("Sunucuya bağlanılamadı. FastAPI'nin çalıştığından emin olun.");
    } finally { // API çağrısı tamamlandığında yükleniyor durumunu kapat. hata olsa da olmasa da çalışır
      setLoading(false);
    }
  };

  return (
    
    <main className="min-h-screen bg-gradient-to-br from-amber-600 via-sky-900 to-slate-800 flex items-center justify-center p-4">
      
      {/* KART İÇİN GLOWING GRADIENT KONTEYNERİ */}
      <div className="relative max-w-2xl w-full group/card">
        
        {/* 1. Katman: Kartın Arkasındaki Parlama (Glow) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-rose-500 rounded-3xl blur-xl opacity-40 group-hover/card:opacity-70 transition duration-1000"></div>

        {/* 2. Katman: ANA KART (Yarı Transparan Glassmorphism) */}
        <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full text-white"> 
          
          <h1 className="text-3xl font-extrabold mb-2 drop-shadow-lg">Customer Review Sentiment Analysis</h1>
          <p className="text-white/80 mb-6 font-medium">Analyze the sentiment of customer reviews using AI model.</p>

          <textarea
            className="w-full p-4 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-fuchsia-400 outline-none text-white placeholder:text-white/50 resize-none h-32 backdrop-blur-md transition-all shadow-inner"
            placeholder="Enter your customer review in English... (e.g., The fabric is terrible and it runs very small.)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          {/* BUTON İÇİN GLOWING GRADIENT KONTEYNERİ */}
          <div className="relative w-full mt-6 group/btn">
            {/* Buton Arkasındaki Parlama */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-rose-500 rounded-xl blur-md opacity-60 group-hover/btn:opacity-100 group-hover/btn:blur-lg group-hover/btn:-inset-1.5 transition-all duration-500 ease-out"></div>
            
            {/* analyze butonu */}
            <button
              onClick={analyzeReview}
              disabled={loading || !review}
              className="relative w-full bg-slate-900/50 hover:bg-slate/20 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            >
              {loading ? "Analyzing Sentiment..." : "Analyze Sentiment"}
            </button>
          </div>

          {/* result kutusu*/}
          {result && (
            <div className={`mt-8 p-5 rounded-xl border border-white/20 backdrop-blur-md transition-all duration-500 ${
              result.sentiment === "Positive" 
                ? "bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                : "bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
            }`}>
              <h3 className={`font-bold text-xl drop-shadow-md ${result.sentiment === "Positive" ? "text-white" : "text-white"}`}>
                Result: {result.sentiment === "Positive" ? "✅ Positive Review" : "❌ Crisis Alert (Negative)"}
              </h3>
              <p className="mt-2 text-white/90">
                Model's Confidence Score: <strong className="text-white">% {result.confidence}</strong>
              </p>
            </div>
          )}

          {/* YENİ EKLENEN KISIM: GEÇMİŞ LİSTESİ (Glassmorphism Temasına Uygun) */}
          {history.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h2 className="text-lg font-bold text-white/90 mb-4 drop-shadow-md">Recent Analyses</h2>
              {/* Çok fazla yorum birikirse kart uzamasın diye scroll (kaydırma) eklendi */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item, index) => (
                  <div key={index} className="bg-black/20 p-3 rounded-lg border border-white/5 flex justify-between items-center hover:bg-black/30 transition-colors">
                    <p className="text-white/70 truncate max-w-[65%] italic text-sm">"{item.text}"</p>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${
                      item.sentiment === "Positive" 
                        ? "bg-emerald-500/20 text-emerald-300" 
                        : "bg-rose-500/20 text-rose-300"
                    }`}>
                      {item.sentiment === "Positive" ? "✅" : "❌"} {item.sentiment} (%{item.confidence})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}