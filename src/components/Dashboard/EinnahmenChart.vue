<template>
    <div class="einnahmen-tab">
        <div class="p">Einnahmen der letzten 12 Monate</div>
        
        <!-- Loading State
        <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
        </div> -->
        
        <!-- Bars -->
        <div class="bars">
            <div 
                v-for="bar in displayedBars" 
                :key="bar.label" 
                class="Graph-month"
                @mouseenter="updateHoverData(bar)" 
                @mouseleave="resetHoverData"
            >
                <div class="number" :style="{ top: `calc(${250 - bar.percentage * 1.8}px - 16px)` }">
                    {{ formatCurrency(hoveredBar.label === bar.label ? hoveredBar.value : bar.value) }}
                </div>

                <div class="bar-graph" :style="{ '--percentage': bar.percentage }">
                    <div v-for="index in 48" :key="index" class="segment-wrapper">
                        <div class="segment"></div>
                        <div class="gap"></div>
                    </div>
                </div>
                
                <div class="month-container">
                    <div class="p">{{ bar.label }}</div>
                    <div class="hover-line"></div>
                </div>
            </div>
        </div>

        <div class="bg-number">
            {{ formatNumber(totalValue) }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import apiRequest from '@/lib/apiRequest';

// ========== Props ==========
const props = defineProps({
    filters: {
        type: Object,
        default: () => ({})
    }
});

// ========== Reactive Data ==========
const isLoading = ref(false);
const chartData = ref({
    dates: [],
    values: []
});
const totalValue = ref(0);
let fetchTimeout = null;

// Hover state
const hoveredBar = ref({
    label: null,
    value: null,
    percentage: null
});

// ========== Computed ==========
const maxValue = computed(() => {
    const max = Math.max(...chartData.value.values, 1);
    return max;
});

const displayedBars = computed(() => {
    const dates = chartData.value.dates;
    const values = chartData.value.values;
    const maxVal = maxValue.value;
    
    if (dates.length === 0) return [];
    
    return values.map((value, index) => ({
        label: dates[index] || '',
        value: value,
        percentage: maxVal > 0 ? (value / maxVal) * 100 : 0,
        originalValue: value
    }));
});

// ========== Utility Functions ==========
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '€0';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Update hover data
const updateHoverData = (bar) => {
    const amount = bar.value || 0;
    hoveredBar.value = {
        label: bar.label,
        value: amount,
        percentage: bar.percentage
    };
};

// Reset hover data
const resetHoverData = () => {
    hoveredBar.value = {
        label: null,
        value: null,
        percentage: null
    };
};

// ========== Build API Params ==========
const buildApiParams = () => {
    const params = new URLSearchParams();
    
    // استخدام this_year (المدعوم من الـ API)
    if (props.filters?.dateType && props.filters.dateType !== 'custom') {
        params.append('date-type', props.filters.dateType);
    } else if (props.filters?.dateType === 'custom' && props.filters.startDate && props.filters.endDate) {
        params.append('date-type', 'custom');
        params.append('start_date', props.filters.startDate);
        params.append('end_date', props.filters.endDate);
    } else {
        params.append('date-type', 'this_year');
    }
    
    return params;
};

// ========== Fetch Data ==========
const fetchEarningsData = async () => {
    isLoading.value = true;
    try {
        const params = buildApiParams();
        console.log('💰 Fetching earnings with params:', params.toString());
        
        const response = await apiRequest.get(`/royalties/earnings?${params.toString()}`);
        const data = response.data?.data || response.data;
        
        if (data && data.dates && data.values) {
            chartData.value = {
                dates: data.dates,
                values: data.values
            };
            totalValue.value = data.values.reduce((sum, val) => sum + val, 0);
            console.log(`✅ Loaded ${chartData.value.dates.length} data points`);
        } else {
            console.warn('⚠️ Unexpected data format:', data);
            chartData.value = {
                dates: [],
                values: []
            };
            totalValue.value = 0;
        }
        
        await nextTick();
    } catch (error) {
        console.error('❌ Error fetching earnings data:', error);
        chartData.value = {
            dates: [],
            values: []
        };
        totalValue.value = 0;
        await nextTick();
    } finally {
        isLoading.value = false;
    }
};

const debouncedFetch = () => {
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
        fetchTimeout = null;
    }
    fetchTimeout = setTimeout(() => {
        fetchEarningsData();
    }, 300);
};

