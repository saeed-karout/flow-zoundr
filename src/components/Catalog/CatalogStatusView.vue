<template>
    <div class="catalog-status-view">
        <HeroCatalog :status="currentStatus" @update:search="handleSearch" />

        <div v-if="loading && releases.length === 0" class="loading-state">
            <!-- <div class="spinner"></div> -->
            <!-- <span>Loading...</span> -->
        </div>
        <div v-else-if="error" class="error-state">An error occurred: {{ error }}</div>
        <div v-else-if="releases.length === 0" class="empty-state">
            <!-- There are no releases available in this section at the moment. -->
        </div>
        <div v-else class="music-grid" ref="gridContainer">
            <div v-for="release in releases" :key="release.uuid" class="music-title"
                @click="navigateToRelease(release.uuid)">
                <div class="image-overlay">
                    <div v-if="currentStatus !== 'releases'" class="icons">
                        <svg 
                            @click.stop="handleAction(release.uuid)" 
                            class="action-icon"
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="22" 
                            viewBox="0 0 20 22" 
                            fill="none"
                        >
                            <path d="M18.7945 2.96049H16.1096V1.35802C16.1096 0.597531 15.5068 0 14.7397 0H5.23288C4.46575 0 3.86301 0.597531 3.86301 1.35802V2.96049H1.17808C0.547945 2.96049 0 3.5037 0 4.15556V6.98025H20V4.1284C19.9726 3.5037 19.4521 2.96049 18.7945 2.96049ZM5.50685 1.62963H14.4658V2.96049H5.50685V1.62963Z" fill="white"/>
                            <path d="M0.986301 8.58272V20.8321C0.986301 21.4839 1.50685 22 2.16438 22H17.8356C18.4658 22 19.0137 21.4568 19.0137 20.8049V8.58272H0.986301ZM6.16438 18.2519C6.16438 18.8494 5.67123 19.3383 5.06849 19.3383C4.46575 19.3383 3.9726 18.8494 3.9726 18.2519V12.3309C3.9726 11.7333 4.46575 11.2444 5.06849 11.2444C5.67123 11.2444 6.16438 11.7333 6.16438 12.3309V18.2519ZM11.0959 18.2519C11.0959 18.8494 10.6027 19.3383 10 19.3383C9.39726 19.3383 8.90411 18.8494 8.90411 18.2519V12.3309C8.90411 11.7333 9.39726 11.2444 10 11.2444C10.6027 11.2444 11.0959 11.7333 11.0959 12.3309V18.2519ZM16.0274 18.2519C16.0274 18.8494 15.5342 19.3383 14.9315 19.3383C14.3288 19.3383 13.8356 18.8494 13.8356 18.2519V12.3309C13.8356 11.7333 14.3288 11.2444 14.9315 11.2444C15.5342 11.2444 16.0274 11.7333 16.0274 12.3309V18.2519Z" fill="white"/>
                        </svg>
                    </div>

                    <div v-if="currentStatus === 'releases'" class="status-pill"
                        :class="getReleaseStatusClass(release.release_status)">
                        {{ getReleaseStatusLabel(release.release_status) }}
                    </div>

                    <div class="music-info">
                        <div class="title">{{ getArtistName(release) || 'Artist Music' }}</div>
                        <div class="sub-title">{{ release.title || 'No Title' }}</div>
                    </div>

                    <div class="card-background" :style="{ backgroundImage: getCardBackground(release.cover) }"></div>
                </div>
            </div>
        </div>

        <!-- ========== 🔥 Loading indicator for infinite scroll ========== -->
        <div v-if="loadingMore" class="loading-more">
            <div class="spinner-small"></div>
            <!-- <span>Loading more...</span> -->
        </div>

       
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

import HeroCatalog from '@/components/modals/HeroCatalog.vue'
import apiRequest from '@/lib/apiRequest'
import { storage_url } from '@/constants'

import { useReleaseStore } from '@/stores/release';

const releaseStore = useReleaseStore();
const route = useRoute()
const router = useRouter()

const releases = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(null)
const searchQuery = ref('')
const isFirstLoad = ref(true)

// ========== Infinite Scroll state ==========
const currentPage = ref(1)
const hasMore = ref(true)
const perPage = 12
const gridContainer = ref(null)

