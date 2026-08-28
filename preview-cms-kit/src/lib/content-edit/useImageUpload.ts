'use client';

import { useCallback, useState } from 'react';
import { z } from 'zod';
import { cmsConfig } from '../../config/cms.config';
import { normalizeStoredImageUrl } from '../uploads';

const UploadResponseSchema = z.object({ url: z.string() });

/** Sube una imagen al CMS y devuelve la URL relativa. */
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(cmsConfig.uploadPath, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('UPLOAD_FAILED');
      }
      const data = UploadResponseSchema.parse(await res.json());
      return normalizeStoredImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploadImage, uploading };
}
