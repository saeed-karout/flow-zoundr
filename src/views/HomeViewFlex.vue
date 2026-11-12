<template>
  <main>
    <!-- عرض Start.vue عندما لا توجد Releases -->
    <Start v-if="showStart === true" />
    
    <!-- عرض المحتوى العادي مع containers فقط عندما يكون هناك Releases -->
    <div v-else-if="showStart === false" class="containers">
      <div class="first-row">
        <div class="hero-section">
          
            <EinnahmenChart />
         
          <div class="row2">
            <StreamsChart />
          </div>
        </div>
        <div class="second-col">
          <div class="box-werk">
            <div class="info">
              <div class="box-title">Aktuelles Guthaben</div>
              <div class="total_money">{{ formattedBalance }}</div>
            </div>
            <router-link to="/auszahlung" class="buttons">
              <span>Auszahlen</span>
            </router-link>
          </div>
          <div class="contact">
            <div class="contact-content">
              <div class="image-contact">
                <img
                  v-if="contactImageUrl"
                  :src="contactImageUrl"
                  alt="Contact Image"
                  class="contact-image"
                  @error="handleImageError"
                />
                <img :src="shadows" alt="Shadow Image" class="shadow-image" />
                <div class="name-user">
                  <div class="name">{{ settings.contact_name || "null" }}</div>
                  <div class="sub-name">{{ settings.contact_title || "null" }}</div>
                </div>
              </div>
              <div class="contact-links">
                <div class="icon" @click="makeCall">
                  <div class="media">
                    <img src="../assets/icons/dashboard/media/phone.png" alt="Phone" />
                  </div>
                
                    <span class="name-media">Telefon</span>
                  
                </div>
                <div class="icon" @click="openWhatsApp">
                  <div class="media">
                    <img src="../assets/icons/dashboard/media/whatsapp.png" alt="Whatsapp" />
                  </div>
                 
                    <span class="name-media">Whatsapp</span>
                 
                </div>
                <div class="icon" @click="openQuestionModal">
                  <div class="media">
                    <img src="../assets/icons/dashboard/media/mail.png" alt="Email" />
                  </div>
                 
                    <span class="name-media">Mail</span>
                  
                </div>
              </div>
              <QuestionModal
                ref="questionModalRef"
                modal-id="emailQuestionModal"
                reference="KONTAKT_FLOW"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="boxes">
        <div class="neueste-release">
          <p>Neueste Releases</p>
          <div class="releases">
            <routerLink class="add" to="/create-release">
             <svg class="plus" xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84" fill="none">
  <path d="M42 0C18.8045 0 0 18.8045 0 42C0 65.1954 18.8045 84 42 84C65.1954 84 84 65.1954 84 42C84 18.8045 65.1954 0 42 0ZM42 78.5591C21.8591 78.5591 5.44091 62.1409 5.44091 42C5.44091 21.8591 21.8591 5.44091 42 5.44091C62.1409 5.44091 78.5591 21.8591 78.5591 42C78.5591 62.1409 62.1409 78.5591 42 78.5591Z" fill="#6A6C6D"/>
  <path d="M63.6682 39.3273H44.8636V20.5227C44.8636 18.9955 43.6227 17.7545 42.0955 17.7545C40.5682 17.7545 39.3273 18.9955 39.3273 20.5227V39.2318H20.5227C18.9955 39.2318 17.7545 40.4727 17.7545 42C17.7545 43.5273 18.9955 44.7682 20.5227 44.7682H39.2318V63.5727C39.2318 65.1 40.4727 66.3409 42 66.3409C43.5273 66.3409 44.7682 65.1 44.7682 63.5727V44.7682H63.4773C65.1 44.7682 66.3409 43.5273 66.4364 42.0955C66.4364 40.5682 65.1954 39.3273 63.6682 39.3273Z" fill="#6A6C6D"/>
