<script>
import { RouterView } from 'vue-router';
import ErrorScreen from '@/components/ScreenSize.vue';

export default {
  components: { RouterView, ErrorScreen },
  data() {
    return {
      screenWidth: window.innerWidth,
      routerReady: false,
      tooltipObserver: null,
    };
  },
  computed: {
    // قائمة صفحات الدفع التي لا نريد إظهار ErrorScreen فيها
    isPaymentRoute() {
      const routeName = this.$route?.name;
      // أضف أسماء المسارات الخاصة بصفحات الدفع هنا
      const paymentRoutes = ['PaymentSuccess', 'PaymentCanceled', 'payment-success', 'payment-canceled'];
      return paymentRoutes.includes(routeName);
    },

    // التحقق مما إذا كانت النافذة الحالية هي نافذة منبثقة للدفع
    isPaymentPopup() {
      const isFromOpener = !!window.opener;
      const isPaypalPopup = window.name === 'paypal_payment_popup';
      
      // يمكنك أيضاً التحقق من وجود query parameters محددة
      const hasPaymentQuery = this.$route?.query?.token || this.$route?.query?.paymentId;
      
      return isFromOpener && (isPaypalPopup || hasPaymentQuery);
    },

    // تحديد ما إذا كان يجب إظهار شاشة الخطأ
    showErrorScreen() {
      // لا تظهر شاشة الخطأ إذا:
      // 1. عرض الشاشة أكبر من أو يساوي 1440
      // 2. لم يكتمل تحميل الـ router بعد
      // 3. المسار الحالي هو صفحة دفع
      // 4. النافذة الحالية هي نافذة منبثقة للدفع
      
      const shouldShow = this.screenWidth < 1440 && 
                         this.routerReady && 
                         !this.isPaymentRoute && 
                         !this.isPaymentPopup;
      
      console.log('Screen width:', this.screenWidth);
      console.log('Router ready:', this.routerReady);
      console.log('Is payment route:', this.isPaymentRoute);
      console.log('Is payment popup:', this.isPaymentPopup);
      console.log('Show error screen:', shouldShow);
      
      return shouldShow;
    },
  },
  watch: {
    $route(to) {
      console.log('Route changed to:', to.name, to.path);
      if (to.hash?.includes('session_state')) {
        this.$router.replace({
          name: to.name,
          params: to.params,
          query: to.query,
        });
      }
    },
  },
  mounted() {
    // إضافة مستمع لتغيير حجم النافذة
    window.addEventListener('resize', this.handleResize);
    this.disableTooltipsGlobally();
    this.startTooltipObserver();
    
    // تسجيل معلومات التوجيه الأولية
    console.log('Initial route:', this.$route?.name, this.$route?.path);
    console.log('Is payment popup:', this.isPaymentPopup);
    
    // انتظار اكتمال تحميل router
    this.$router.isReady().then(() => {
      this.routerReady = true;
      console.log('Router is ready');
    });
  },
  beforeUnmount() {
    // تنظيف مستمع الحدث
    window.removeEventListener('resize', this.handleResize);
    this.stopTooltipObserver();
  },
  methods: {
    disableTooltipsGlobally() {
      this.removeTooltipAttributes();
      this.removeTooltipElements();
    },
    removeTooltipAttributes() {
      document.querySelectorAll('[title]').forEach((el) => {
        el.removeAttribute('title');
      });
      document.querySelectorAll('[data-tooltip], [data-tip], [data-balloon], [data-balloon-pos]').forEach((el) => {
        el.removeAttribute('data-tooltip');
        el.removeAttribute('data-tip');
        el.removeAttribute('data-balloon');
        el.removeAttribute('data-balloon-pos');
      });
    },
    removeTooltipElements() {
      const selectors = [
        '[role="tooltip"]',
        '.tooltip',
        '.v-tooltip',
        '.v-popper',
        '.v-popper__popper',
        '.v-popper--theme-tooltip',
        '.tippy-box',
        '.tippy-content',
        '.tippy-popper',
        '.el-tooltip__popper',
        '.p-tooltip',
        '.prime-tooltip'
      ];

      document.querySelectorAll(selectors.join(',')).forEach((el) => {
        el.remove();
      });
    },
    startTooltipObserver() {
      try {
        this.tooltipObserver = new MutationObserver(() => {
          this.disableTooltipsGlobally();
        });
        this.tooltipObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['title', 'data-tooltip', 'data-tip', 'data-balloon', 'data-balloon-pos', 'role', 'class']
        });
      } catch (e) {
        console.warn('⚠️ Could not start tooltip observer:', e);
      }
    },
    stopTooltipObserver() {
      if (!this.tooltipObserver) return;
      try {
        this.tooltipObserver.disconnect();
      } catch (e) {
        console.warn('⚠️ Could not stop tooltip observer:', e);
      } finally {
        this.tooltipObserver = null;
      }
    },
    handleResize() {
      this.screenWidth = window.innerWidth;
      console.log('Screen width updated:', this.screenWidth);
    },
  },
};
</script>

<template>
  <div>
    <ErrorScreen v-if="showErrorScreen" />
    <RouterView v-else />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>