<template>
  <div v-if="isOpen" class="backdrop" @click="closeDropdown"></div>
  <div class="zeitraum-combo-box-container" @click.stop="toggleDropdown">
    <div class="zeitraum-combo-box" :style="{
      borderRadius: isOpen ? '20px 20px 0 0' : '20px',
      '--show-after': isOpen ? 'block' : 'none',
      '--show-before': isOpen ? 'block' : 'none',
      cursor: 'pointer'
    }">
      <div class="frage">
        <div class="text">
          <div class="p">{{ currentTitle }}</div>
        </div>
        <img src="/icon/click-down.svg" class="icon" :style="{ transform: isOpen ? 'rotate(180deg)' : '' }"
          alt="dropdown icon">
      </div>
      <div v-if="isOpen" class="dropdown" @click.stop>
        <div class="column1">
          <div v-for="item in zeitraumItems" :key="item.value" class="nav-sub-menu" @click="selectItem(item)">
            <div :class="['indictor', { active: tempSelectedItem === item.value }]">
              <svg v-if="tempSelectedItem === item.value" xmlns="http://www.w3.org/2000/svg" width="4"
                height="5" viewBox="0 0 4 5" fill="none">
                <circle cx="2" cy="2" r="2" transform="matrix(1 0 0 -1 0 4.14282)" fill="#DD1155" />
              </svg>
            </div>
            <div class="p">{{ item.label }}</div>
          </div>
        </div>
        <div class="calendar1">
          <div class="top-row">
            <div class="von">Von:</div>
            <div class="month">
              <div class="arrow-left" @click.stop="prevMonth('von')">
                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
                  <path d="M6 11L1 6L6 1" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="name-month">{{ currentMonthNameVon }} {{ currentYearVon }}</div>
              <div class="arrow-right" @click.stop="nextMonth('von')">
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
            <div v-for="(day, index) in calendarDaysVon" :key="index" :class="['cal-day', {
              'this-month': day.isCurrentMonth,
              'active': isDayActive(day, 'von'),
              'custom-disabled': !isCustomMode,
              'future-disabled': isFutureDay(day),
              'Current_day': isCurrentDay(day)
            }]" @click.stop="selectDay(day, 'von')">
              {{ day.date.getDate() }}
            </div>
          </div>
        </div>
        <!-- calender2 -->
        <div class="calendar1">
          <div class="top-row">
            <div class="von">Bis:</div>
            <div class="month">
              <div class="arrow-left" @click.stop="prevMonth('bis')">
                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
                  <path d="M6 11L1 6L6 1" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="name-month">{{ currentMonthNameBis }} {{ currentYearBis }}</div>
              <div class="arrow-right" @click.stop="nextMonth('bis')">
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
            <div v-for="(day, index) in calendarDaysBis" :key="index" :class="['cal-day', {
              'this-month': day.isCurrentMonth,
              'active': isDayActive(day, 'bis'),
              'custom-disabled': !isCustomMode,
              'future-disabled': isFutureDay(day),
              'Current_day': isCurrentDay(day)
            }]" @click.stop="selectDay(day, 'bis')">
              {{ day.date.getDate() }}
            </div>
          </div>
        </div>
        <div class="CTAs">
          <div class="Button-primary" @click.stop="clearSelection">Löschen</div>
          <div class="Button-primary" style="background: var(--move);" @click.stop="applySelection">Anwenden</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  title: String,
});

const emit = defineEmits(['select']);

// ========== المتغيرات الأساسية ==========
const isOpen = ref(false);
const currentTitle = ref(props.title || 'Zeitraum');

// الفلتر النشط (المرسل للـ API)
const activeFilter = ref('last_28_days');

// الفلتر المؤقت (الذي يتم تعديله في الـ dropdown)
const tempSelectedItem = ref('last_28_days');

// التواريخ المؤقتة
const currentDateVon = ref(new Date());
const currentDateBis = ref(new Date());
const tempSelectedDaysVon = ref([]);
const tempSelectedDaysBis = ref([]);
const activeRange = ref({ startDate: null, endDate: null });

const weekDays = ['m', 'd', 'm', 'd', 'f', 's', 's'];

// ========== العناصر ==========
const zeitraumItems = [
  { label: 'die letzten 7 Tage', value: 'last_7_days' },
  { label: 'die letzten 14 Tage', value: 'last_14_days' },
  { label: 'die letzten 28 Tage', value: 'last_28_days' },
  { label: 'die letzten 90 Tage', value: 'last_90_days' },
  { label: 'Dieser Monat', value: 'this_month' },
  { label: 'Letzter Monat', value: 'last_month' },
  { label: 'Das letzte jahr', value: 'last_year' },
  { label: 'Individuell', value: 'custom' },
];

// ========== دوال التقويم ==========
const currentMonthVon = computed(() => currentDateVon.value.getMonth());
const currentYearVon = computed(() => currentDateVon.value.getFullYear());
const currentMonthNameVon = computed(() => {
  return currentDateVon.value.toLocaleString('default', { month: 'long' });
});

