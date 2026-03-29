<template>
    <div class="final-page" :class="{ 'slide-in': isVisible }">
        <div class="info">
            <div class="title">{{ artistInputs[0]?.searchQuery || '' }}</div>
            <div class="subtitle">{{ searchQuery2 || 'indifined' }}</div>
            <div class="pill-state">
                <div class="date">{{ selectedDate || 'indifined' }}</div>
            </div>
            <div class="summary">
                <div class="row">
                    <div class="summary-item">
                        <span class="label">Release Preis:</span>
                        <span class="value">{{ releasePrice || 'indifined' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Song Preis:</span>
                        <span class="value">{{ songPrice || 'indifined' }}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="summary-item">
                        <span class="label">Hauptgenre:</span>
                        <span class="value">{{ mainGenre || 'indifined' }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">Subgenre:</span>
                        <span class="value">{{ subGenre || 'indifined' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="info2">
            <div class="row1">
                <div class="info">
                    <div class="label">Label:</div>
                    <div class="value">{{ labelName || 'indifined' }}</div>
                </div>
                <div class="info">
                    <div class="label">C-Line:</div>
                    <div class="value">{{ cLineName && cLineYear ? `${cLineName} (${cLineYear})` : 'غير محدد' }}</div>
                </div>
            </div>
            <div class="row1">
                <div class="info">
                    <div class="label">P-Line:</div>
                    <div class="value">{{ pLineName && pLineYear ? `${pLineName} (${pLineYear})` : 'غير محدد' }}</div>
                </div>
                <div class="info">
                    <div class="label">Produktionsjahr:</div>
                    <div class="value">{{ productionYear || 'غير محدد' }}</div>
                </div>
            </div>
            <div class="row1">
                <div class="info">
                    <div class="label">GTIN:</div>
                    <div class="value">{{ gtin || '–' }}</div>
                </div>
                <div class="info">
                    <div class="label">Katalognummer:</div>
                    <div class="value">{{ catalogNumber || '–' }}</div>
                </div>
            </div>
        </div>
        <div class="btn-right">
            button
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    artistInputs: { type: Array, required: true },
    searchQuery2: { type: String, default: '' },
    selectedDate: { type: String, default: null },
    releasePrice: { type: String, default: '' },
    songPrice: { type: String, default: '' },
    mainGenre: { type: String, default: '' },
    subGenre: { type: String, default: '' },
    labelName: { type: String, default: '' },
    productionYear: { type: String, default: '' },
    cLineYear: { type: String, default: '' },
    cLineName: { type: String, default: '' },
    pLineYear: { type: String, default: '' },
    pLineName: { type: String, default: '' },
    gtin: { type: String, default: '' },
    catalogNumber: { type: String, default: '' },
    uploadedImage: { type: String, default: null }
});

const isVisible = ref(false);

watch(() => props, () => {
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
}, { immediate: true });
</script>

<style lang="scss" scoped>
.final-page {
  display: flex;
  width: 889px;
  padding-top: 28px;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
  flex-grow: 1; /* السماح لـ final-page بالتمدد */
  min-height: 100%; /* التأكد من أن الارتفاع يأخذ 100% من الحاوية */
  height: 100%; /* الارتفاع الكامل */
}

.final-page.slide-in {
  transform: translateY(0);
  opacity: 1;
}

.final-page .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    flex-shrink: 0;
}

.final-page .info .title {
    color: #FFF;
    font-family: Heebo;
    font-size: 58px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
    text-transform: uppercase;
}

.final-page .info .subtitle {
    color: #FFF;
    font-family: Heebo;
    font-size: 40px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.8;
}

.final-page .info .pill-state {
    display: flex;
    height: 28px;
    padding: 0 8px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 12px;
    background: var(--Strawberry, #D15);
}

.pill-state .date {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
}

.summary {
    display: flex;
    padding: 40px 0 40px 126px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
}

.summary .row {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 0 0;
}

.summary-item .label {
    width: 180px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 1px;
}

.summary-item .value {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
}

.info2 {
    display: flex;
    padding-left: 126px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    align-self: stretch;
    flex-grow: 1;
    justify-content: flex-start;
}

.info2 .row1 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
}

.info2 .row1 .info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1 0 0;
    flex-direction: row;
}

.info2 .row1 .info .label {
    width: 180px;
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 300;
    line-height: 1;
    letter-spacing: 1px;
}

.info2 .row1 .info .value {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 1px;
}

.btn-right {
    position: absolute;
    right: 20px;
    bottom: 20px;
    border-radius: 5px;
    background: #D15;
    display: flex;
    padding: 12px 20px 13px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
</style>