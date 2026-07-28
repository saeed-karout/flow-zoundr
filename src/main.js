import '@/assets/main.scss'
import App from '@/App.vue'
import router from '@/router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useDataStore } from '@/stores/data';
import { useZoundrStore } from '@/zoundr/stores/zoundr';
import { useSubscriptionStore } from '@/stores/subscription';
import { keycloak_init } from '@/zoundr/keycloak'
import Vue3CircleProgress from 'vue3-circle-progress';
import 'vue3-circle-progress/dist/circle-progress.css';

keycloak_init(() => {
    const app = createApp(App)

    const pinia = createPinia()
    app.use(pinia)
    app.use(router)
    app.component('CircleProgress', Vue3CircleProgress);

    app.mount('#app')

}, () => {
    const dataStore = useDataStore();
    const zoundrStore = useZoundrStore();
    const subscriptionStore = useSubscriptionStore();

    // جلب بيانات المستخدم
    dataStore.loadUser();
    
    // جلب المنتجات
    zoundrStore.loadProducts();
    
    // 🔥 جلب حالة الاشتراك
    subscriptionStore.fetchSubscription().catch((error) => {
        console.warn('⚠️ Could not load subscription:', error);
    });
    
  
});