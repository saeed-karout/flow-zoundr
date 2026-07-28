// services/validationService.js
import apiRequest from '@/lib/apiRequest';

export const validationService = {
  // التحقق من ISRC
  async checkIsrc(isrc, releaseUuid, songUuid = null) {
    try {
      // تنظيف الـ ISRC
      const cleanIsrc = isrc.replace(/-/g, '').toUpperCase();
      
      const params = new URLSearchParams({
        isrc: cleanIsrc,
        release_uuid: releaseUuid
      });
      
      if (songUuid) {
        params.append('song_uuid', songUuid);
      }
      
      console.log('🔍 Checking ISRC:', cleanIsrc, 'for release:', releaseUuid);
      
      const response = await apiRequest.get(`/validation/check-isrc?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error checking ISRC:', error);
      // إذا كان الخطأ 404 أو 422، نعتبر أن الـ ISRC غير موجود
      if (error.response?.status === 404 || error.response?.status === 422) {
        return { exists: false };
      }
      return { exists: false, error: error.message };
    }
  }
};