<template>
    <div class="box-stream">
        <div class="p">Stores</div>
        <div class="bar"></div>
        <div class="dates"></div>
        <div class="number">157.82</div>
    </div>
</template>

<script setup>
defineProps(['data']);
</script>

<style lang="scss" scoped>
.box-stream {
    height: 100%;
    display: flex;
    padding: 20px 30px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    flex: 1 0 0;
    border-radius: 20px;
    background: var(--secondary);
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

.box-stream .bar {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: -258px;
    align-self: stretch;
}

.box-stream .dates {
    display: flex;
    padding-bottom: 10px;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
}

.box-stream .list {
    color: #FFF;
    font-family: Heebo;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5;
    list-style: none;
    padding: 0;
    align-self: stretch;
}

.box-stream .number {
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
}
</style>