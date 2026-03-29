```vue
<template>
  <div class="box-stream">
    <div class="p">Berichte</div>
    <div class="tables">
      
      <div class="column">
        <template v-for="(item, index) in data" :key="index">
          <div class="lines">
            <div class="info-line">
              <div class="info">
                <div class="p">{{ item.release }}</div>
                <div class="p">{{ item.artist }}</div>
              </div>
              <div class="button-primary">Download CSV</div>
              <div class="button-primary">Download PDF</div>
            </div>
          </div>
          <div class="space" v-if="index < data.length - 1"></div>
        </template>
      </div>
    </div>


    <div class="Fade"></div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => [
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      },
      {
        release: "Amet Sollicitudin",
        artist: "Artist Music"
      }
    ]
  }
});
</script>

<style lang="scss" scoped>
.box-stream {
  height: 100%;
  display: flex;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--secondary, #26282D); /* لون احتياطي */
  position: relative;
}

.box-stream .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  align-self: stretch;
}

.tables {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0; /* تصحيح القيمة السلبية */
  flex: 1 0 0;
  align-self: stretch;
}

.Heads {
  display: flex;
  height: 26px;
  padding-bottom: 16px;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  background: linear-gradient(180deg, var(--secondary, #26282D) 50%, rgba(38, 40, 45, 0.00) 100%);
}

.Heads .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.7;
  letter-spacing: 0.7px;
  opacity: 0.7;
  flex: 1 0 0; /* محاذاة مرنة للعناوين */
  text-align: left;
}

.Heads .p:nth-child(3),
.Heads .p:nth-child(4) {
  text-align: center;
  width: 120px; /* عرض ثابت لأعمدة CSV و PDF */
}

.column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px; /* تباعد مناسب بين الأسطر والفواصل */
  flex: 1 0 0;
  align-self: stretch;
  overflow: auto;
  scrollbar-width: none;
  min-height: 200px; 
  padding-bottom: 30px;
}

.column::-webkit-scrollbar {
  display: none; /* إخفاء شريط التمرير في متصفحات Webkit */
}

.lines {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  align-self: stretch;
}

.info-line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  width: 100%;
}

.info-line .info {
  display: flex;
  padding: 0px 8px;
  align-items: center;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
  background: var(--primary, #FFFFFF); /* لون احتياطي للخلفية */
}

.info-line .info .p {
  flex: 1 0 0;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 185%; /* تحسين التباعد بين النصوص */
  letter-spacing: 0.9px;
  opacity: 0.7;
}

.button-primary {
  display: flex;
  padding: 12px 20px 12px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: #FFF;
  font-family: Heebo;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.6;
  cursor: pointer;
}

.button-primary:hover {
  background: var(--dark-red);
  transition: 0.3s ease;
}

.Fade {
  width: 100%;
  height: 64px;
  position: absolute; /* تثبيت العنصر في أسفل .column */
  bottom: 0;
  left: 0;
  background: linear-gradient(0deg, var(--secondary) 30%, rgba(38, 40, 45, 0.00) 100%);
  z-index: 1; /* التأكد من أن .Fade يبقى فوق الأسطر */
  border-radius: 0 0 20px 20px;
}
</style>
```