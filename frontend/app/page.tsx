// cd frontend (frontend dizinine geçmek için terminal komutu)
// npm run dev (frontend'i çalıştırmak için terminal komutu)

"use client"; //client component

import { useState } from "react";

export default function Home() {
  const [review, setReview] = useState(""); // review yorum metni
  const [result, setResult] = useState<{ sentiment: string; confidence: number } | null>(null); // API'den dönen sonuç
  const [loading, setLoading] = useState(false); // API çağrısı sırasında yükleniyor durumunu göstermek için

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
      setResult({ // sonucu state'ine API'den dönen veriyi kaydet
        sentiment: data.sentiment,
        confidence: data.confidence_score,
      });
    } catch (error) { // hata durumunda konsola yazdır ve kullanıcıya uyarı göster
      console.error("API'ye bağlanılamadı:", error);
      alert("Sunucuya bağlanılamadı. FastAPI'nin çalıştığından emin olun.");
    } finally { // API çağrısı tamamlandığında yükleniyor durumunu kapat. hata olsa da olmasa da çalışır
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen dark:bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full fade-in"> 
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Review Sentiment Analysis</h1>
        <p className="text-gray-500 mb-6">Analyze the sentiment of customer reviews using AI model.</p>

        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 resize-none h-32"
          placeholder="Enter your customer review in English... (e.g., The fabric is terrible and it runs very small.)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <button
          onClick={analyzeReview}
          disabled={loading || !review}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300"
        >
          {loading ? "Analyzing Sentiment..." : "Analyze Sentiment"}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${
            result.sentiment === "Pozitive" 
              ? "bg-green-50 border-green-500 text-green-800" 
              : "bg-red-50 border-red-500 text-red-800"
          }`}>
            <h3 className="font-bold text-lg">
              Result: {result.sentiment === "Positive" ? "🟢 Positive Review" : "🔴 Crisis Alert (Negative)"}
            </h3>
            <p className="mt-1 opacity-90">
              Model's Confidence Score: <strong>%{result.confidence}</strong>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}