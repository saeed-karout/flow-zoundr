<template>
  <div class="content">
    <div class="item" @click="goToDashboard">
      <div class="image">
        <img src="../../assets/icons/dashboard/plus.svg" alt="plus image" />
      </div>
      <div class="text">Ersten Release anlegen</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToDashboard = () => {
  router.push("/create-release");
};
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  height: calc(100vh - 71px - 50px); // Match Dashboard.vue height
  background: var(--secondary, #26282d); // Match Dashboard.vue background
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  border-radius: 20px;
}

.item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 20px;
  border-radius: 20px;
  
  cursor: pointer;
 
}



.image img {
  width: 84px;
  height: 84px;
  fill: var(--Main-Colors-Dove, #6a6c6d);
}

.item:hover .image img {
  filter: brightness(0) invert(1); // Match Dashboard.vue hover effect
}

.text {
  align-self: stretch;
  color: #fff;
  text-align: center;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.9px;
  text-transform: uppercase;
}
</style>