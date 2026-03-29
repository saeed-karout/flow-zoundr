```vue
<template>
  <div class="box-stream">
    <div class="p">Details</div>
    <div class="tables">
      <div class="Heads">
        <div class="p">Release</div>
        <div class="p">Artist</div>
        <div class="p">Streams</div>
        <div class="p">Downloads</div>
        <div class="p">Physisch</div>
        <div class="p">Einnahmen</div>
      </div>
      <div class="column">
        <template v-for="(item, index) in data" :key="index">
          <div class="line">
        
            <div class="p">{{ item.Release }}</div>
            <div class="p">{{ item.Artist }}</div>
            <div class="p">{{ item.Streams }}</div>
            <div class="p">{{ item.Downloads }}</div>
            <div class="p">{{ item.Physisch }}</div>
            <div class="p">{{ item.Einnahmen }}</div>
          </div>
          <div class="space" v-if="index < data.length - 1"></div>
        </template>
      </div>
    </div>

    <div class="Fade">

    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Array,
    default: () => [
      {
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },
      {
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },{
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },{
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },{
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },{
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },{
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },{
        Release: "Amet Sollicitudin",
        Artist: "Artist Music",
        Streams: "165.304.203",
        Downloads: "34.002.232",
        Physisch: "152.304",
        Einnahmen: "1.302,94 EUR"
      },
      
    ]
  }
});
</script>
<style lang="scss" scoped>
.box-stream {
  display: flex;
  height: 100%;
  padding: 20px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 32px;
  flex: 1 0 0;
  border-radius: 20px;
  background: var(--secondary, #26282d);
  position: relative;
}

.box-stream .p {
  color: #fff;
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
  gap: 0;
  flex: 1 0 0;
  align-self: stretch;
}

.tables .Heads {
  display: flex;
  padding-bottom: 16px;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  background: linear-gradient(
    180deg,
    var(--Main-Colors-Slate, #26282d) 50%,
    rgba(38, 40, 45, 0) 100%
  );
}

.tables .Heads .p {
  color: #fff;
  text-align: right;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.7;
  letter-spacing: 0.7px;
  width: 140px;
  opacity: 0.7;
}

.tables .Heads .p:nth-child(1) {
  text-align: left;
  width: 120px;
}

.tables .Heads .p:nth-child(2) {
  flex: 1 0 0;
  text-align: left;
}

.tables .Heads .p:nth-child(6) {
  text-align: right;
}

.tables .column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  flex: 1 0 0;
  align-self: stretch;
  gap: 20px;
  padding-top: 14px;
  overflow: auto;
  scrollbar-width: none;
  position: relative; 
  padding-bottom: 30px;
}

.tables .column::-webkit-scrollbar {
  display: none;
}

.line {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  align-self: stretch;
//   padding: 14px 0;
}

.line:nth-child(1) {
  padding-top: 0;
}

.line .p {
  color: #fff;
  font-family: Heebo;
  text-align: right;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 0.7;
  letter-spacing: 0.9px;
  opacity: 0.7;
  width: 140px;
}

.line .p:nth-child(1) {
  text-align: left;
  width: 120px;
  font-weight: 700;
}

.line .p:nth-child(2) {
  flex: 1 0 0;
  text-align: left;
  font-weight: 700;
}

.line .p:nth-child(6) {
  opacity: 1;
  font-weight: 700;
  text-align: right;
  text-transform: none;
}

.space {
  width: 100%;
  height: 2px; /* Increased height for visibility */
  background: var(--primary, #ffffff); /* Ensure fallback is pure white */
  opacity: 1; /* Ensure full visibility */
  padding: .5px 0 0 0;
}

.Fade {
  width: 100%;
  height: 64px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: linear-gradient(0deg, var(--secondary, #26282d) 30%, rgba(38, 40, 45, 0) 100%);
  z-index: 1;
  border-radius: 0 0 20px 20px;
}


@media (max-width:1599px) {

  .line .p{
    font-size: 14px;
    letter-spacing: .7px;
    width: 100px;
  }

  .tables .Heads .p{
    width: 100px;
    font-size: 14px;
    letter-spacing: .7px;
  }

  

  .tables .Heads .p:nth-child(1),.line .p:nth-child(1) {
  text-align: left;
  min-width: 150px;
}


.tables .Heads .p:nth-child(2),.line .p:nth-child(2){
  flex: 1 1 0;
  width: auto;
}


.tables .Heads .p:nth-child(6),.line .p:nth-child(6){
  width: 120px;
}
}


@media (min-width:1600px) {
   .tables .Heads .p:nth-child(1),.line .p:nth-child(1) {
  text-align: left;
  min-width: 188px;
}


 .line .p{
    font-size: 18px;
    letter-spacing: .7px;
    width: 120px;
  }

  .tables .Heads .p{
    width: 120px;
    font-size: 18px;
    letter-spacing: .9px;
  }

}


</style>