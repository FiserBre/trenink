
import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import { analyzeTrainingImages } from './services/geminiService';
import { AnalysisResult as AnalysisResultType } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    if (images.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Use the plural version of analyzeTrainingImages
      const data = await analyzeTrainingImages(images);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Nepodařilo se analyzovat obrázky. Zkus to prosím znovu. Případně se vrať později.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            <span className="text-blue-800">Treninkový</span> <span className="text-yellow-400">denik</span> <span className="text-red-600">cheat</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Nahraj tréninkový plán a nech si spocitat data do treninkoveho deniku {":D"}.
          </p>
        </header>

        <main className="space-y-8">
          <section>
            <ImageUploader 
              images={images} 
              onImagesChange={setImages} 
              isLoading={isLoading} 
            />
            
            {images.length > 0 && !result && !isLoading && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  Spustit vypocet deniku
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-medium">
                {error}
              </div>
            )}
          </section>

          {result && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <AnalysisResult data={result} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