const currentMonthBis = computed(() => currentDateBis.value.getMonth());
const currentYearBis = computed(() => currentDateBis.value.getFullYear());
const currentMonthNameBis = computed(() => {
  return currentDateBis.value.toLocaleString('default', { month: 'long' });
});

const calendarDaysVon = computed(() => computeCalendarDays(currentMonthVon.value, currentYearVon.value));
const calendarDaysBis = computed(() => computeCalendarDays(currentMonthBis.value, currentYearBis.value));
const isCustomMode = computed(() => tempSelectedItem.value === 'custom');

const computeCalendarDays = (month, year) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevMonthDays = firstDay.getDay() - 1;
  const nextMonthDays = 6 - lastDay.getDay();
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

const isFutureDay = (day) => {
  const today = new Date();
  const dayDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dayDate > todayDate;
};

const isDayActive = (day, calendarType) => {
  if (!day.isCurrentMonth) return false;
  const dateStr = day.date.toISOString().split('T')[0];
  if (calendarType === 'von') {
    return tempSelectedDaysVon.value.includes(dateStr);
  }
  return tempSelectedDaysBis.value.includes(dateStr);
};

const selectDay = (day, calendarType) => {
  if (!day.isCurrentMonth || !isCustomMode.value || isFutureDay(day)) return;

  const dateStr = day.date.toISOString().split('T')[0];

  if (calendarType === 'von') {
    tempSelectedDaysVon.value = [dateStr];
    if (tempSelectedDaysBis.value[0] && tempSelectedDaysBis.value[0] < dateStr) {
      tempSelectedDaysBis.value = [dateStr];
    }
  } else {
    tempSelectedDaysBis.value = [dateStr];
    if (tempSelectedDaysVon.value[0] && tempSelectedDaysVon.value[0] > dateStr) {
      tempSelectedDaysVon.value = [dateStr];
    }
  }
};

const prevMonth = (calendarType) => {
  if (calendarType === 'von') {
    currentDateVon.value = new Date(currentYearVon.value, currentMonthVon.value - 1, 1);
  } else {
    currentDateBis.value = new Date(currentYearBis.value, currentMonthBis.value - 1, 1);
  }
};

const nextMonth = (calendarType) => {
  if (calendarType === 'von') {
    currentDateVon.value = new Date(currentYearVon.value, currentMonthVon.value + 1, 1);
  } else {
    currentDateBis.value = new Date(currentYearBis.value, currentMonthBis.value + 1, 1);
  }
};

// ========== تحديث عنوان الفلتر بناءً على الفلتر النشط ==========
const updateTitle = () => {
  const selectedItem = zeitraumItems.find(item => item.value === activeFilter.value);
  currentTitle.value = selectedItem ? `Zeitraum | ${selectedItem.label}` : 'Zeitraum';
};

// ========== دوال القائمة المنسدلة ==========
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    currentTitle.value = 'Zeitraum';
    // نسخ الفلتر النشط إلى المؤقت
    tempSelectedItem.value = activeFilter.value;
    tempSelectedDaysVon.value = activeRange.value.startDate ? [activeRange.value.startDate] : [];
    tempSelectedDaysBis.value = activeRange.value.endDate ? [activeRange.value.endDate] : [];
    
    // إعادة تعيين التواريخ إلى الحالية إذا كانت فارغة
    if (tempSelectedDaysVon.value.length === 0 && tempSelectedItem.value === 'custom') {
      tempSelectedDaysVon.value = [];
      tempSelectedDaysBis.value = [];
    }
  } else {
    updateTitle();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  updateTitle();
  // إعادة التواريخ المؤقتة للقيم المطبقة
  tempSelectedDaysVon.value = activeRange.value.startDate ? [activeRange.value.startDate] : [];
  tempSelectedDaysBis.value = activeRange.value.endDate ? [activeRange.value.endDate] : [];
  // إعادة تعيين الفلتر المؤقت إلى الفلتر النشط
  tempSelectedItem.value = activeFilter.value;
};

const selectItem = (item) => {
  tempSelectedItem.value = item.value;
};

