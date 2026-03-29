<template>
    <div class="einnahmen-tab">
        <div class="p">{{ streamData?.title || 'Einnahmen' }}</div>
        <div class="bars">
            <div v-for="bar in streamData?.bars || []" :key="bar?.month || ''" class="Graph-month"
                @mouseenter="updateHoverData(bar)" @mouseleave="resetHoverData">
                <div class="number" :style="{ top: `calc(${340 - bar?.percentage * 3.4}px - 16px)` }">
                    {{ formatCurrency(hoveredBar.month === bar?.month
                        ? hoveredBar.amount
                        : (bar?.percentage / 100) * (streamData?.total || 0)) }}
                </div>


                <div class="bar-graph" :style="{ '--percentage': bar?.percentage || 0 }">
                    <div v-for="index in 48" :key="index" class="segment-wrapper">
                        <div class="segment"></div>
                        <div class="gap"></div>
                    </div>
                </div>
                <div class="month-container">
                    <div class="p">{{ bar?.month || '' }}</div>
                    <div class="hover-line"></div>
                </div>
            </div>
        </div>


        <div class="bg-number">
            25.715
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
};


// Initialize with static dummy data (normalized to sum to 100%)
const streamData = ref({
    title: 'Einnahmen',
    total: 1200000, // Total revenue in EUR
    percentage: 100, // Overall percentage
    bars: [
        { month: 'Jan', percentage: 80 },
        { month: 'Feb', percentage: 85 },
        { month: 'Mar', percentage: 80 },
        { month: 'Apr', percentage: 60 },
        { month: 'May', percentage: 48 },
        { month: 'Jun', percentage: 28 },
        { month: 'Jul', percentage: 99 },
        { month: 'Aug', percentage: 82 },
        { month: 'Sep', percentage: 55 },
        { month: 'Oct', percentage: 15 },
        { month: 'Nov', percentage: 35 },
        { month: 'Dec', percentage: 55 },
    ],
});

// Track hover state for bars
const hoveredBar = ref({
    month: null,
    amount: null,
});



// Function to update hover data
const updateHoverData = (bar) => {
    const amount = (bar.percentage / 100) * (streamData.value.total || 0);
    hoveredBar.value = {
        month: bar.month,
        amount: amount,
    };
};

// Function to reset hover data
const resetHoverData = () => {
    hoveredBar.value = {
        month: null,
        amount: null,
    };
};


</script>

<style lang="scss" scoped>
.einnahmen-tab {
    display: flex;
    height: 464px;
    padding: 20px 30px 12px 30px;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: 4px;
    flex: 1 0 0;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: var(--Main-Colors-Slate, #26282D);
    position: relative;
}

.p {
    color: #FFF;
    align-self: stretch;
    font-family: Heebo, sans-serif;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 0.6;
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
    min-height: 400px;
    z-index: 2;
    flex: 1 1 0;
    /* Adjusted to fit number, bar-graph, and month label */
}

.Graph-month {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex: 1 0 0;
    cursor: pointer;
    /* Indicate interactivity */
    transition: 0.3s ease;
    position: relative;
    /* Anchor for absolute positioning of number */
}

.Graph-month .number {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(8px); // تبدأ من أسفل العمود بـ 8 بكسل
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
    z-index: 5;
}

.Graph-month:hover .number {
    opacity: 1;
    transform: translateX(-50%) translateY(0); // يتحرك للأعلى 8 بكسل
}


.Graph-month .bar-graph {
    display: flex;
    width: 67px;
    height: 340px;
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
    height: calc(100% - var(--percentage) * 3.4px);
    /* Scale height based on percentage */
    background: var(--Main-Colors-Slate, #26282D);
    /* Cover non-filled portion */
}

.Graph-month .bar-graph .segment-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.Graph-month .bar-graph .segment {
    width: 100%;
    height: 4px;
    /* Specified segment height */
    background: transparent;
    /* Gradient shows through */
}

.Graph-month .bar-graph .gap {
    width: 100%;
    height: 3px;
    /* Specified gap height */
    background: var(--Main-Colors-Slate, #26282D);
    /* Secondary color for gaps */
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
    /* Place below month name */
    width: 2px;
    /* Initial width */
    height: 2px;
    /* Specified height */
    background: var(--Strawberry);
    /* Red color */
    opacity: 0;
    /* Hidden by default */
    transition: width 0.4s ease, opacity 0.4s ease;
}

.Graph-month:hover .month-container .hover-line {
    width: 66px;
    /* Full column width */
    opacity: 1;
    /* Visible on hover */

}


.bg-number {
    color: var(--selvar);
  font-family: Heebo;
  font-size: 180px;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 9px;
  text-transform: uppercase;

  /* التوسيط المطلق */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* لضمان عدم تأثيره على التدفق */
  pointer-events: none;
  opacity: 0.1;
  white-space: nowrap;
  z-index: 10;

}


@media (min-width:1440px) and (max-width:1599px) {
    .Graph-month .bar-graph{
        min-width: 57px;
        max-width: 67px;
    }
}
</style>