</svg>
            </routerLink>

            <div class="favoriten">
              <!-- عرض آخر 10 Releases من API -->
              <div 
                class="music-card" 
                v-for="release in recentReleases" 
                :key="release.uuid"
                @click="goToReleaseDetail(release.uuid)"
              >
                <div 
                  class="image" 
                  :style="{ backgroundImage: release.cover ? `url(${getCoverUrl(release.cover)})` : 'none' }"
                >
                  <div class="text">
                    <div class="sub-text">
                      <span>{{ getArtistName(release) }}</span>
                      <h1>{{ release.title || 'Untitled' }}</h1>
                    </div>
                    <p>{{ formatStreams(release.streams) || '0' }} Streams</p>
                  </div>
                </div>
              </div>
              
              <!-- عرض رسالة عند عدم وجود Releases -->
              <div v-if="recentReleases.length === 0" class="no-releases">
                <p>Keine Releases verfügbar</p>
              </div>
            </div>
          </div>
          <div class="Fade"></div>
          <div class="Fade-left"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
// ذاكرة على مستوى الوحدة (خارج setup فتُشارَك بين كلّ عمليات التركيب).
// العودة إلى اللوحة — بزرّ الرجوع مثلاً — تُعيد تركيب المكوّن من الصفر،
// فنحتفظ بآخر بيانات لعرضها فوراً ثم نحدّثها في الخلفية بلا وميض.
const dashboardCache = {
  loaded: false,
  settings: null,
  releases: [],
};
</script>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import QuestionModal from "@/components/modals/QuestionModal.vue";
import apiRequest from "@/lib/apiRequest";
import { storage_url } from "@/constants";
import shadows from "@/assets/icons/dashboard/user/shadow.png";
import EinnahmenChart from "@/components/Dashboard/EinnahmenChart.vue";
import StreamsChart from "@/components/Dashboard/StreamsChart.vue";

import Start from "@/components/Dashboard/Start.vue"; 
import { useSubscriptionStore } from '@/stores/subscription';
import { useWalletStore } from '@/stores/wallet';
import { dateSortValue } from '@/utils/date';

const subscriptionStore = useSubscriptionStore();
// الرصيد من مخزن المحفظة — مصدر واحد مشترك مع Auszahlung و Guthaben.
const walletStore = useWalletStore();

const router = useRouter();
const questionModalRef = ref(null);
const settings = ref(dashboardCache.settings || {});
const releases = ref(dashboardCache.releases);
const balance = computed(() => walletStore.balance);

// عرض Start أو اللوحة. null = لم نعرف بعد (أثناء أوّل تحميل)، فلا نعرض
// أيّاً منهما حتى تصل البيانات — سابقاً كانت true فتومض شاشة Start أوّلاً.
const showStart = ref(dashboardCache.loaded ? dashboardCache.releases.length === 0 : null);

const contactImageUrl = computed(() => {
  return settings.value.contact_image
    ? `${storage_url}/${settings.value.contact_image}`
    : "../assets/icons/dashboard/user/user.jpg";
});

// تنسيق الرصيد — نفس التنسيق في كلّ الشاشات (getter المخزن).
const formattedBalance = computed(() => walletStore.formattedBalance);

// تنسيق عدد الاستماعات
// الـ API يرجّع artists كمصفوفة (["Nora Blaine"]) ولا يرجّع artist_name إطلاقاً،
// فكان القالب يسقط دائماً إلى النصّ البديل "Artist".
// نفس منطق artistName في ReleaseDetail: يقبل مصفوفة نصوص أو كائنات، أو نصّاً مفرداً.
const getArtistName = (release) => {
  const list = release?.artists;

  if (Array.isArray(list)) {
    const names = list
      .map(a => (typeof a === 'string' ? a : a?.name))
      .filter(a => a && String(a).trim() !== '');
    if (names.length) return names.join(', ');
  }

  if (typeof list === 'string' && list.trim() !== '') return list;

  return release?.artist_name || '—';
};

const formatStreams = (streams) => {
  if (!streams && streams !== 0) return '0';
  return streams.toLocaleString('de-DE');
};

// ========== جلب الـ Releases من API /releases ==========
const fetchReleases = async (silent = false) => {
  try {
    console.log('📡 Fetching releases from /releases');
    
    // جلب جميع الـ Releases (يمكنك تحديد عدد معين)
    const response = await apiRequest.get("/latest-releases");
    console.log('📦 API Response:', response.data);
    
    // معالجة البيانات حسب هيكل الـ Response
    let releasesData = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      releasesData = response.data.data;
    } else if (Array.isArray(response.data)) {
      releasesData = response.data;
    } else {
      console.warn('⚠️ Unexpected data format from /releases:', response.data);
      releasesData = [];
    }
    
    releases.value = releasesData;
    console.log(`✅ Loaded ${releases.value.length} releases`);
    
    // 🔥 التحقق من وجود Releases لتحديد عرض Start أم لا
    if (releases.value.length > 0) {
      showStart.value = false;
      console.log('✅ Releases found, hiding Start and showing containers');
    } else {
      showStart.value = true;
      console.log('❌ No releases found, showing Start');
    }
    
  } catch (error) {
    console.error("❌ Error fetching releases:", error);
    // في التحديث الصامت نُبقي القائمة المعروضة بدل استبدالها بشاشة Start.
    if (silent) return;
    releases.value = [];
    showStart.value = true;
  }
};

