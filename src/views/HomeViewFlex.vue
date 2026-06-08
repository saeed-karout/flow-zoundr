<template>
  <main>
    <!-- عرض Start.vue عندما لا توجد Releases -->
    <Start v-if="showStart" />
    
    <!-- عرض المحتوى العادي مع containers فقط عندما يكون هناك Releases -->
    <div v-else class="containers">
      <div class="first-row">
        <div class="hero-section">
          <div class="row1">
            <EinnahmenChart />
          </div>
          <div class="row2">
            <EinnahmenChart />
          </div>
        </div>
        <div class="second-col">
          <div class="box-werk">
            <div class="info">
              <div class="box-title">Aktuelles Guthaben</div>
              <div class="total_money">2.761,66 EUR</div>
            </div>
            <router-link to="/catalog" class="buttons">
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
                  <div class="name-media">
                    <span>Telefon</span>
                  </div>
                </div>
                <div class="icon" @click="openWhatsApp">
                  <div class="media">
                    <img src="../assets/icons/dashboard/media/whatsapp.png" alt="Whatsapp" />
                  </div>
                  <div class="name-media">
                    <span>Whatsapp</span>
                  </div>
                </div>
                <div class="icon" @click="openQuestionModal">
                  <div class="media">
                    <img src="../assets/icons/dashboard/media/mail.png" alt="Email" />
                  </div>
                  <div class="name-media">
                    <span>Mail</span>
                  </div>
                </div>
              </div>
              <QuestionModal
                ref="questionModalRef"
                modal-id="emailQuestionModal"
                reference="KONTAKT_RIGHTS"
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
              <div class="plus">
                <img src="../assets/icons/dashboard/plus.svg" alt="plus icon" />
              </div>
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
                      <span>{{ release.artist_name || 'Artist' }}</span>
                      <h1>{{ release.title || 'Untitled' }}</h1>
                    </div>
                    <p>5.240 Streams</p>
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

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import QuestionModal from "@/components/modals/QuestionModal.vue";
import apiRequest from "@/lib/apiRequest";
import { storage_url } from "@/constants";
import shadows from "@/assets/icons/dashboard/user/shadow.png";
import EinnahmenChart from "@/components/Dashboard/EinnahmenChart.vue";
import Start from "@/components/Dashboard/Start.vue"; 

const router = useRouter();
const questionModalRef = ref(null);
const settings = ref({});
const releases = ref([]);
const isLoading = ref(true); // متغير للتأكد من اكتمال التحميل

// متغير للتحكم بعرض Start - سيتم تحديثه بناءً على وجود Releases
const showStart = ref(true); 

const contactImageUrl = computed(() => {
  return settings.value.contact_image
    ? `${storage_url}/${settings.value.contact_image}`
    : "../assets/icons/dashboard/user/user.jpg";
});

// جلب آخر 10 Releases
const fetchReleases = async () => {
  try {
    const response = await apiRequest.get("/releases?per_page=10");
    releases.value = response.data.data || [];
    console.log("📦 Releases fetched:", releases.value);
    console.log("📊 Number of releases:", releases.value.length);
    
    // تحديث showStart بناءً على وجود Releases
    // إذا كان هناك Releases، نخفي Start ونظهر containers
    if (releases.value.length > 0) {
      showStart.value = false;
      console.log("✅ Releases found, hiding Start and showing containers");
    } else {
      showStart.value = true;
      console.log("❌ No releases found, showing Start");
    }
    
  } catch (error) {
    console.error("❌ Error fetching releases:", error);
    releases.value = [];
    showStart.value = true; // في حالة الخطأ، نظهر Start
  }
};

