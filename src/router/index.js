import { useReleaseStore } from "@/stores/release";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () =>
        import("@/zoundr/components/layouts/DashboardLayout.vue"),
      children: [
        {
          path: "/",
          name: "home",
          component: () => import("@/views/HomeViewFlex.vue"),
        },
        {
          path: "/trends",
          name: "trends",
          component: () => import("@/views/Trends.vue"),
        },
        {
          path: "/finanzen",
          name: "finanzen",
          component: () => import("@/views/FinanzenView.vue"),
        },
        {
          path: "auszahlung",
          name: "auszahlung",
          component: () => import("@/components/Finanzen/Auszahlung.vue"),
        },
        {
          path: "finale-msg",
          name: "final",
          component: () => import("@/components/Finanzen/FinaleMsg.vue"),
        },
        {
          path: "neuer-release",
          name: "neuer-release",
          component: () => import("@/views/NeuerRelease.vue"),
        },
        {
          path: "/create-release/:releaseUuid?",
          name: "create-release",
          component: () => import('@/views/UploadPNG.vue'),
          props: (route) => ({
            releaseUuid: route.params.releaseUuid || null,
            currentStep: 1
          })
        },
        {
          // مسار تعديل الأغنية (يجب أن يأتي أولاً لأنه أكثر تحديداً)
          path: "/releases/:releaseUuid/songs/:songUuid/edit",
          name: "edit-song",
          component: () => import('@/views/UploadPNG.vue'),
          props: (route) => ({
            releaseUuid: route.params.releaseUuid,
            songUuid: route.params.songUuid,
            editMode: 'song',
            currentStep: 3
          })
        },
        {
          // مسار تعديل الـ Release (يأتي بعد مسار الأغنية)
          path: "/releases/:releaseUuid/edit",
          name: "edit-release",
          component: () => import('@/views/UploadPNG.vue'),
          props: (route) => ({
            releaseUuid: route.params.releaseUuid,
            editMode: 'release',
            currentStep: 2
          })
        },
        {
          path: '/catalog/:status',
          name: 'CatalogByStatus',
          component: () => import('@/components/Catalog/CatalogStatusView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/catalog',
          name: 'catalog',
          component: () => import('@/components/Catalog/CatalogHome.vue')  
        },
        {
          path: '/releases/:uuid',
          name: 'release-detail',
          component: () => import('@/components/Catalog/ReleaseDetail.vue'), 
          props: true 
        },
        {
          path: "thanks",
          name: "thanks",
          component: () => import("@/components/steps/final.vue"),
        },
      ],
    },
    {
      path: "/payment/success",
      name: "PaymentSuccess",
      component: () => import("@/components/payment/PaymentSuccess.vue"),
      meta: { bypassScreenSize: true },
    },
    {
      path: "/payment/canceled",
      name: "PaymentCanceled",
      component: () => import("@/components/payment/PaymentCanceled.vue"),
      meta: { bypassScreenSize: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const releaseStore = useReleaseStore();
  
  console.log('🔀 Router beforeEach - to.path:', to.path);
  console.log('🔀 Router beforeEach - to.params:', to.params);
  console.log('🔀 Router beforeEach - to.name:', to.name);
  
  // إذا كان هناك songUuid في params (لرابط تعديل الأغنية)
  if (to.params.songUuid) {
    releaseStore.setSongUuid(to.params.songUuid);
    console.log('🔄 Router: تم حفظ songUuid من params:', to.params.songUuid);
  } else {
    // إذا لم يكن هناك songUuid في المسار، قم بمسحه
    releaseStore.clearSongUuid();
  }
  
  // إذا كان هناك releaseUuid في params
  if (to.params.releaseUuid) {
    releaseStore.setCurrentReleaseId(to.params.releaseUuid);
    console.log('🔄 Router: تم حفظ releaseUuid من params:', to.params.releaseUuid);
  }
  
  // للتوافق مع القديم (query string)
  if (to.query.song) {
    releaseStore.setSongUuid(to.query.song);
    console.log('🔄 Router: تم حفظ songUuid من query:', to.query.song);
  }
  
  next();
});

export default router;