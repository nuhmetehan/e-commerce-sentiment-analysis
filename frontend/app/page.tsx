"use client";

import { useState } from "react";

export default function Home() {
  const [review, setReview] = useState("");
  const [result, setResult] = useState<{ sentiment: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeReview = async () => {
    if (!review) return;
    setLoading(true);
    setResult(null);

    try {
      // FastAPI sunucumuza istek atıyoruz
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: review }),
      });

      const data = await res.json();
      setResult({
        sentiment: data.sentiment,
        confidence: data.confidence_score,
      });
    } catch (error) {
      console.error("API'ye bağlanılamadı:", error);
      alert("Sunucuya bağlanılamadı. FastAPI'nin çalıştığından emin olun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-500 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Müşteri Yorumu Analizi</h1>
        <p className="text-gray-500 mb-6">Yapay zeka modelimiz ile yorumun duygusunu anında tespit edin.</p>

        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 resize-none h-32"
          placeholder="İngilizce müşteri yorumunu buraya yapıştırın... (Örn: The fabric is terrible and it runs very small.)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <button
          onClick={analyzeReview}
          disabled={loading || !review}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300"
        >
          {loading ? "Analiz Ediliyor..." : "Duyguyu Analiz Et"}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border-l-4 ${
            result.sentiment === "Pozitif" 
              ? "bg-green-50 border-green-500 text-green-800" 
              : "bg-red-50 border-red-500 text-red-800"
          }`}>
            <h3 className="font-bold text-lg">
              Sonuç: {result.sentiment === "Pozitif" ? "🟢 Pozitif Yorum" : "🔴 Kriz Alarmı (Negatif)"}
            </h3>
            <p className="mt-1 opacity-90">
              Modelin Güven Skoru (Confidence): <strong>%{result.confidence}</strong>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}