// الحصول على آخر 10 Releases (مرتبة حسب تاريخ الإنشاء)
const recentReleases = computed(() => {
  const sorted = [...releases.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
  console.log("📋 Recent releases:", sorted.length);
  return sorted;
});

// الحصول على رابط الصورة
const getCoverUrl = (coverPath) => {
  if (!coverPath) return '';
  return coverPath.startsWith('http') 
    ? coverPath 
    : `${storage_url}/${coverPath}`;
};

// الانتقال إلى صفحة تفاصيل الـ Release
const goToReleaseDetail = (uuid) => {
  router.push(`/releases/${uuid}`);
};

onMounted(async () => {
  isLoading.value = true;
  
  try {
    // جلب الإعدادات
    const settingsResponse = await apiRequest.get("/settings");
    settings.value = settingsResponse.data || {};
    
    // جلب الـ Releases - هذه الدالة ستقوم بتحديث showStart تلقائياً
    await fetchReleases();
    
  } catch (error) {
    console.error("Error fetching data:", error);
    settings.value = {
      contact_name: "null",
      contact_title: "null",
      contact_phone: "+111111111111",
      contact_whatsapp: "+1111111111",
      contact_email: null,
      contact_image: null,
    };
    releases.value = [];
    showStart.value = true; // في حالة الخطأ، نظهر Start
    
  } finally {
    isLoading.value = false;
    console.log("🏁 Final showStart value:", showStart.value);
    console.log("🏁 Final releases count:", releases.value.length);
  }
});

const makeCall = () => {
  const phone = settings.value.contact_phone;
  window.location.href = `tel:${phone}`;
};

const openWhatsApp = () => {
  const whatsapp = settings.value.contact_whatsapp;
  window.open(`https://wa.me/${whatsapp}`, "_blank");
};

const openQuestionModal = () => {
  if (questionModalRef.value && settings.value.contact_email) {
    questionModalRef.value.openModal();
    questionModalRef.value.resetModal();
  }
};

const handleImageError = () => {
  console.log("Image error");
};
</script>

<style lang="scss" scoped>
/* جميع الأنماط كما هي - لم يتغير شيء */
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
  width: 100%;
  max-width: 2560px;
  margin: 0 auto;
  gap: 20px;
  align-items: flex-start;
}

.first-row {
  display: flex;
  align-items: stretch;
  gap: 20px;
  align-self: stretch;
  width: 100%;
}

.hero-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
}

.row1 {
  display: flex;
  height: 100%;
  padding: 20px 30px 15px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
  border-radius: 20px;
  background: var(--secondary);
  position: relative;
  min-height: 213px;
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
  height: 100%;
  padding: 20px 30px 15px 30px;
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
  min-width: 0;
}

.boxes {
  width: 100%;
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

.plus {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  fill: var(--Main-Colors-Dove, #6a6c6d);
}

.add:hover .plus img {
  filter: brightness(0) invert(1);
}

.plus img {
  transition: filter 0.3s ease;
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
  transition: 0.3s ease;
}

.music-card .text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
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
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: var(--Main-Colors-White, #fff);
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  opacity: 0.3;
}

.music-card .sub-text h1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  overflow: hidden;
  color: var(--Main-Colors-White, #fff);
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  text-transform: uppercase;
  opacity: 0.7;
}

.music-card .text p {
  align-self: stretch;
  color: var(--Main-Colors-White, #fff);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: .8;
  opacity: 0.7;
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
  align-self: stretch;
  border-radius: 20px;
  background: linear-gradient(54deg, #26282d 0%, #de1456 100%);
  padding: 20px;
}

.box-werk .box-title {
  display: flex;
  width: 300px;
  max-width: 300px;
  height: 21.565px;
  flex-direction: column;
  justify-content: center;
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
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
  line-height: 1;
  letter-spacing: 1.9px;
  text-transform: uppercase;
}

.contact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  align-self: stretch;
  flex: 1;
}

.contact-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  align-self: stretch;
  flex: 1;
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

.contact-links .icon .name-media span {
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

/* Responsive */
@media (min-width: 1440px) and (max-width: 1599px) {
  .containers {
    min-width: 810px;
    max-width: 1599px;
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
  
  .first-row {
    flex-shrink: 0;
  }

  .second-col {
    width: clamp(260px, 19vw, 300px);
  }
  .box-werk   { height: clamp(150px, 12vw, 180px); }
  .contact    { height: clamp(280px, 22vw, 350px); }

  .contact-links {
    padding: 12px;
    gap: 12px;
    justify-content: space-between;
  }
}

@media (min-width: 1600px) {
  .first-row {
    flex: 1 0 0;
    height: auto;
  }

  .second-col {
    width: clamp(300px, 23vw, 530px);
  }
  .box-werk { height: clamp(180px, 16vw, 420px); }
  .contact  { flex: 1; min-height: 350px; }
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
    flex: 1 0 0;
    align-self: stretch;
    height: auto;
  }

  .second-col,
  .boxes .card {
    width: clamp(290px, 22vw, 530px);
  }

  .box-werk {
    height: clamp(174px, 12vw, 420px);
  }

  .contact {
    flex: 1;
    min-height: 315px;
  }
}

@media (min-width: 2561px) {
  .first-row {
    flex: 1 0 0;
  }
}
</style>