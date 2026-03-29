<template>
  <div class="error-container">
    <!-- العنوان -->
    <h1 class="title">OOPS!</h1>

    <!-- الرسالة الأولى -->
    <p class="message message-first">
      Dieses Tool ist nur einem Computer verfügbar. Wenn Du das hier siehst, passt Deine Anzeige-Einstellung leider nicht zu unserem Tool.
    </p>

    <!-- الرسالة الثانية -->
    <p class="message message-second">
      Du kannst Deine Anzeige jetzt ganz einfach verändern und für Dich anpassen:
    </p>

    <!-- قسم التعليمات -->
    <div class="instructions">
      <img src="../assets/images/SC_Mac.png" alt="Mac instructions">
      <img src="../assets/images/SC_PC.png" alt="PC instructions">
    </div>

    <!-- الرسالة الأخيرة -->
    <p class="message message-last">
      Wiederhole diese Tastenkombination so oft, bis das Tool zu sehen ist.
    </p>
  </div>
</template>

<script setup>
// لا يوجد منطق إضافي مطلوب لهذا المكون
</script>

<style scoped>
.error-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: var(--primary-color);
  padding: 0 16px;
}

.title {
  font-size: 2.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

@media (min-width: 768px) {
  .title {
    font-size: 3rem;
  }
}

.message {
  text-align: center;
  max-width: 42rem;
  margin-bottom: 1.5rem;
}

.message-first {
  font-size: 1rem;
}

.message-second {
  font-size: 0.875rem;
}

.message-last {
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .message-first {
    font-size: 1.125rem;
  }
  
  .message-second,
  .message-last {
    font-size: 1rem;
  }
}

.instructions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .instructions {
    flex-direction: row;
  }
  
  .instructions img:not(:last-child) {
    margin-right: 2rem;
  }
}
</style>