// ========== الحصول على status من المسار ==========
const currentStatus = computed(() => {
    let s = route.params.status
    if (!s) return 'releases'

    s = decodeURIComponent(s).toLowerCase().trim()
    console.log('📌 [CatalogStatusView] Parsed route status:', s)
    return s
})

// ========== تكوين الحالة ==========
const statusConfig = computed(() => {
    const lower = currentStatus.value

    const configs = {
        releases: { apiValue: 'release', actionIcon: null, emptyMessage: 'No published versions exist.' },
        entwürfe: { apiValue: 'draft', actionIcon: '/icon/tresh.svg', emptyMessage: 'No drafts' },
        korrektur: { apiValue: 'correction', actionIcon: '/icon/tresh.svg', emptyMessage: 'There are no corrections' },
        takedowns: { apiValue: 'takedown', actionIcon: '/icon/reset.svg', emptyMessage: 'There are no withdrawals' },
    }

    return configs[lower] || configs.releases
})

// ========== دوال الحالة ==========
const getReleaseStatusClass = (status) => {
    if (!status) return 'status-unknown'
    const lower = status.toLowerCase()
    if (lower === 'online') return 'status-online'
    if (lower === 'out_for_delivery') return 'status-delivery'
    if (lower === 'submitted') return 'status-submitted'
    return 'status-unknown'
}

const getReleaseStatusLabel = (status) => {
    if (!status) return 'unknown'
    const map = {
        online: 'Online',
        out_for_delivery: 'In Auslieferung',
        submitted: 'Eingereicht'
    }
    return map[status.toLowerCase()] || status
}

// ========== جلب البيانات ==========
const fetchReleases = async (page = 1, append = false) => {
    try {
        if (append) {
            loadingMore.value = true
        } else {
            loading.value = true
        }
        error.value = null

        const params = {
            status: statusConfig.value.apiValue,
            q: searchQuery.value.trim() || undefined,
            per_page: perPage,
            page: page
        }

        console.log(`📡 [CatalogStatusView] جلب البيانات للـ ${currentStatus.value} - الصفحة ${page}:`, params)

        const response = await apiRequest.get('/releases', { params })
        const data = response.data
        const newReleases = data?.data || []
        
        if (append) {
            releases.value = [...releases.value, ...newReleases]
        } else {
            releases.value = newReleases
        }
        
        // ✅ تحديث حالة وجود المزيد من البيانات
        const meta = data?.meta
        if (meta) {
            hasMore.value = meta.current_page < meta.last_page
            currentPage.value = meta.current_page
        }

        console.log(`✅ [CatalogStatusView] تم جلب ${newReleases.length} عنصر، المجموع: ${releases.value.length}, hasMore: ${hasMore.value}`)

    } catch (err) {
        console.error('❌ Error fetching releases:', err)
        error.value = err.message || 'فشل جلب البيانات'
        if (!append) {
            releases.value = []
        }
    } finally {
        loading.value = false
        loadingMore.value = false
    }
}

// ========== 🔥 دالة تحميل المزيد ==========
const loadMore = () => {
    if (loadingMore.value || !hasMore.value) return
    const nextPage = currentPage.value + 1
    console.log(`📥 تحميل المزيد - الصفحة ${nextPage}`)
    fetchReleases(nextPage, true)
}

// ========== 🔥 مراقبة التمرير (Infinite Scroll) ==========
const handleScroll = () => {
    if (!gridContainer.value) return
    
    const container = gridContainer.value
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // ✅ عندما يصل المستخدم إلى 200px من نهاية الصفحة
    const scrollPosition = scrollTop + windowHeight
    const threshold = documentHeight - 200
    
    if (scrollPosition >= threshold) {
        loadMore()
    }
}

// ========== خلفية البطاقة ==========
const getCardBackground = (cover) => {
    if (!cover) {
        return "url('../../assets/icons/dashboard/user/user.jpg')"
    }
    return `url(${storage_url}/${cover})`
}

// ========== معالجة البحث ==========
const handleSearch = (newSearch) => {
    searchQuery.value = newSearch
    // ✅ إعادة تعيين الحالة عند البحث
    currentPage.value = 1
    hasMore.value = true
    fetchReleases(1, false)
}

