<template>
  <div class="box-stream">
    <div class="p">Gutschriften</div>
    <div class="tables">
      <div class="Heads">
        <div class="p">#</div>
        <div class="p">Datum</div>
        <div class="p">Betrag Netto</div>
        <div class="p">MwSt.</div>
        <div class="p">Betrag Brutto</div>
        <div class="p">Status</div>
        <div class="p">PDF</div>
      </div>
      <div class="column">
        <template v-for="(item, index) in data" :key="index">
          <div class="line">
            <div class="p">{{ item.id }}</div>
            <div class="p">{{ item.date }}</div>
            <div class="p">{{ item.netAmount }}</div>
            <div class="p">{{ item.vat }}</div>
            <div class="p">{{ item.grossAmount }}</div>
            <div class="p">
                <span v-if="item.status !== 'Done'">{{ item.status }}</span>
                <img v-else src="../../../assets/icons/y.png" class="icon" alt="">
            </div>
            <div class="download">Download</div>
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
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Offen",
      },
      {
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Offen",
      },
      {
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Done",
      },
      {
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Offen",
      },
      {
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Offen",
      },
      {
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Done",
      },
      {
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Offen",
      },
      {
        id: "G1208",
        date: "02.04.2023",
        netAmount: "1.302,94 EUR",
        vat: "91,21 EUR",
        grossAmount: "1.394,15 EUR",
        status: "Offen",
      },
    ],
  },
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
  align-items: center;
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
  line-height: 1;
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
  text-align: center;
}

.tables .Heads .p:nth-child(7) {
  width: 102px;
  text-align: right;
}

.tables .column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  flex: 1 0 0;
  align-self: stretch;
  padding-top: 14px;
  padding-bottom: 30px; /* Match .Fade height */
  overflow: auto;
  scrollbar-width: none;
  position: relative;
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
  
  
}

.line:nth-child(1) {
  padding-top: 0;
}

.line .p {
  color: #fff;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  opacity: 0.7;
  width: 140px;
  display: flex;
  align-items: center;

}

.line .p:nth-child(1) {
  text-align: left;
  width: 120px;
}

.line .p:nth-child(2) {
  flex: 1 0 0;
  text-align: left;
}

.line .p:nth-child(3),
.line .p:nth-child(4),
.line .p:nth-child(5) {
  text-align: right; /* Explicitly right-align */
  justify-content: flex-end; /* Ensure text is pushed to the right in flex */
}

.line .p:nth-child(5) {
  opacity: 1;
  font-weight: 700;
}

.line .p:nth-child(6) {
  text-align: center; /* Center-align status */
  justify-content: center; /* Ensure text is centered in flex */
  text-transform: none;
}

.line .download {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  background: var(--Main-Colors-Slate-Light, #3a3e42);
  color: #fff;
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 300;
  line-height: 1;
  width: 102px;
  padding: 4px 20px;
  text-align: right; /* Match header alignment */
  cursor: pointer;
}

.line .download:hover {
  background: var(--dark-red, #a11212);
  transition: 0.3s ease;
}

.space {
  width: 100%;
  height: 1px;
  background: var(--primary, #ffffff);
  opacity: 1;
  padding: .5px 0 0 0;
  margin: 15px 0;
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

@media (min-width:1440px) and (max-width:1599px) {
    .tables .Heads .p,.line .p{
      width: 95px;
      font-size: 14px;
    }

    .line .p:nth-child(1) {
  text-align: left;
  width: 75px;
}


.tables .Heads .p:nth-child(1) {
  text-align: left;
  width: 75px;
}

.tables .Heads .p:nth-child(3),.line .p:nth-child(3),.tables .Heads .p:nth-child(5),.line .p:nth-child(5){
width: 120px;
}


.line .download ,.tables .Heads .p:nth-child(7) {
  width: 90px;
  text-align: right;
}
}

</style>