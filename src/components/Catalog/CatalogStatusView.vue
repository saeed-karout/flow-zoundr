<template>
    <div class="catalog-status-view">
        <HeroCatalog :status="currentStatus" @update:search="handleSearch" />

        <div v-if="loading" class="loading-state">Downloading the releases...</div>
        <div v-else-if="error" class="error-state">An error occurred:{{ error }}</div>
        <div v-else-if="releases.length === 0" class="empty-state">
            There are no releases available in this section at the moment.
        </div>
        <div v-else class="music-grid">
            <div v-for="release in releases" :key="release.uuid" class="music-title"
                @click="navigateToRelease(release.uuid)">
                <div class="image-overlay">
                    <!-- الأيقونة تظهر فقط في الأقسام غير Releases -->
                    <div v-if="currentStatus !== 'releases'" class="icons">
                        <img :src="actionIcon" alt="action icon" @click.stop="handleAction(release.uuid)" />
                    </div>

                    <!-- pill الحالة تظهر فقط في قسم Releases -->
                    <div v-if="currentStatus === 'releases'" class="status-pill"
                        :class="getReleaseStatusClass(release.release_status)">
                        {{ getReleaseStatusLabel(release.release_status) }}
                    </div>

                    <div class="music-info">
                        <div class="title">{{ release.artist_name || 'Untitled' }}</div>
                        <div class="sub-title">{{ release.title || 'No sub-description' }}</div>
                    </div>

                    <div class="card-background" :style="{ backgroundImage: getCardBackground(release.cover) }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HeroCatalog from '@/components/modals/HeroCatalog.vue'
import apiRequest from '@/lib/apiRequest'
import { storage_url } from '@/constants'

const route = useRoute()
const router = useRouter()

const releases = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')

const currentStatus = computed(() => {
    let s = route.params.status
    if (!s) return 'releases'

    s = decodeURIComponent(s).toLowerCase().trim()

    console.log('Parsed route status:', s)
    return s
})

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

const actionIcon = computed(() => statusConfig.value.actionIcon)

const fetchReleases = async () => {
    try {
        loading.value = true
        error.value = null

        const params = {
            status: statusConfig.value.apiValue,
            q: searchQuery.value.trim() || undefined,
            per_page: 60
        }

        console.log('API request params:', params)

        const response = await apiRequest.get('/releases', { params })

        releases.value = response.data?.data || []

    } catch (err) {
        console.error('Error fetching releases:', err)
        error.value = err.message || 'فشل جلب البيانات'
    } finally {
        loading.value = false
    }
}


const getCardBackground = (cover) => {
    if (!cover) {
        // صورة افتراضية إذا لم يكن هناك cover
        return "url('../../assets/icons/dashboard/user/user.jpg')"
    }
    return `url(${storage_url}/${cover})`
}

const handleSearch = (newSearch) => {
    searchQuery.value = newSearch
    fetchReleases()
}

watch(currentStatus, () => {
    searchQuery.value = ''
    fetchReleases()
}, { immediate: true })

const navigateToRelease = (uuid) => {
    router.push(`/releases/${uuid}`)
}

const handleAction = async (uuid) => {
    try {
        if (currentStatus.value !== 'takedowns') {

            await apiRequest.delete(`/releases/${uuid}`);
        } else {

            await apiRequest.post(`/releases/${uuid}/restore`);
        }

        fetchReleases();
    } catch (err) {
        // alert('errors run time ');
    }
}

const getStatusClass = (rs) => {
    const map = { online: 'online', out_for_delivery: 'out-for-delivery', submitted: 'submitted' }
    return map[rs] || 'unknown'
}

const getStatusLabel = (rs) => {
    const map = { online: 'Online', out_for_delivery: 'In Auslieferung', submitted: 'Eingereicht' }
    return map[rs] || rs || 'unknown'
}
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

.error-state {
    color: #e74c3c;
}

.release-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    width: 100%;
    max-width: 2560px;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0 16px;
}

.music-grid {
    display: grid;
    gap: 20px;
    align-self: stretch;
    width: 100%;
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

.icons img {
    width: 20px;
    height: 22px;
    aspect-ratio: 10 / 11;
    z-index: 10;
}

/* لون الأيقونة الافتراضي */
.icons img {
    filter: brightness(0) invert(1);
}

/* في حال كان SVG وتريد تغيير لون fill عند hover */
.icons img:hover {
    filter: brightness(0) invert(0.7) sepia(1) saturate(5) hue-rotate(250deg);
    /* لون بنفسجي تقريبًا */
    /* أو استخدم var(--move) إذا كان معرفًا */
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

/* ────────────────────────────────────────────────
       Responsive sizes - يجب الاحتفاظ بهذه القيم كما هي
    ───────────────────────────────────────────────── */

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

/* إخفاء .pill-state في takedowns إذا لم تكن مطلوبة */
.music-title .pill-state,
.music-title .pill-state2,
.music-title .pill-state3 {
    display: none;
    /* افتراضيًا مخفية في takedowns */
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

/* الألوان حسب الحالة */
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

/* تحسين مظهر عند hover (اختياري) */
.music-title:hover .status-pill {
    transform: scale(1.05);
    transition: transform 0.2s ease;
}
</style>