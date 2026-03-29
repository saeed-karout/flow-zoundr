
<template>

    <div class="main">

        <router-view  :key="$route.fullPath"></router-view>
    </div>
  
</template>

<script setup>

</script>



<style lang="scss" scoped>
    .main{
        overflow: auto;
        scrollbar-width: none;
    }
</style>

