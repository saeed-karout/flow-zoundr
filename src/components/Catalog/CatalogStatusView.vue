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
                        <!-- takedowns → استعادة (POST /releases/{uuid}/restore)؛ ما عداها → حذف.
                             كلاهما يمرّ عبر handleAction الذي يفرّق بينهما. -->
                        <svg
                            v-if="currentStatus === 'takedowns'"
                            @click.stop="handleAction(release.uuid)"
                            class="action-icon action-icon-restore"
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                        >
                            <path d="M11 0C4.93651 0 0 4.92064 0 11C0 17.0794 4.92064 22 11 22C17.0794 22 22 17.0794 22 11C22 4.92064 17.0635 0 11 0ZM18.4127 12.0317C18.3016 12.8254 18.0794 13.5873 17.746 14.3016C17.3492 15.127 16.8095 15.8889 16.1587 16.5238C15.4762 17.1905 14.6508 17.746 13.7778 18.1111C12.8413 18.5079 11.8413 18.7143 10.8254 18.7143C9.80952 18.7143 8.79365 18.5238 7.85714 18.1429C6.96825 17.7778 6.14286 17.2381 5.44445 16.5873C5.12698 16.2857 4.84127 15.9524 4.5873 15.619L6.39683 14.1905C6.57143 14.4286 6.77778 14.6667 6.98413 14.873C7.46032 15.3492 8.03175 15.7302 8.66667 15.9841C9.31746 16.254 10.0317 16.3968 10.7302 16.4127C11.4444 16.4127 12.1587 16.2857 12.8095 16.0159C13.4286 15.7619 13.9841 15.3968 14.4762 14.9365C14.9524 14.4921 15.3492 13.9524 15.6349 13.3651C15.873 12.873 16.0317 12.3492 16.127 11.8095C16.2222 11.1905 16.2064 10.5397 16.0794 9.92064C15.9841 9.42857 15.8095 8.93651 15.5714 8.49206C15.3016 7.96825 14.9365 7.47619 14.4921 7.06349C14.0635 6.65079 13.5714 6.31746 13.0476 6.07937C12.6032 5.87302 12.1429 5.73016 11.6508 5.65079C11.3968 5.60318 11.127 5.5873 10.8571 5.57143C10.8095 5.57143 10.7619 5.57143 10.7143 5.57143C10.4444 5.57143 10.1905 5.5873 9.92064 5.63492C9.44444 5.71429 8.96825 5.84127 8.52381 6.04762C8 6.28571 7.50794 6.60318 7.07937 7C6.68254 7.36508 6.34921 7.79365 6.06349 8.25397L7.93651 9.19048L3.19048 11.3016L2.03175 6.20635L4.03175 7.22222C4.39683 6.57143 4.84127 5.98413 5.38095 5.47619C6 4.87302 6.73016 4.36508 7.50794 4C8.14286 3.69841 8.80952 3.49206 9.49206 3.38095C9.85714 3.31746 10.2381 3.28571 10.619 3.28571C10.6825 3.28571 10.746 3.28571 10.8254 3.28571C11.2064 3.28571 11.5714 3.31746 11.9524 3.38095C12.6349 3.49206 13.3175 3.68254 13.9524 3.96825C14.7143 4.31746 15.4127 4.77778 16.0317 5.34921C16.6667 5.93651 17.2064 6.63492 17.6032 7.39683C17.9524 8.04762 18.2064 8.7619 18.3492 9.47619C18.5079 10.3175 18.5238 11.1746 18.4127 12.0317Z" fill="white"/>
                        </svg>
                        <svg 
                            v-else
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
                        <div class="title">{{ getArtistName(release) || 'No Artist ' }}</div>
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

        <!-- ✅ تأكيد الحذف — بدل الحذف المباشر (قد يُنقَر بالخطأ) -->
        <ConfirmDeletePopup
            :show="showDeleteConfirm"
            :title="deleteConfirmTitle"
            :message="deleteConfirmMessage"
            @confirm="confirmDelete"
            @cancel="showDeleteConfirm = false"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'

import HeroCatalog from '@/components/modals/HeroCatalog.vue'
import ConfirmDeletePopup from '@/components/modals/ConfirmDeletePopup.vue'
import apiRequest from '@/lib/apiRequest'
import { storage_url } from '@/constants'