// الحصول على آخر 10 Releases (مرتبة حسب تاريخ الإنشاء)
const recentReleases = computed(() => {
  // ترتيب حسب created_at أو release_date
  const sorted = [...releases.value].sort((a, b) =>
    dateSortValue(b.created_at || b.release_date || b.date) -
    dateSortValue(a.created_at || a.release_date || a.date)
  ).slice(0, 10);
  
  console.log(`📋 Recent releases: ${sorted.length} items`);
  return sorted;
});

// الحصول على رابط الصورة
const getCoverUrl = (coverPath) => {
  if (!coverPath) return '';
  if (coverPath.startsWith('http')) return coverPath;
  return `${storage_url}/${coverPath}`;
};

// الانتقال إلى صفحة تفاصيل الـ Release
const goToReleaseDetail = (uuid) => {
  if (uuid) {
    router.push(`/releases/${uuid}`);
  }
};


// إعدادات صفحة الاتصال. لها معالجة خطأ خاصّة بها حتى لا يُفرغ فشلُها
// بقيّةَ اللوحة (الرصيد والإصدارات).
const fetchSettings = async (silent = false) => {
  try {
    const settingsResponse = await apiRequest.get("/settings");
    settings.value = settingsResponse.data || {};
  } catch (error) {
    console.error("❌ Error fetching settings:", error);
    if (silent) return;
    settings.value = {
      contact_name: "null",
      contact_title: "null",
      contact_phone: "+111111111111",
      contact_whatsapp: "+1111111111",
      contact_email: null,
      contact_image: null,
    };
  }
};

// تحميل بيانات اللوحة.
// silent: البيانات معروضة أصلاً من الذاكرة، فنحدّثها في الخلفية دون
//         استبدالها بحالة فارغة إن فشل أحد الطلبات.
const loadDashboard = async (silent = false) => {
  // الطلبات مستقلّة عن بعضها، فتُنفَّذ معاً: أوّل رسم للّوحة كان ينتظرها
  // واحداً تلو الآخر. وكلّ واحد يعالج خطأه بنفسه.
  await Promise.all([
    fetchSettings(silent),
    walletStore.fetchBalance({ force: !silent }),
    fetchReleases(silent),
    subscriptionStore.fetchSubscription()
      .then(() => console.log('✅ Subscription status loaded:', subscriptionStore.isActive ? 'Active' : 'Inactive'))
      // لا نوقف اللوحة إذا فشل جلب الاشتراك
      .catch((subError) => console.warn('⚠️ Could not load subscription:', subError)),
  ]);

  // حفظ آخر حالة معروفة لعرضها فوراً عند العودة إلى اللوحة
  dashboardCache.loaded = true;
  dashboardCache.settings = settings.value;
  dashboardCache.releases = releases.value;

  console.log("🏁 Final state:", {
    showStart: showStart.value,
    releases: releases.value.length,
    balance: balance.value,
    subscriptionActive: subscriptionStore.isActive
  });
};

onMounted(() => {
  // مع وجود بيانات محفوظة تُعرض اللوحة فوراً ثم تُحدَّث في الخلفية.
  loadDashboard(dashboardCache.loaded);
});

// ========== Functions ==========
const makeCall = () => {
  const phone = settings.value.contact_phone;
  if (phone) {
    window.location.href = `tel:${phone}`;
  }
};

const openWhatsApp = () => {
  const whatsapp = settings.value.contact_whatsapp;
  if (whatsapp) {
    window.open(`https://wa.me/${whatsapp}`, "_blank");
  }
};