// ========== 🔥 التنقل إلى الـ Release ==========
const navigateToRelease = async (uuid) => {
    const status = currentStatus.value
    
    if (status === 'entwürfe') {
        try {
            const response = await apiRequest.get(`/releases/${uuid}`);
            const release = response.data?.data;
            
            if (!release) {
                console.error('❌ لم يتم العثور على الـ Release');
                router.push({
                    name: 'edit-release',
                    params: { releaseUuid: uuid }
                });
                return;
            }
            
            // ✅ ✅ ✅ تمرير preserveMetasComplete: true
            const targetStep = releaseStore.determineStepFromRelease(release, true, true);
            console.log(`📌 الخطوة المحددة من البيانات: ${targetStep}`);
            
            const lastMetasPage = localStorage.getItem('last_metas_page') || 'right';
            console.log(`📌 آخر صفحة في Metas: ${lastMetasPage}`);
            
            releaseStore.setCurrentStep(targetStep);
            
            const query = { step: targetStep };
            if (targetStep === 2) {
                query.lastPage = lastMetasPage;
            }
            
            router.push({
                name: 'edit-release',
                params: { releaseUuid: uuid },
                query: query
            });
            
        } catch (error) {
            console.error('❌ خطأ في جلب بيانات الـ Release:', error);
            router.push({
                name: 'edit-release',
                params: { releaseUuid: uuid }
            });
        }
    } else {
        router.push(`/releases/${uuid}`);
    }
}

// ========== الحصول على اسم الفنان ==========
const getArtistName = (release) => {
    if (release.artist && Array.isArray(release.artist) && release.artist.length > 0) {
        return release.artist[0];
    }
    if (release.artists && Array.isArray(release.artists) && release.artists.length > 0) {
        return release.artists[0];
    }
    if (release.artist_name) {
        return release.artist_name;
    }
    return null;
}

// ========== معالجة الإجراء ==========
const handleAction = async (uuid) => {
    try {
        const releaseIndex = releases.value.findIndex(r => r.uuid === uuid);
        
        if (releaseIndex === -1) {
            console.warn('⚠️ العنصر غير موجود في القائمة');
            return;
        }

        if (currentStatus.value !== 'takedowns') {
            await apiRequest.delete(`/releases/${uuid}`);
            releases.value.splice(releaseIndex, 1);
            console.log(`🗑️ تم حذف العنصر ${uuid} من القائمة المحلية`);
            showToast('Release wurde erfolgreich gelöscht.', 'success');
            
        } else {
            await apiRequest.post(`/releases/${uuid}/restore`);
            releases.value.splice(releaseIndex, 1);
            console.log(`♻️ تم استعادة العنصر ${uuid} من takedowns`);
            showToast('Release wurde erfolgreich wiederhergestellt.', 'success');
        }
        
    } catch (err) {
        console.error('❌ Action error:', err);
        showToast('Fehler beim Ausführen der Aktion.', 'error');
    }
}

// ========== دالة عرض الإشعارات ==========
const showToast = (message, type = 'info') => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message, type } 
    }));
    console.log(`📢 [${type}] ${message}`);
}

// ========== إعادة ضبط الحالة ==========
const resetState = () => {
    currentPage.value = 1
    hasMore.value = true
    releases.value = []
}

// ========== مراقبة تغيير المسار ==========
watch(
    () => route.params.status,
    (newStatus, oldStatus) => {
        console.log(`🔄 [CatalogStatusView] route.params.status تغير من ${oldStatus} إلى ${newStatus}`)
        resetState()
        searchQuery.value = ''
        fetchReleases(1, false)
    },
    { immediate: true }
)

watch(
    () => route.path,
    (newPath, oldPath) => {
        console.log(`🔄 [CatalogStatusView] route.path تغير من ${oldPath} إلى ${newPath}`)
        if (newPath !== oldPath && newPath.includes('/catalog/')) {
            resetState()
            searchQuery.value = ''
            nextTick(() => {
                fetchReleases(1, false)
            })
        }
    },
    { immediate: false }
)

// ========== استخدام onBeforeRouteUpdate ==========
onBeforeRouteUpdate(async (to, from, next) => {
    console.log(`🔄 [CatalogStatusView] beforeRouteUpdate: من ${from.path} إلى ${to.path}`)
    resetState()
    searchQuery.value = ''
    await fetchReleases(1, false)
    next()
})

// ========== دورة الحياة ==========
onMounted(() => {
    console.log('🚀 [CatalogStatusView] mounted')
    console.log('📌 currentStatus:', currentStatus.value)
    console.log('📌 route.params:', route.params)
    console.log('📌 route.path:', route.path)
    fetchReleases(1, false)
    
    // ✅ إضافة مستمع التمرير
    window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
    // ✅ إزالة مستمع التمرير
    window.removeEventListener('scroll', handleScroll)
})

