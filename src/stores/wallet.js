import { watch } from 'vue';
import { defineStore } from 'pinia';
import apiRequest from '@/lib/apiRequest';
import { useDataStore } from '@/stores/data';
import { ensureCurrentUser } from '@/utils/currentUser';

// مصدر واحد لرصيد المحفظة (GET /wallet/balance).
// كانت كلّ شاشة تجلبه بنفسها بنسخة مختلفة من الشيفرة، فاختلفت النتائج:
// ترميز مزدوج للمعاملات، وقراءة حقول غير user_balance، وقراءة مستخدم من
// localStorage لا يكتبه هذا التطبيق (انظر utils/currentUser.js).

/** الردّ يأتي بأشكال مختلفة حسب النقطة؛ user_balance هو حقل هذه النقطة. */
const extractBalance = (data) => {
  if (data === null || data === undefined) return 0;
  if (typeof data === 'number') return data;

  const candidates = [
    data.user_balance,
    data.balance,
    data.amount,
    data.data?.user_balance,
    data.data?.balance,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const number = typeof candidate === 'string' ? parseFloat(candidate) : candidate;
    if (typeof number === 'number' && !Number.isNaN(number)) return number;
  }

  console.warn('⚠️ Wallet: لم يُعثر على الرصيد في الردّ:', data);
  return 0;
};

// طلب واحد قيد التنفيذ يتشاركه كلّ من يطلب الرصيد في اللحظة نفسها.
let inflight = null;
// مراقب واحد لتغيّر المستخدم (يُنشأ مرّة في init).
let userWatcher = null;

export const useWalletStore = defineStore('wallet', {
  state: () => ({
    balance: 0,
    isLoading: false,
    loaded: false,
    error: null,
  }),

  getters: {
    // 1.234,56 EUR
    formattedBalance: (state) =>
      `${Number(state.balance || 0).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} EUR`,

    hasBalance: (state) => Number(state.balance) > 0,
  },

  actions: {
    /**
     * تهيئة عند إقلاع التطبيق: جلب الرصيد مرّة، ومراقبة تغيّر المستخدم
     * (تسجيل دخول/خروج) لإعادة جلبه. تُستدعى من DashboardLayout.
     */
    async init() {
      if (!userWatcher) {
        const dataStore = useDataStore();
        userWatcher = watch(
          () => dataStore.user,
          (newUser) => {
            if (newUser) this.fetchBalance({ force: true });
            else this.balance = 0;
          },
          { deep: true }
        );
      }
      return this.fetchBalance({ force: true });
    },

    /**
     * جلب الرصيد. النتيجة محفوظة، فالشاشات التالية تعرضها فوراً.
     * force: تجاهل المحفوظ (بعد عملية سحب مثلاً).
     */
    async fetchBalance({ force = false } = {}) {
      if (this.loaded && !force) return this.balance;
      if (inflight) return inflight;

      this.isLoading = true;
      this.error = null;

      inflight = (async () => {
        try {
          const user = await ensureCurrentUser();
          if (!user) {
            console.warn('⚠️ Wallet: لا بيانات مستخدم — تعذّر جلب الرصيد');
            if (!this.loaded) this.balance = 0;
            return this.balance;
          }

          // URLSearchParams يُرمّز القيم مرّة واحدة؛ أيّ encodeURIComponent
          // قبلها يُرمّزها مرّتين فيصل الاسم والبريد مشوّهَين إلى الخادم.
          const params = new URLSearchParams();
          params.append('user_uuid', user.uuid);
          params.append('user_name', user.name);
          params.append('user_email', user.email);

          const response = await apiRequest.get(`/wallet/balance?${params.toString()}`);
          this.balance = extractBalance(response.data);
          this.loaded = true;
          console.log('💰 Wallet: الرصيد', this.balance);
          return this.balance;
        } catch (error) {
          console.error('❌ Wallet: فشل جلب الرصيد:', error);
          this.error = error?.message || 'balance request failed';
          // نُبقي آخر رصيد معروف بدل تصفيره عند فشل تحديث.
          if (!this.loaded) this.balance = 0;
          return this.balance;
        } finally {
          this.isLoading = false;
          inflight = null;
        }
      })();

      return inflight;
    },

    reset() {
      inflight = null;
      this.$reset();
    },
  },
});
