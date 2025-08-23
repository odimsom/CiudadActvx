import React, { useCallback, useState } from 'react';
import { Upload, X, Image, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocalImageStorage } from '../hooks/useLocalImageStorage';

interface LocalImageUploaderProps {
  onImagesChange: (imageKeys: string[]) => void;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
}

export const LocalImageUploader: React.FC<LocalImageUploaderProps> = ({
  onImagesChange,
  maxImages = 3,
  className = '',
  disabled = false
}) => {
  const [uploadedImages, setUploadedImages] = useState<Array<{key: string, url: string, size: number}>>([]);
  const [dragActive, setDragActive] = useState(false);

  const {
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    getStorageInfo
  } = useLocalImageStorage();

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - uploadedImages.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    try {
      let results;
      if (filesToUpload.length === 1) {
        const result = await uploadImage(filesToUpload[0]);
        results = [result];
      } else {
        results = await uploadMultipleImages(filesToUpload);
      }

      const newImages = results.map(result => ({
        key: result.key,
        url: result.url,
        size: result.size
      }));

      const updatedImages = [...uploadedImages, ...newImages];
      setUploadedImages(updatedImages);
      onImagesChange(updatedImages.map(img => img.key));

    } catch (err) {
      console.error('Error al subir imágenes:', err);
    }
  }, [uploadedImages, maxImages, uploadImage, uploadMultipleImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((key: string) => {
    deleteImage(key);
    const updatedImages = uploadedImages.filter(img => img.key !== key);
    setUploadedImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.key));
  }, [uploadedImages, deleteImage, onImagesChange]);

  const storageInfo = getStorageInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zona de carga */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${uploadedImages.length >= maxImages ? 'opacity-50' : ''}
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          disabled={disabled || uploadedImages.length >= maxImages}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-3">
          <Upload className={`w-12 h-12 mx-auto ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {dragActive ? 'Suelta las imágenes aquí' : 'Subir fotografías'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Arrastra y suelta o haz clic para seleccionar ({uploadedImages.length}/{maxImages})
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Formatos: JPG, PNG, WEBP • Máximo 5MB por imagen
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-blue-600">Subiendo... {uploadProgress}%</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Imágenes subidas */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Fotografías añadidas ({uploadedImages.length})
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedImages.map((image) => (
              <div key={image.key} className="relative group">
                <img
                  src={image.url}
                  alt="Imagen subida"
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                
                <button
                  type="button"
                  onClick={() => removeImage(image.key)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>

                <div className="absolute bottom-1 left-1 bg-white/90 text-gray-700 text-xs px-1.5 py-0.5 rounded shadow-sm">
                  {(image.size / 1024).toFixed(1)}KB
                </div>

                <div className="absolute top-1 left-1 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información de almacenamiento */}
      {storageInfo.imageCount > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p>📱 Almacenamiento local: {storageInfo.imageCount} imágenes • {storageInfo.totalSizeMB}MB usados</p>
          <p>💡 Las imágenes se guardan en tu dispositivo y se eliminan automáticamente después de 7 días</p>
        </div>
      )}
    </div>
  );
};