// ========== تصدير ==========
defineExpose({
    fetchReleases,
    currentStatus,
    releases,
    loading,
    loadMore,
    hasMore
})
</script>

<style scoped lang="scss">
.catalog-status-view {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.music-grid {
    display: grid;
    gap: 20px;
    width: 100%;
    overflow: auto;
    scrollbar-width: none;
}

@media (min-width: 1440px) {
    .music-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (max-width: 1439px) {
    .music-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.loading-state,
.error-state,
.empty-state {
    padding: 80px 20px;
    text-align: center;
    font-size: 1.25rem;
    color: #888;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.loading-state .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--Strawberry, #D15);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.error-state {
    color: #e74c3c;
}

.music-title {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 1 / 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: #000;
    transition: transform 0.3s ease;
}

.music-title:hover {
    transform: translateY(-3px);
}

.card-background {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    filter: saturate(var(--saturation, 40%));
    transition: filter 0.6s ease;
    z-index: 1;
}

.music-title:hover .card-background {
    filter: saturate(90%);
}

.image-overlay {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    height: 100%;
    background: url('../../assets/icons/dashboard/user/shadow.png') center / cover no-repeat;
    background-blend-mode: saturation;
}

.icons {
    display: flex;
    padding: 1px 2px;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.music-title:hover .icons {
    opacity: 1;
}

.icons .action-icon {
    cursor: pointer;
    width: 20px;
    height: 22px;
    z-index: 10;
    transition: all 0.3s ease;
}

.icons .action-icon path {
    fill: #FFFFFF;
    transition: fill 0.3s ease;
}

.icons .action-icon:hover path {
    fill: #D15 !important;
}

.icons .action-icon:active {
    transform: scale(0.9);
}

.music-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: auto;
    z-index: 10;
}

.music-info .title,
.music-info .sub-title {
    margin: 0;
    padding: 0;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo, sans-serif;
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 0.9;
}

.music-info .title {
    font-size: 40px;
    font-weight: 700;
    opacity: 0.3;
    position: relative;
    top: 5px;
}

.music-info .sub-title {
    font-size: 28px;
    font-weight: 700;
    opacity: 0.7;
}

.music-title:hover .title,
.music-title:hover .sub-title {
    opacity: 1;
}

@media (min-width: 1440px) and (max-width: 1599px) {
    .music-title {
        width: clamp(250px, 250px + 40 * (100vw - 1440px) / 159, 290px);
        height: clamp(250px, 250px + 40 * (100vw - 1440px) / 159, 290px);
    }
}

@media (min-width: 1600px) and (max-width: 2074px) {
    .music-title {
        width: clamp(290px, 290px + 119 * (100vw - 1600px) / 474, 409px);
        height: clamp(290px, 290px + 119 * (100vw - 1600px) / 474, 409px);
    }
}

@media (min-width: 2075px) and (max-width: 2560px) {
    .music-title {
        width: clamp(409px, 409px + 121 * (100vw - 2075px) / 485, 530px);
        height: clamp(409px, 409px + 121 * (100vw - 2075px) / 485, 530px);
    }
}

@media (min-width: 2561px) {
    .music-title {
        width: 530px;
        height: 530px;
    }
}

.status-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    align-self: flex-end;
    margin-bottom: 12px;
    color: white;
    z-index: 10;
}

.status-online {
    background: var(--Main-Colors-Strawberry, #D15);
}

.status-delivery {
    background: rgba(27, 28, 32, 0.70);
}

.status-submitted {
    background: rgba(27, 28, 32, 0.70);
    opacity: 0.1;
}

.status-unknown {
    background: #9e9e9e;
    opacity: 0.7;
}

.music-title:hover .status-pill {
    transform: scale(1.05);
    transition: transform 0.2s ease;
}

/* ========== 🔥 Loading More ========== */
.loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 30px 0;
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo, sans-serif;
    font-size: 14px;
}

.loading-more .spinner-small {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--Strawberry, #D15);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

/* ========== 🔥 End of List ========== */
.end-of-list {
    display: flex;
    justify-content: center;
    padding: 30px 0 10px;
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo, sans-serif;
    font-size: 14px;
    opacity: 0.6;
}
</style>