import { useReleaseStore } from '@/stores/release';
import { computeTabCompletion, isSongComplete, isInstrumentalSong } from '@/utils/songCompletion';
import { resolveCorrectionTarget, resolveMissingTarget, hasAnyCorrection } from '@/utils/corrections';
import { debounce } from '@/utils/debounce';

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

// رقم آخر طلب بحث/جلب. الردود قد تصل بغير ترتيب إرسالها، فنتجاهل
// كلّ ردّ تجاوزه طلبٌ أحدث منه بدل أن يكتب نتيجته فوق الأحدث.
let latestRequestId = 0
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
    const requestId = ++latestRequestId
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
        if (requestId !== latestRequestId) return

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
        if (requestId !== latestRequestId) return
        console.error('❌ Error fetching releases:', err)
        error.value = err.message || 'فشل جلب البيانات'
        if (!append) {
            releases.value = []
        }
    } finally {
        if (requestId === latestRequestId) {
            loading.value = false
            loadingMore.value = false
        }
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
// حقل البحث يُطلق حدثاً مع كلّ حرف، فكان كلّ حرف يرسل طلباً مستقلّاً.
// نؤجّله حتى يتوقّف المستخدم عن الكتابة.
const runSearch = debounce(() => {
    // ✅ إعادة تعيين الحالة عند البحث
    currentPage.value = 1
    hasMore.value = true
    fetchReleases(1, false)
}, 350)

const handleSearch = (newSearch) => {
    searchQuery.value = newSearch
    runSearch()
}

// ========== 🔥 دالة حساب الخطوة الصحيحة ==========
const getCorrectStepFromRelease = (release) => {
    if (!release) return 1;
    
    console.log('📊 [getCorrectStepFromRelease] تحليل الـ Release:', {
        uuid: release.uuid,
        title: release.title,
        hasCover: !!release.cover,
        artistsCount: release.artists?.length || 0,
        songsCount: release.songs?.length || 0,
        storesCount: release.stores?.length || 0
    });
    
    // ✅ 1. التحقق من اكتمال Metas
    const hasTitle = release.title && release.title.trim() !== '';
    const hasArtists = release.artists && release.artists.length > 0;
    const hasReleaseDate = release.release_date;
    const hasCover = release.cover && release.cover.trim() !== '';
    
    const isMetasComplete = hasTitle && hasArtists && hasReleaseDate && hasCover;
    console.log(`📊 Metas مكتملة: ${isMetasComplete}`, { hasTitle, hasArtists, hasReleaseDate, hasCover });
    
    // ✅ 2. التحقق من وجود أغانٍ
    const hasSongs = release.songs && release.songs.length > 0;
    console.log(`📊 يوجد أغانٍ: ${hasSongs}, العدد: ${release.songs?.length || 0}`);
    
    // ✅ 3. اكتمال الأغاني — عبر المصدر المشترك @/utils/songCompletion.
    //    كانت هنا نسخة مستقلة تشترط Explicit و Sprache Text و Textdichter دائماً،
    //    فلا تكتمل أغنية instrumental أبداً (حقولها معطّلة وفارغة عمداً)، فيُرسَل
    //    المستخدم إلى الخطوة 3 بدل آخر خطوة وصل إليها.
    let areSongsComplete = false;
    if (hasSongs) {
        areSongsComplete = release.songs.every(song => {
            const complete = isSongComplete(song);
            console.log(`  🎵 أغنية "${song.title}" مكتملة: ${complete}`, {
                ...computeTabCompletion(song),
                isInstrumental: isInstrumentalSong(song),
                hasSongFile: !!song.song_file
            });
            return complete;
        });
    }
    console.log(`📊 جميع الأغاني مكتملة: ${areSongsComplete}`);
    
    // ✅ 4. التحقق من وجود Shops
    const hasStores = release.stores && release.stores.length > 0;
    console.log(`📊 يوجد Shops: ${hasStores}, العدد: ${release.stores?.length || 0}`);
    
    // ✅ 5. تحديد الخطوة
    let step = 1;
    
    if (isMetasComplete) {
        step = 2;
        
        if (hasSongs) {
            step = 3;
            
            if (areSongsComplete) {
                step = 4;
                
                if (hasStores) {
                    step = 5;
                }
            }
        }
    }
    
    console.log(`📊 ✅ الخطوة المحددة: ${step}`);
    
    return step;
}

// ========== 🔥 التنقل إلى الـ Release ==========
const navigateToRelease = async (uuid) => {
    const status = currentStatus.value

    // ✅ Korrektur مثل Entwürfe: ننقل المستخدم إلى وضع التعديل عند الخطوة الناقصة/المطلوبة
    //    (getCorrectStepFromRelease) بدل صفحة التفاصيل، ليصحّح ما ينقص مباشرةً.
    if (status === 'entwürfe' || status === 'korrektur') {
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
            
            // ✅ Korrektur: إن وصلت corrections من الباكإند، نذهب إلى أوّل موضع فيه
            //    حقل مطلوب تصحيحه — مرتّباً حسب الخطوة ثم الصفحة ثم الأغنية ثم التبويب —
            //    بدل الخطوة الناقصة المحسوبة من اكتمال البيانات.
            // وجهة واحدة للقسمين بنفس الترتيب (الخطوة ← الصفحة ← الأغنية ← التبويب)،
            // فلا تتضارب قواعد الانتقال بينهما:
            //   Korrektur → أوّل حقل مطلوب تصحيحه (corrections من الباكإند)
            //   Entwürfe  → أوّل حقل ناقص (مثل release_date بعد الاستعادة من Takedown)
            let target = null;

            if (status === 'korrektur' && hasAnyCorrection(release)) {
                releaseStore.setCorrections(release);
                target = resolveCorrectionTarget(release);
            } else {
                releaseStore.clearCorrections();
                if (status === 'entwürfe') {
                    target = resolveMissingTarget(release);
                }
            }

            if (target) {
                console.log('✏️ [' + status + '] أوّل موضع يحتاج تدخّلاً:', target);
                releaseStore.setEditTarget(target);
                releaseStore.setCurrentStep(target.step);

                const query = { step: target.step };

                if (target.step === 2 && target.view) {
                    query.lastPage = target.view;
                }

                if (target.step === 3) {
                    const songUuid = target.songUuid || release.songs?.[0]?.uuid;
                    if (songUuid) {
                        query.song = songUuid;
                        releaseStore.setSongUuid(songUuid);
                        if (target.tab) releaseStore.setLastSongTab(songUuid, target.tab);
                    }
                }

                router.push({
                    name: 'edit-release',
                    params: { releaseUuid: uuid },
                    query: query
                });
                return;
            }

            // ✅ ✅ ✅ حساب الخطوة الصحيحة بناءً على البيانات
            const targetStep = getCorrectStepFromRelease(release);
            console.log(`📌 الخطوة المحددة من البيانات: ${targetStep}`);
            
            const lastMetasPage = localStorage.getItem('last_metas_page') || 'right';
            console.log(`📌 آخر صفحة في Metas: ${lastMetasPage}`);
            
            // ✅ حفظ الخطوة في الـ Store
            releaseStore.setCurrentStep(targetStep);
            
            // ✅ بناء الـ Query
            const query = { step: targetStep };
            if (targetStep === 2) {
                query.lastPage = lastMetasPage;
            }
            
            // ✅ إذا كانت الخطوة 3 ولدينا songUuid، نضيفه إلى الـ Query
            if (targetStep === 3 && release.songs && release.songs.length > 0) {
                // ✅ نأخذ أول أغنية كـ default
                const firstSong = release.songs[0];
                if (firstSong && firstSong.uuid) {
                    query.song = firstSong.uuid;
                    console.log(`🎵 تم إضافة songUuid إلى الـ Query: ${firstSong.uuid}`);
                }
            }
            
            console.log(`🔀 التوجيه إلى edit-release مع query:`, query);
            
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

// ========== حالة تأكيد الحذف ==========
const showDeleteConfirm = ref(false)
const deleteTargetUuid = ref('')
const deleteTargetTitle = ref('')

// نصّ موحّد لحذف أيّ release في كلّ أقسام الكتالوغ (Releases / Entwürfe / Korrektur / Takedowns).
const deleteConfirmTitle = computed(() => 'Wirklich löschen?')
// سطران: يُعرضان عبر white-space: pre-line في ConfirmDeletePopup.
const deleteConfirmMessage = computed(() => {
    const name = deleteTargetTitle.value
        ? `„${deleteTargetTitle.value}“`
        : 'dieses Release'
    return `Möchtest Du ${name} wirklich löschen?
Dies kann nicht rückgängig gemacht werden`
})

// ========== معالجة الإجراء (نقر أيقونة السلة) ==========
const handleAction = async (uuid) => {
    const release = releases.value.find(r => r.uuid === uuid)
    if (!release) {
        console.warn('⚠️ العنصر غير موجود في القائمة')
        return
    }

    // ✅ takedowns → استعادة مباشرة. غير ذلك → نُظهر تأكيد الحذف بدل الحذف الفوري
    //    (قد يُنقَر بالخطأ) — يشبه ConfirmDeletePopup بنص ألماني.
    if (currentStatus.value === 'takedowns') {
        await restoreRelease(uuid)
    } else {
        deleteTargetUuid.value = uuid
        deleteTargetTitle.value = release.title || ''
        showDeleteConfirm.value = true
    }
}

// ========== تنفيذ الحذف بعد التأكيد ==========
const confirmDelete = async () => {
    const uuid = deleteTargetUuid.value
    showDeleteConfirm.value = false
    if (!uuid) return

    try {
        const releaseIndex = releases.value.findIndex(r => r.uuid === uuid)
        if (releaseIndex === -1) return

        await apiRequest.delete(`/releases/${uuid}`)
        releases.value.splice(releaseIndex, 1)
        console.log(`🗑️ تم حذف العنصر ${uuid} من القائمة المحلية`)
        notifyCatalogChanged()
        showToast('Release wurde erfolgreich gelöscht.', 'success')
    } catch (err) {
        console.error('❌ Delete error:', err)
        showToast('Fehler beim Löschen.', 'error')
    } finally {
        deleteTargetUuid.value = ''
        deleteTargetTitle.value = ''
    }
}

// ========== استعادة عنصر من takedowns ==========
const restoreRelease = async (uuid) => {
    try {
        const releaseIndex = releases.value.findIndex(r => r.uuid === uuid)
        if (releaseIndex === -1) return

        await apiRequest.post(`/releases/${uuid}/restore`)
        releases.value.splice(releaseIndex, 1)
        console.log(`♻️ تم استعادة العنصر ${uuid} من takedowns`)
        notifyCatalogChanged()
        showToast('Release wurde erfolgreich wiederhergestellt.', 'success')
    } catch (err) {
        console.error('❌ Restore error:', err)
        showToast('Fehler beim Wiederherstellen.', 'error')
    }
}

// الشريط الجانبي يفحص عناصر Korrektur عند التركيب وعند تغيّر المسار فقط.
// والحذف من داخل القسم لا يغيّر المسار، فكانت علامة (!) تبقى بعد حذف
// آخر عنصر. نعلمه صراحةً — نفس نمط show-toast المستعمل في المشروع.
const notifyCatalogChanged = () => {
    window.dispatchEvent(new CustomEvent('catalog-changed'))
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
    runSearch.cancel()
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

/* ========== الخلفية (الطبقة الأولى) ========== */
.card-background {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-position: center;
    filter: saturate(var(--saturation, 40%));
    transition: filter 0.6s ease;
}

.music-title:hover .card-background {
    filter: saturate(90%);
}

/* ========== الحاوية الرئيسية (الطبقة الثانية) ========== */
.image-overlay {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    height: 100%;
}

/* ========== الظل (الطبقة الثانية – فوق الخلفية) ========== */
.image-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    background-image: url('../../assets/icons/dashboard/user/shadow.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.3s ease;
}



/* ========== المحتوى (الطبقة الثالثة – فوق الظل) ========== */
.icons,
.status-pill,
.music-info {
    position: relative;
    z-index: 2;
}

/* الأيقونات */
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
    transition: all 0.3s ease;
}
/* أيقونة الاستعادة مربّعة 22×22 بخلاف سلة الحذف 20×22،
   وترث نفس تلوين الهوفر من .action-icon. */
.icons .action-icon-restore {
    width: 22px;
    height: 22px;
}

.icons .action-icon path {
    fill: #FFFFFF;
    transition: fill 0.3s ease;
}

.icons .action-icon:hover path {
    fill: #D15 !important;
}

/* معلومات الموسيقى */
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

/* ========== حالة الإصدار (للـ releases) ========== */
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
    color: rgba(255, 255, 255, 0.1);
}

.status-unknown {
    background: #9e9e9e;
    opacity: 0.7;
}

.music-title:hover .status-pill {
    transition: transform 0.2s ease;
}

/* ========== استجابة الأبعاد ========== */
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

/* ========== تحميل المزيد ========== */
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