```vue
<template>
  <div class="tab-content">
    <div class="section">
      <div class="p">Deine Top Songs</div>
      <div class="top-song">
        <div class="music-title" v-for="i in 20" :key="i">
          <div class="background-layer"></div>
          <div class="number-container">
            <div :class="i === 1 ? 'number-1' : 'number'">{{ i }}.</div>
          </div>
          <div class="image-overlay">
            <div class="info">
              <div class="title">
                <div class="sub-title">Artist Music</div>
               <span>At malesuada quamus</span>
              </div>
              <div class="numbers">
                <div class="p">518,73 EUR</div>
                <div class="p">13,42 %</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tab-content {
  display: flex;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 20px;
  width: 100%;
  max-width: 100%;
}

.section {
  display: flex;
  padding: 20px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  flex: 1 0 0;
  border-radius: 0 20px 20px 20px;
  background: var(--Main-Colors-Slate, #26282D);
  position: relative;
  width: 100%;
  max-width: 100%;
}

.section .p {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  padding-top: 3px;
  z-index: 111;
}

.top-song {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  overflow-x: auto;
  padding-right: 80px;
  scrollbar-width: none;

  border-radius: 20px;
  flex-wrap: nowrap;
  min-width: auto;
}



.music-title {
  display: flex;
  width: 207px;
  height: 207px;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  isolation: isolate;
  flex-shrink: 0;
}

.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: url('../../../assets/icons/catalog/releases/2.jpg') 50% / cover no-repeat;
  filter: saturate(var(--saturation, 20%));
  transition: filter 0.6s ease;
  z-index: 1;
}

.music-title:hover .background-layer {
  filter: saturate(70%);
}

.image-overlay {
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background: url('../../../assets/icons/dashboard/user/shadow.png') 50% / cover no-repeat;
  position: relative;
  z-index: 2;
  isolation: isolate;
}

.number-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  isolation: isolate;
}

.number,
.number-1 {
  display: flex;
  width: 26px;
  padding: 8px 6px;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  border-radius: 13px;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 0.6;
  transition: opacity 0.3s ease;
  z-index: 3;
}

.number-1 {
  background: var(--Strawberry);
}

.number {
  background: var(--secondary);
}

.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
}

.info .title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
}

.title .sub-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  color: var(--Main-Colors-White, #FFF);
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.6;
  text-transform: uppercase;
  opacity: 0.3;
  transition: opacity 0.3s ease;
}


.title span{
 overflow: hidden;
color: var(--Main-Colors-White, #FFF);
text-overflow: ellipsis;
font-family: Heebo;
font-size: 18px;
font-style: normal;
font-weight: 700;
line-height: .9;
text-transform: uppercase;
display: -webkit-box;
-webkit-box-orient: vertical;
-webkit-line-clamp: 1;
align-self: stretch;
opacity: .7;
}

.numbers{
  display: flex;
justify-content: space-between;
align-items: center;
align-self: stretch;
}
.info .p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.6;
  opacity: 0.7;
  padding-top: 2px;
  transition: opacity 0.3s ease;
}

.music-title:hover .sub-title,
.music-title:hover span,
.music-title:hover .info .p,
.music-title:hover .number,
.music-title:hover .number-1 {
  opacity: 1;
}


@media (min-width:1440px) and (max-width:1599px) {
    .music-title {
      width: 160px;
      height: 160px;
    }

    .title .sub-title{
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1;

    }

    .title .sub-title{
      font-size: 14px;
       overflow: hidden;
      text-overflow: ellipsis;
    }


    .info .p{
      font-size: 12px;
    }

    .title  span{
      font-size: 17px;
      line-height: .9;
    }


   
}
</style>
```