import { useState, useCallback } from "react";

interface ImageStorageResult {
  url: string;
  key: string;
  size: number;
}

export const useLocalImageStorage = () => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para comprimir imagen
  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        // Calcular dimensiones manteniendo aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convertir a blob comprimido
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(new Blob());
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Función para convertir blob a base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Función principal para subir imagen
  const uploadImage = useCallback(
    async (file: File): Promise<ImageStorageResult> => {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Validar tipo de archivo
        if (!file.type.startsWith("image/")) {
          throw new Error("El archivo debe ser una imagen");
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("La imagen es demasiado grande. Máximo 5MB.");
        }

        setUploadProgress(20);

        // Comprimir imagen
        const compressedBlob = await compressImage(file);
        if (!compressedBlob) {
          throw new Error("Error al comprimir la imagen");
        }

        setUploadProgress(50);

        // Convertir a base64
        const base64 = await blobToBase64(compressedBlob);

        setUploadProgress(70);

        // Generar clave única
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);
        const key = `incident_image_${timestamp}_${randomId}`;

        setUploadProgress(90);

        // Guardar en localStorage
        const imageData = {
          base64,
          originalName: file.name,
          size: compressedBlob.size,
          type: compressedBlob.type,
          uploadedAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem(key, JSON.stringify(imageData));
        } catch (storageError) {
          // Si localStorage está lleno, intentar limpiar imágenes antiguas
          cleanOldImages();
          localStorage.setItem(key, JSON.stringify(imageData));
        }

        setUploadProgress(100);

        const result: ImageStorageResult = {
          url: base64,
          key,
          size: compressedBlob.size,
        };

        console.log(
          "✅ Imagen guardada localmente:",
          key,
          `${(compressedBlob.size / 1024).toFixed(1)}KB`
        );

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error desconocido al procesar la imagen";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    []
  );

  // Función para recuperar imagen del localStorage
  const getImage = useCallback((key: string): string | null => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const imageData = JSON.parse(data);
      return imageData.base64;
    } catch (err) {
      console.error("Error al recuperar imagen:", err);
      return null;
    }
  }, []);

  // Función para eliminar imagen
  const deleteImage = useCallback((key: string): boolean => {
    try {
      localStorage.removeItem(key);
      console.log("🗑️ Imagen eliminada:", key);
      return true;
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      return false;
    }
  }, []);

  // Función para limpiar imágenes antiguas (más de 7 días)
  const cleanOldImages = useCallback(() => {
    const keys = Object.keys(localStorage);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let cleaned = 0;

    keys.forEach((key) => {
      if (key.startsWith("incident_image_")) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const imageData = JSON.parse(data);
            const uploadDate = new Date(imageData.uploadedAt).getTime();

            if (uploadDate < sevenDaysAgo) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (err) {
          // Si hay error al parsear, eliminar la entrada corrupta
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.log(
        `🧹 Limpieza completada: ${cleaned} imágenes antiguas eliminadas`
      );
    }
  }, []);

  // Función para obtener información de almacenamiento
  const getStorageInfo = useCallback(() => {
    const keys = Object.keys(localStorage);
    const imageKeys = keys.filter((key) => key.startsWith("incident_image_"));
    let totalSize = 0;

    imageKeys.forEach((key) => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const imageData = JSON.parse(data);
          totalSize += imageData.size || 0;
        }
      } catch (err) {
        // Ignorar entradas corruptas
      }
    });

    return {
      imageCount: imageKeys.length,
      totalSizeKB: Math.round(totalSize / 1024),
      totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
      localStorageUsageKB: Math.round(
        JSON.stringify(localStorage).length / 1024
      ),
    };
  }, []);

  // Función para subir múltiples imágenes
  const uploadMultipleImages = useCallback(
    async (files: File[]): Promise<ImageStorageResult[]> => {
      const results: ImageStorageResult[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const result = await uploadImage(files[i]);
          results.push(result);
        } catch (err) {
          console.error(`Error al subir imagen ${i + 1}:`, err);
          // Continuar con las siguientes imágenes
        }
      }

      return results;
    },
    [uploadImage]
  );

  return {
    // Estados
    isUploading,
    uploadProgress,
    error,

    // Funciones principales
    uploadImage,
    uploadMultipleImages,
    getImage,
    deleteImage,

    // Funciones de utilidad
    cleanOldImages,
    getStorageInfo,
  };
};
