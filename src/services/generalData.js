import apiRequest from '@/lib/apiRequest';

class GeneralDataService {
  /**
   * جلب قائمة المتاجر (Stores)
   * @returns {Promise} قائمة المتاجر
   */
  async getStores() {
    try {
      const response = await apiRequest.get('/stores');
      return response.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  }

  /**
   * جلب قائمة الدول (Countries)
   * @returns {Promise} قائمة الدول
   */
  async getCountries() {
    try {
      const response = await apiRequest.get('/countries');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  /**
   * جلب قائمة الأنواع الرئيسية (Genres)
   * @returns {Promise} قائمة الأنواع الرئيسية
   */
  async getGenres() {
    try {
      const response = await apiRequest.get('/genres');
      return response.data;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  /**
   * جلب قائمة الأنواع الفرعية (Subgenres)
   * @returns {Promise} قائمة الأنواع الفرعية
   */
  async getSubgenres() {
    try {
      const response = await apiRequest.get('/subgenres');
      return response.data;
    } catch (error) {
      console.error('Error fetching subgenres:', error);
      throw error;
    }
  }

  /**
   * جلب جميع البيانات العامة مرة واحدة
   * @returns {Promise} كائن يحتوي على جميع البيانات
   */
  async getAllGeneralData() {
    try {
      const [stores, countries, genres, subgenres] = await Promise.all([
        this.getStores(),
        this.getCountries(),
        this.getGenres(),
        this.getSubgenres()
      ]);
      
      return {
        stores,
        countries,
        genres,
        subgenres
      };
    } catch (error) {
      console.error('Error fetching general data:', error);
      throw error;
    }
  }

  /**
   * جلب الأنواع الفرعية بناءً على النوع الرئيسي
   * @param {string} genreId - معرف النوع الرئيسي
   * @returns {Promise} قائمة الأنواع الفرعية
   */
  async getSubgenresByGenre(genreId) {
    try {
      const response = await apiRequest.get(`/genres/${genreId}/subgenres`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subgenres for genre ${genreId}:`, error);
      throw error;
    }
  }
}

// إنشاء instance واحد للاستخدام في جميع أنحاء التطبيق
const generalDataService = new GeneralDataService();

export default generalDataService;