// Watch for filters changes
watch(
    () => props.filters,
    () => {
        debouncedFetch();
    },
    { deep: true, immediate: true }
);

// ========== Lifecycle ==========
onMounted(() => {
    fetchEarningsData();
});

onUnmounted(() => {
    if (fetchTimeout) {
        clearTimeout(fetchTimeout);
        fetchTimeout = null;
    }
});
</script>

<style lang="scss" scoped>
.einnahmen-tab {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: 4px;
    flex: 1 0 0;
    width: 100%;
    height: auto;
    border-radius: 20px;
    background: var(--Main-Colors-Slate, #26282D);
    padding: 20px 30px 12px 30px;
    position: relative;
    // min-height: 320px;
}

.p {
    color: #FFF;
    align-self: stretch;
    font-family: Heebo, sans-serif;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.9;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    position: relative;
    top: 3px;
}

.bars {
    display: flex;
    padding-bottom: 4px;
    justify-content: space-between;
    align-items: flex-end;
    align-self: stretch;
    height: 100%;
    min-height: 213px;
    z-index: 2;
    gap: 4px;
}

.Graph-month {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    // flex: 1 0 0;
    cursor: pointer;
    transition: 0.3s ease;
    position: relative;
}

.Graph-month .number {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
    color: #FFF;
    text-align: center;
    font-family: Heebo, sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: 0.6;
    text-transform: uppercase;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 20;
    white-space: nowrap;
    pointer-events: none;
    padding: 4px 10px;
    border-radius: 4px;
}

.Graph-month:hover .number {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px);
}

.Graph-month .bar-graph {
    display: flex;
    width: 67px;
    height: 204px;
    flex-direction: column-reverse;
    align-items: center;
    position: relative;
    background: linear-gradient(180deg, var(--Strawberry) 0%, var(--secondary) 100%);
    overflow: hidden;
    border-radius: 4px;
}

.Graph-month .bar-graph::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% - var(--percentage) * 1.8px);
    background: var(--Main-Colors-Slate, #26282D);
}

.Graph-month .bar-graph .segment-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.Graph-month .bar-graph .segment {
    width: 100%;
    height: 3px;
    background: transparent;
}

.Graph-month .bar-graph .gap {
    width: 100%;
    height: 2px;
    background: var(--Main-Colors-Slate, #26282D);
}

.Graph-month .month-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.Graph-month .month-container .p {
    color: #FFF;
    text-align: center;
    font-family: Heebo, sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 300;
    line-height: 0.6;
    letter-spacing: 0.7px;
    text-transform: uppercase;
}

.Graph-month .month-container .hover-line {
    position: absolute;
    bottom: -12px;
    width: 2px;
    height: 2px;
    background: var(--Strawberry);
    opacity: 0;
    transition: width 0.4s ease, opacity 0.4s ease;
}

.Graph-month:hover .month-container .hover-line {
    width: 66px;
    opacity: 1;
}

.bg-number {
    position: absolute;
    transform: translate(-50%);
    left: 50%;
    top: 40%;
    color: var(--Main-Colors-Dove, #6A6C6D);
    font-family: Heebo;
    font-size: 180px;
    font-style: normal;
    font-weight: 700;
    line-height: .5;
    letter-spacing: 9px;
    text-transform: uppercase;
    opacity: 0.1;
    z-index: 10;
    padding: 0;
    pointer-events: none;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 200px;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(221, 17, 85, 0.1);
    border-top-color: #DD1155;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@media (min-width: 1440px) and (max-width: 1599px) {
    .Graph-month .bar-graph {
        width: 50px;
        height: 110px;
    }

}


@media (min-width: 1600px) and (max-width: 2073px){
    .bars{
        min-height: 235px;
    }
}

@media (min-width: 2074px) and (max-width: 2560px) {
    .Graph-month .bar-graph {
        width: 93px;
        height: 250px;
    }

    .Graph-month .bar-graph .gap {
        height: 3px;
    }

    .bars{
        min-height: 285px;
    }
}
</style>