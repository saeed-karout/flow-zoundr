<template>
  <div class="box-stream">
    <div class="p">Rechnungen</div>
    <div class="box-content">
      <div class="top-line">
        <div class="title">
          Deine Rechnungen – Alle an einem Ort.
        </div>

        <div class="subtitle">
          Deine Rechnungen findest Du alle gebündelt in Deinem Profil unter dem Punkt Rechnungen.
        </div>

        <div class="btn-profile" @click="goToProfile">
          <span>Zu deinen Rechnungen</span>
        </div>
      </div>
    </div>
    <div class="Fade"></div>
  </div>
</template>

<script setup>
import { app_code, user_url } from '@/zoundr/constants';
import { noSplashScreen } from '@/zoundr/utils';
import { useRouter } from 'vue-router';

// ========== Router ==========
const router = useRouter();

// ========== Methods ==========
const goToProfile = () => {
  // إغلاق السايدبار إذا كان مفتوحاً (اختياري)
  // يمكنك إضافة emit هنا إذا كان المكون يحتاج إلى إغلاق السايدبار
  
  // الانتقال إلى صفحة البروفايل
  if (app_code === 'user') {
    // استخدام Vue Router للتطبيق الرئيسي
    router.push('/profile');
  } else {
    // استخدام الرابط المباشر للتطبيقات الفرعية
    noSplashScreen();
    window.location.href = user_url + '/profile';
  }
};
</script>

<style lang="scss" scoped>
.box-stream {
  display: flex;
  height: 100%;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--secondary, #26282d);
  position: relative;
}

.box-stream .p {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  align-self: stretch;
}

.Fade {
  width: 100%;
  height: 64px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: linear-gradient(0deg, var(--secondary, #26282d) 30%, rgba(38, 40, 45, 0) 100%);
  z-index: 1;
  border-radius: 0 0 20px 20px;
}

.box-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: -28px;
  flex: 1 0 0;
  align-self: stretch;

  .top-line {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 28px;
    align-self: stretch;

    .title {
      align-self: stretch;
      color: #FFF;
      text-align: center;
      font-family: Heebo;
      font-size: 28px;
      font-style: normal;
      font-weight: 700;
      line-height: .8;
      text-transform: uppercase;
    }

    .subtitle {
      align-self: stretch;
      color: var(--Main-Colors-White, #FFF);
      text-align: center;
      font-family: Heebo;
      font-size: 18px;
      font-style: normal;
      font-weight: 300;
      line-height: .9;
    }

    .btn-profile {
      display: flex;
      min-width: 220px;
      height: 36px;
      padding: 12px 20px 13px 20px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      border-radius: 5px;
      background: var(--Main-Colors-Strawberry, #D15);
      cursor: pointer;
      transition: 0.3s ease;

      &:hover {
        background: var(--dark-red);
      }

      span {
        color: var(--Main-Colors-White, #FFF);
        font-family: Heebo;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: .9;
        text-transform: uppercase;
      }
    }
  }
}

@media (min-width: 1440px) and (max-width: 1599px) {}
</style>