// ========== تطبيق الفلتر ==========
const applySelection = () => {
  const selectedItem = zeitraumItems.find(item => item.value === tempSelectedItem.value);
  
  if (selectedItem) {
    // تحديث الفلتر النشط
    activeFilter.value = selectedItem.value;

    if (selectedItem.value === 'custom') {
      const startDate = tempSelectedDaysVon.value[0] || null;
      const endDate = tempSelectedDaysBis.value[0] || null;
      const today = new Date().toISOString().slice(0, 10);

      if (!startDate || !endDate) {
        console.warn('⚠️ اختر تاريخ من وتاريخ إلى قبل تطبيق الفلتر المخصص');
        return;
      }

      if (startDate > endDate) {
        console.warn('⚠️ تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
        return;
      }

      if (startDate > today || endDate > today) {
        console.warn('⚠️ لا يمكن اختيار تاريخ بعد اليوم');
        return;
      }

      activeRange.value = { startDate, endDate };
      console.log('📅 تطبيق الفلتر المخصص:', startDate, endDate);
      emit('select', {
        type: 'custom',
        startDate,
        endDate
      });

      updateTitle();
      isOpen.value = false;
      return;
    }

    activeRange.value = { startDate: null, endDate: null };
    
    // تحويل القيم إلى ما يتوقعه الـ API
    let filterValue = selectedItem.value;
    if (filterValue === '7days') filterValue = 'last_7_days';
    else if (filterValue === '14days') filterValue = 'last_14_days';
    else if (filterValue === '28days') filterValue = 'last_28_days';
    else if (filterValue === '90days') filterValue = 'last_90_days';
    
    console.log('📅 تطبيق الفلتر:', filterValue);
    
    // إرسال الفلتر إلى المكون الأب
    emit('select', filterValue);
  }
  
  // تحديث العنوان
  updateTitle();
  
  // إغلاق القائمة
  isOpen.value = false;
  
  // إعادة تعيين التواريخ المؤقتة
  tempSelectedDaysVon.value = [];
  tempSelectedDaysBis.value = [];
};

const clearSelection = () => {
  // إعادة تعيين الفلتر المؤقت إلى الفلتر النشط
  tempSelectedItem.value = activeFilter.value;
  // مسح التواريخ المؤقتة
  tempSelectedDaysVon.value = activeRange.value.startDate ? [activeRange.value.startDate] : [];
  tempSelectedDaysBis.value = activeRange.value.endDate ? [activeRange.value.endDate] : [];
};

// ========== إغلاق القائمة عند النقر خارجها ==========
const handleClickOutside = (event) => {
  // التحقق إذا كان النقر داخل الـ dropdown أو على العناصر المرتبطة به
  const isClickInside = event.target.closest('.zeitraum-combo-box') || 
                        event.target.closest('.backdrop') ||
                        event.target.closest('.dropdown');
  
  if (!isClickInside && isOpen.value) {
    closeDropdown();
  }
};

// ========== دورة حياة المكون ==========
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  updateTitle();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
.zeitraum-combo-box-container {
  position: relative;
  flex: 1;
  z-index: 1000;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(27, 28, 32, 0.8);
  z-index: 999;
  cursor: pointer;
}

.zeitraum-combo-box {
  display: flex;
  height: 40px;
  padding: 12px 20px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
  flex: 1 0 0;
  background: var(--secondary);
  position: relative;
  box-sizing: border-box;

  &::before {
    content: '1';
    position: absolute;
    width: calc(100% + 20px);
    height: 30px;
    background: var(--secondary);
    bottom: -30px;
    left: 0;
    display: var(--show-before);
  }

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: var(--primary);
    bottom: -20px;
    right: -20px;
    display: var(--show-after);
    align-self: flex-end;
    align-items: end;
    justify-content: end;
    z-index: 5;
    border-radius: 0 0 0 20px;
  }
}

.zeitraum-combo-box .frage {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  border-radius: 5px;
  cursor: pointer;
}

.zeitraum-combo-box .frage .text {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
}

.zeitraum-combo-box .frage .text .p {
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 120%;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  flex: 1 0 0;
}

.zeitraum-combo-box .frage .icon {
  width: 14px;
  height: 10px;
  aspect-ratio: 7/5;
  fill: #fff;
  transition: transform 0.3s ease;
}

.dropdown {
  position: fixed;
  top: calc(81px + 70px);
  left: 300px;
  right: 80px;
  max-width: 100%;
  background: var(--secondary);
  padding: 32px;
  border-radius: 0 20px 20px 20px;
  z-index: 11100;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
  animation: slideIn 0.3s ease forwards;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.2);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.column1 {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
}

.column1 .nav-sub-menu {
  display: flex;
  width: 220px;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.indictor {
  display: flex;
  width: 20px;
  height: 20px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--primary);
}

.indictor.active {
  border: 1px solid var(--Strawberry);
}

.indictor.active svg {
  width: 4px;
  height: 4px;
  flex-shrink: 0;
  fill: var(--Strawberry);
}

.column1 .nav-sub-menu .p {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  flex: 1 0 0;
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
  line-height: .8;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  align-self: stretch;
}

.calendar1 .top-row .month {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  align-self: stretch;
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
  line-height: .8;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.calendar1 .weekDays {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.calendar1 .weekDays .chart-day {
  width: 30px;
  color: var(--Main-Colors-Dove, #6A6C6D);
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}

.Current_day {
  color: #FFF !important;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .7;
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
  line-height: .8;
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
  line-height: .8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  opacity: 1;
  cursor: pointer;

  &:hover {
    background: rgba(221, 17, 85, 0.3);
  }
}

.calendar1 .calender-1 .active {
  background: rgba(221, 17, 85, 0.8);
  color: white;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: .7;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  position: relative;
}

.calendar1 .calender-1 .custom-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar1 .calender-1 .future-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.CTAs {
  display: flex;
  justify-content: flex-end;
  align-items: end;
  gap: 20px;
}

.CTAs .Button-primary {
  display: flex;
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--icon);
  color: white;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: normal;
  line-height: .8;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: var(--dark-red);
    z-index: 5;
  }
}
</style>