const openQuestionModal = () => {
  // النافذة ترسل إلى /contact ببيانات المستخدم الحالي، لا إلى settings.contact_email،
  // فاشتراط وجوده كان يجعل النقر بلا أثر كلّما غاب الحقل من ردّ /settings.
  if (!questionModalRef.value) return;
  questionModalRef.value.resetModal();
  questionModalRef.value.openModal();
};

const handleImageError = () => {
  console.log("Image error");
};
</script>

<style lang="scss" scoped>
/* جميع الأنماط كما هي - لم تتغير */
.monthlyData,
.dailyData {
  width: 100%;
  height: 100%;
  position: relative;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Heebo", sans-serif;
}

:root {
  --move: #D15;
}

main {
  display: flex;
  justify-content: center;
  height: calc(100vh - 71px - 50px);
  position: relative;
  overflow: hidden;
}

.containers {
  display: flex;
  flex-direction: column;
  /* تملأ ارتفاع main بالضبط، فيتوزّع المتاح على الصفوف بدل أن يفيض المحتوى.
     overflow باقٍ للشاشات القصيرة (أقل من ~850px) حيث يبلغ كلّ عنصر حدّه الأدنى. */
  height: 100%;
  width: 100%;
  max-width: 2560px;
  margin: 0 auto;
  gap: 20px;
  align-items: flex-start;
  overflow:auto;
  scrollbar-width:none;
}

.first-row {
  display: flex;
  align-items: stretch;
  gap: 20px;
  align-self: stretch;
  width: 100%;
  flex: 1 1 auto;
  /* بدونها يمنع min-height الضمنيّ (auto) الصفَّ من التقلّص إلى المساحة
     المتاحة، فيتجاوز المحتوى ارتفاع الصفحة ويظهر شريط تمرير. */
  min-height: 447px;
}

.hero-section {
  /* ارتفاع المخططين معرّف هنا فقط ويُورَث إلى EinnahmenChart و StreamsChart،
     فلا يمكن أن يختلفا أبداً. القيم لكلّ مدى في آخر الملفّ. */
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
  min-height: 213.5px;
}

.row1 p,
.row2 p {
  align-self: stretch;
  color: #fff;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.row2 {
  display: flex;
  /* --chart-h سقف لا إلزام: يُبلَغ عند وجود متّسع، ويتقلّص عند ضيق الارتفاع. */
  // height: var(--chart-h, 300px);
  // max-height: var(--chart-h, 300px);
  flex: 1;
  min-height: 213.5px;
  padding: 20px 30px 12px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  position: relative;
}

.number {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -45%);
  color: var(--Main-Colors-Dove, #6a6c6d);
  font-family: Heebo;
  font-size: 180px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 9px;
  text-transform: uppercase;
  z-index: 10;
  opacity: 0.1;
}

.second-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  height: 100%;
  min-height: 0;
  min-width: 0;
}

.boxes {
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  position: relative;
}

