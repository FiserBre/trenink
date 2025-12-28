
import React, { useRef } from 'react';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Cast to File[] to fix the 'unknown' argument error for readAsDataURL
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    const remainingSlots = 4 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    const promises = filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    // Resolve all files first to avoid stale state issues during multiple uploads
    Promise.all(promises).then(newBase64s => {
      onImagesChange([...images, ...newBase64s]);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const triggerUpload = () => {
    if (images.length < 4) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
            <img src={img} alt={`Plan ${idx + 1}`} className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        
        {images.length < 4 && (
          <div 
            onClick={triggerUpload}
            className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all"
          >
            <div className="text-blue-600 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Přidat fotku</span>
            <span className="text-[10px] text-slate-400 mt-0.5">({images.length}/4)</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
        multiple
      />

      {images.length > 0 && !isLoading && (
        <p className="text-sm text-slate-400">Nahraj až 4 obrázky pro analýzu celého cyklu.</p>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 text-blue-600 font-semibold animate-pulse">
          <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Analyzuji {images.length} {images.length === 1 ? 'obrázek' : 'obrázky'} pomocí AI...
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
