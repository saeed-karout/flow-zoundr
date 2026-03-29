```vue
<template>
  <div class="calendar-picker">
    <div class="calendar1">
      <div class="top-row">
        <div class="von">Bis:</div>
        <div class="month">
          <div class="arrow-left" @click="prevMonth">
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M6 11L1 6L6 1" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="name-month">{{ currentMonthName }} {{ currentYear }}</div>
          <div class="arrow-right" @click="nextMonth">
            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M0.999999 1L6 6L1 11" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <div class="weekDays">
        <div v-for="day in weekDays" :key="day" class="chart-day">{{ day }}</div>
      </div>
      <div class="calender-1">
        <div v-for="(day, index) in calendarDays" :key="index" :class="['cal-day', {
            'this-month': day.isCurrentMonth,
            'past-day': isPastDay(day),
            'active': isDayActive(day),
            'selected': isDaySelected(day),
            'Current_day': isCurrentDay(day)
          }]" @click="selectDay(day)">
          {{ day.date.getDate() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  
  const props = defineProps({
    initialDate: { type: Date, default: () => new Date() },
  });
  
  const emit = defineEmits(['select']);
  
  const weekDays = ['m', 'd', 'm', 'd', 'f', 's', 's'];
  const currentDate = ref(new Date(props.initialDate));
  const tempSelectedDay = ref(null);
  const selectedDay = ref(null);
  
  const currentMonth = computed(() => currentDate.value.getMonth());
  const currentYear = computed(() => currentDate.value.getFullYear());
  const currentMonthName = computed(() => {
    return currentDate.value.toLocaleString('de-DE', { month: 'long' });
  });
  
  const calendarDays = computed(() => computeCalendarDays(currentMonth.value, currentYear.value));
  
  const computeCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevMonthDays = firstDay.getDay() - 1 >= 0 ? firstDay.getDay() - 1 : 6;
    const nextMonthDays = lastDay.getDay() === 0 ? 0 : 6 - lastDay.getDay();
    const days = [];
  
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(year, month, -i + 1);
      days.push({ date, isCurrentMonth: false });
    }
  
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true });
    }
  
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false });
    }
  
    while (days.length < 42) {
      const date = new Date(year, month + 1, days.length - lastDay.getDate() - prevMonthDays + 1);
      days.push({ date, isCurrentMonth: false });
    }
  
    return days;
  };
  
  const isCurrentDay = (day) => {
    const today = new Date();
    return (
      day.date.getDate() === today.getDate() &&
      day.date.getMonth() === today.getMonth() &&
      day.date.getFullYear() === today.getFullYear() &&
      day.isCurrentMonth
    );
  };
  
  const isPastDay = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return day.date < today && day.isCurrentMonth;
  };
  
  const isDayActive = (day) => {
    if (!day.isCurrentMonth) return false;
    const dateStr = day.date.toISOString().split('T')[0];
    return tempSelectedDay.value === dateStr;
  };
  
  const isDaySelected = (day) => {
    if (!day.isCurrentMonth) return false;
    const dateStr = day.date.toISOString().split('T')[0];
    return selectedDay.value === dateStr;
  };
  
  const selectDay = (day) => {
    if (!day.isCurrentMonth || isPastDay(day)) return;
    const dateStr = day.date.toISOString().split('T')[0];
    tempSelectedDay.value = dateStr;
    selectedDay.value = dateStr;
    
    // إرسال التاريخ بصيغة DD/MM/YY للعرض فقط
    const displayDate = formatDateForDisplay(day.date);
    console.log('📅 CalendarPicker: إرسال تاريخ للعرض:', displayDate);
    emit('select', displayDate);
  };
  
  // دالة لعرض التاريخ بصيغة DD/MM/YY
  const formatDateForDisplay = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // آخر رقمين فقط
    return `${day}/${month}/${year}`;
  };
  
  const prevMonth = () => {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  };
  
  const nextMonth = () => {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  };
  </script>

<style lang="scss" scoped>
.calendar-picker {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.calendar1 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.calendar1 .top-row {
  display: flex;
  padding-bottom: 12px;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  align-self: stretch;
}

.calendar1 .top-row .von {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.8;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  align-self: stretch;
}

.calendar1 .top-row .month {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  margin-bottom: 12px;
}

.calendar1 .top-row .month .arrow-left,
.calendar1 .top-row .month .arrow-right {
  cursor: pointer;
  width: 5px;
  height: 10px;
  aspect-ratio: 1/2;
  stroke-width: 1px;
  stroke: #FFF;
}

.calendar1 .top-row .month .name-month {
  color: var(--Main-Colors-White, #FFF);
  text-align: center;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  position: relative;
  top: 6px;
}

.calendar1 .weekDays {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.calendar1 .weekDays .chart-day {
  width: 30px;
  color: #FFF;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.Current_day {
  color: #FFF !important;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.7;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  position: relative;
  z-index: 2;

  &::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 4px;
    background: #FFF;
    bottom: 0;
    overflow: hidden;
    border-radius: 0 0 5px 5px;
  }
}

.calendar1 .calender-1 {
  display: flex;
  width: 258px;
  align-items: flex-start;
  align-content: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.calendar1 .calender-1 .cal-day {
  display: flex;
  width: 30px;
  height: 30px;
  padding: 4px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 5px;
  opacity: 0.3;
  background: var(--icon);
  color: var(--Main-Colors-Dove);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  cursor: no-drop;
}

.calendar1 .calender-1 .this-month {
  display: flex;
  width: 30px;
  height: 30px;
  padding: 4px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 5px;
  background: var(--icon);
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  opacity: 1;
  cursor: pointer;

  &:hover {
    background: rgba(221, 17, 85, 0.3);
  }
}

.calendar1 .calender-1 .past-day {
  background: var(--Main-Colors-Slate, #26282D);
  cursor: no-drop;
}

.calendar1 .calender-1 .active {
  background: rgba(221, 17, 85, 0.8);
  color: white;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.7;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  position: relative;
}

.calendar1 .calender-1 .selected {
  background: rgba(221, 17, 85, 0.8);
  color: white;
}
</style>
```