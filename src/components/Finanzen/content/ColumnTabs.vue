<template>
    <div class="column2">
        <div class="youtube">
            <div class="video">
                <img src="/icon/Play-youtube.svg" class="icon" alt="">
            </div>
        </div>
        <div v-for="(tab, index) in tabs" :key="index" :class="['tab-col', { active: activeTab === index }]"
            @click="$emit('set-active-tab', index)">
            <img src="/icon/Left_corner.svg" class="left-corner" alt="">
            <div class="Button">
                <img :src="tab.icon" class="icon-btn" alt="">
                <div class="p">{{ tab.title }}</div>
            </div>
            <img src="/icon/Left_corner.svg" class="right-corner" alt="">
        </div>
    </div>
</template>

<script setup>
defineProps(['tabs', 'activeTab']);
defineEmits(['set-active-tab']);
</script>

<style lang="scss" scoped>
.column2 {
    display: flex;
    width: 240px;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    max-height: 0;
}

.column2 .youtube {
    display: flex;
    height: 143px;
    padding: 0px 0px 20px 20px;
    flex-direction: column;
    align-items: flex-end;
    gap: 7px;
    align-self: stretch;
    aspect-ratio: 240/143;
}

.youtube .video {
    display: flex;
    width: 220px;
    height: 123px;
    padding: 39px 83px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    aspect-ratio: 220/123;
    border-radius: 20px;
    background: var(--secondary);
}

.youtube .video .icon {
    width: 44px;
    height: 40px;
    flex-shrink: 0;
    fill: var(--selvar);
}

.youtube:hover .video .icon {
    filter: brightness(0) invert(1);
}

.tab-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    flex: 1 0 0;
    align-self: stretch;
    position: relative;
}

.tab-col .left-corner,
.tab-col .right-corner {
    display: none;
    position: absolute;
    width: 20px;
    height: 20px;
    fill: var(--Main-Colors-Slate, #26282D);
    z-index: 10;
}

.tab-col .left-corner {
    top: -20px;
}

.tab-col .right-corner {
    bottom: -19px;
    transform: rotate(90deg);
}

.tab-col:nth-child(7) .right-corner {
    bottom: 0px;
    left: -20px;
    transform: rotate(270deg);
}

.tab-col.active .Button,
.tab-col:hover .Button {
    background: var(--secondary);
    border-radius: 0 20px 20px 0;
    cursor: pointer;
}

.tab-col.active .Button .p,
.tab-col:hover .Button .p {
    color: #FFF;
}

.tab-col.active .Button .icon-btn,
.tab-col:hover .Button .icon-btn {
    filter: brightness(0) invert(1);
}

.tab-col.active .left-corner,
.tab-col.active .right-corner,
.tab-col:hover .left-corner,
.tab-col:hover .right-corner {
    display: block;
}

.tab-col .Button {
    display: flex;
    padding: 14.75px 30px;
    align-items: center;
    gap: 20px;
    align-self: stretch;
    background: var(--primary);
    border-radius: 0;
}

.tab-col .Button .icon-btn {
    display: flex;
    padding: 2.5px 2px;
    align-items: center;
    gap: 10px;
}

.tab-col .Button .p {
    color: var(--selvar);
    font-family: 'Heebo';
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 0.8;
    text-transform: uppercase;
}

img,
svg {
    vertical-align: 0;
}



@media (min-width:1440px) and (max-width:1599px) {
        .column2{
            width: 180px;
            // max-width: 206px;
        }
        


        

  .youtube .video{
    height: 105px;
    width: 160px;
    padding:39px 75px;
  }

  .tab-col .Button{
    display: flex;
padding: 14px 20px;
align-items: center;
gap: 16px;
align-self: stretch;
max-height: 53px;
  }


  .tab-col .Button .p{
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
  }
}


@media (min-height:1062px) {
  .tab-col:nth-child(7) .right-corner{
    bottom: -19px;
    left: 0;
    rotate: 180deg;
  }
}

@media (min-width:1440px) and (max-width:1599px){
    @media (min-height:970px) {
  .tab-col:nth-child(7) .right-corner{
    bottom: -19px;
    left: 0;
    rotate: 180deg;
  }
}
}
</style>