.boxes .neueste-release p {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.neueste-release {
  display: flex;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--Main-Colors-Slate, #26282d);
  position: relative;
  width: 100%;
}

.Fade {
  width: 80px;
  height: 100%;
  transform: rotate(180deg);
  position: absolute;
  right: 0px;
  top: 0px;
  background: linear-gradient(
    90deg,
    var(--Main-Colors-Slate, #26282d) 30%,
    rgba(38, 40, 45, 0) 100%
  );
  border-radius: 20px 20px 20px 20px;
}

.Fade-left {
  width: 80px;
  height: 100%;
  transform: rotate(0deg);
  position: absolute;
  left: 220px;
  top: 0px;
  background: linear-gradient(
    90deg,
    var(--Main-Colors-Slate, #26282d) 30%,
    rgba(38, 40, 45, 0) 100%
  );
  border-radius: 20px 20px 20px 20px;
}

.releases {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  position: relative;
}

.add {
  display: flex;
  width: 207px;
  height: 207px;
  padding: 16px;
  justify-content: center;
  align-items: center;
  gap: 12px;
  border-radius: 20px;
  background: linear-gradient(
      0deg,
      var(--primary) 0%,
      var(--Main-Colors-Slate-Dark, #1b1c20) 100%
    ),
    var(--Main-Colors-Slate-Dark, #1b1c20);
  cursor: pointer;
  left: 0;
  z-index: 10;
}

/* .plus هو الـ svg نفسه لا حاويةً له، واللون على <path> يسبق الوراثة من الـ svg
   — لذا يستهدف اللون المسارات مباشرةً. */
svg.plus {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
}

svg.plus path {
  fill: var(--Main-Colors-Dove, #6a6c6d);
  transition: fill 0.3s ease;
}

.add:hover svg.plus path {
  fill: var(--Strawberry, #DD1155);
}

.favoriten {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1 0 0;
  overflow-x: auto;
  padding-right: 80px;
  scrollbar-width: none;
  scrollbar-color: #6a6c6d #26282d;
  border-radius: 20px;
}

.favoriten::-webkit-scrollbar {
  height: 8px;
}

.favoriten::-webkit-scrollbar-track {
  background: #26282d;
}

.favoriten::-webkit-scrollbar-thumb {
  background: #6a6c6d;
  border-radius: 4px;
}

.favoriten::-webkit-scrollbar-thumb:hover {
  background: #d15;
}

.music-card {
  display: flex;
  width: 207px;
  height: 207px;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  background: var(--primary) 50% / cover no-repeat;
  flex-shrink: 0;
  filter: saturate(.4);
  cursor: pointer;
  transition: filter 0.3s ease;

  &:hover {
    filter: saturate(.8);
  }
}

.music-card .image {
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 12px;
  max-width:207px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background: url("../assets/icons/dashboard/user/shadows.png") 50% / cover no-repeat,
    rgba(0, 0, 0, 0.4);
  background-blend-mode: normal, saturation;
  cursor: pointer;
  transition: 0.3s ease;
  background-size: cover;
  background-position: center;
}

.music-card .image:hover {
  background: url("../assets/icons/dashboard/user/shadows.png") 50% / cover no-repeat;
}

.music-card .image:hover .sub-text h1,
.music-card .image:hover .sub-text span,
.music-card .image:hover .text p {
  opacity: 1;
}

.music-card .text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
}

.sub-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.music-card .sub-text span {
  /* نفس معالجة النصّ في ArtistsTab: سطر واحد مع ...
     nowrap أوثق من -webkit-line-clamp الذي لا يقصّ دون overflow: hidden.
     ولأن line-height أصغر من 1 يفيض المحرف خارج صندوق المحتوى،
     نوسّع صندوق القصّ بـ padding ونلغي أثره بـ margin سالب مساوٍ —
     فلا تُقصّ أعلى الحروف ولا تتغيّر المسافات بين الأسطر. */
  display: block;
  align-self: stretch;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-block: 6px;
  margin-block: -6px;
  color: var(--Main-Colors-White, #fff);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.music-card .sub-text h1 {
  /* نفس معالجة النصّ في ArtistsTab: سطر واحد مع ...
     nowrap أوثق من -webkit-line-clamp الذي لا يقصّ دون overflow: hidden.
     ولأن line-height أصغر من 1 يفيض المحرف خارج صندوق المحتوى،
     نوسّع صندوق القصّ بـ padding ونلغي أثره بـ margin سالب مساوٍ —
     فلا تُقصّ أعلى الحروف ولا تتغيّر المسافات بين الأسطر. */
  display: block;
  align-self: stretch;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-block: 6px;
  margin-block: -6px;
  color: var(--Main-Colors-White, #fff);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  text-transform: uppercase;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.music-card .text p {
  /* نفس معالجة النصّ في ArtistsTab: سطر واحد مع ...
     nowrap أوثق من -webkit-line-clamp الذي لا يقصّ دون overflow: hidden.
     ولأن line-height أصغر من 1 يفيض المحرف خارج صندوق المحتوى،
     نوسّع صندوق القصّ بـ padding ونلغي أثره بـ margin سالب مساوٍ —
     فلا تُقصّ أعلى الحروف ولا تتغيّر المسافات بين الأسطر. */
  display: block;
  align-self: stretch;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-block: 6px;
  margin-block: -6px;
  color: var(--Main-Colors-White, #fff);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1; /* نفس ArtistsTab (كانت 0.8) */
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.no-releases {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 207px;
  height: 207px;
  background: var(--primary);
  border-radius: 20px;
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 14px;
  text-align: center;
  padding: 20px;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.box-werk {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex: 1;
  align-self: stretch;
  border-radius: 20px;
  background: linear-gradient(54deg, #26282d 0%, #de1456 100%);
  padding: 20px;

  /* الارتفاع يتدرّج مع عرض الصفحة بدل قيمة ثابتة لكلّ مدى: مستقيم يمرّ
     بنقطتي التصميم (124px عند 1440 و250px عند 2074) — والمدى الأعلى في
     استعلام 2075 فيلتقي الخطّان عند 250px بلا قفزة.
     و45vh سقف أمان كيلا يدفع الصندوق الصفحة على شاشة قصيرة. */
  // min-height: min(clamp(124px, calc(19.874vw - 162.2px), 250px), 45vh);
}

.box-werk .box-title {
  display: flex;
  width: 300px;
  max-width: 300px;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .73;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.box-werk .total_money {
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 38px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  letter-spacing: 1.9px;
  text-transform: uppercase;
}

.contact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  align-self: stretch;
  /* نسبة التصميم نفسها (عرض 290 × ارتفاع 315): الارتفاع يتبع العرض بدل أن
     يملأ كلّ ما تبقّى، فلا تتمدّد الصورة بلا حدّ.
     0 1 auto: يأخذ مقاس النسبة عند وجود متّسع، ويتقلّص عند ضيق الارتفاع بدل
     أن يتجاوز الصندوق ويتداخل مع صفّ الإصدارات تحته. */
  flex: 0 1 auto;
  aspect-ratio: 290 / 315;
  min-height: 0;
  overflow: hidden;
}

.contact-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  align-self: stretch;
  flex: 1;
  min-height: 0;
}

.loading,
.error {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  text-align: center;
  padding: 20px;
  width: 100%;
}

.error {
  color: #ff3333;
}

.box-werk .buttons {
  display: flex;
  height: 36px;
  padding: 17px 20px 18px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: #d15;
  transition: background 0.3s ease-in-out;
  text-decoration: none;
}

.box-werk .buttons:hover {
  background: var(--dark-red);
}

.box-werk .buttons span {
  color: var(--Main-Colors-White, #fff);
  font-family: "Heebo";
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.image-contact {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 22px;
  align-self: stretch;
  flex: 1;
  min-height: 0;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.contact-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.shadow-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
}

.image-contact .name-user {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
  z-index: 3;
}

.image-contact .name-user .name {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.image-contact .name-user .sub-name {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

.contact-links {
  display: flex;
  padding: 20px;
  justify-content: center;
  align-items: flex-start;
  gap: 50px;
  align-self: stretch;
  border-radius: 0 0 20px 20px;
  background: #26282d;
}

.contact-links .icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 70.08px;
}

.contact-links .icon:hover {
  cursor: pointer;
}

.contact-links .icon .media {
  display: flex;
  width: 45px;
  height: 45px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  border-radius: 30px;
  background: #3a3e42;
}

.contact-links .icon .media:hover {
  background: #d15;
  transition: background 0.3s ease;
}

.contact-links .icon .name-media {
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: .8;
  height: 13px;
}

/* Responsive */
@media (min-width: 1440px) and (max-width: 1599px) {
  .box-werk .total_money{
    font-size: 28px;
    letter-spacing: 1.4px;
  }
  .add, .music-card, .no-releases {
    width: 160px;
    height: 160px;
  }
  .Fade-left { 
    left: 180px; 
    height: 180px;
    top: 40px;
  }
  
 

  .second-col {
    width: clamp(260px, 19vw, 300px);
  }

  .contact-links {
    padding: 12px;
    gap: 12px;
    justify-content: space-between;
  }
}

@media (min-width: 1600px) {
  .first-row {
    /* 1 1 auto لا 1 0 0: الصفّ يتقلّص عند نقص الارتفاع بدل أن يدفع الصفحة. */
    flex: 1 1 auto;
    height: auto;
  }
  .second-col {
    width: clamp(300px, 23vw, 530px);
  }


 
}

/* المدى الأعلى من مستقيم .box-werk: من (2074, 250px) إلى (2560, 433px). */
@media (min-width: 2075px) {
  // .box-werk {
  //   min-height: min(clamp(250px, calc(37.654vw - 530.9px), 433px), 45vh);
  // }

}
@media (min-width: 1600px) and (max-width: 2560px) {
  .containers {
    min-width: 1220px;
    max-width: 2560px;
  }

  .first-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex: 1 1 auto;
    
    align-self: stretch;
    height: auto;
  }

  .second-col,
  .boxes .card {
    width: clamp(290px, 22vw, 530px);
  }

 
}





</style>