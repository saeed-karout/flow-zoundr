<!-- components/modals/ConfirmDeletePopup.vue -->
<template>
  <Teleport to="body">
    <div v-if="show" class="confirm-popup-overlay" @click.self="handleCancel">
      <div class="confirm-popup">
        

        <div class="top-line">
          <div class="popup-title">{{ title || 'Song Wirklich Löschen?' }}</div>
          <div class="sub-title">
            {{ message || 'Wenn Du Diesen Song löscht, ist dies unwiderruflich. Du kannst den Song aber erneut anlegen.' }}
          </div>

        </div>

        <div class="popup-footer">
          <div class="popup-btn cancel" @click="handleCancel">
           <span>
            Abbrechen
           </span>  
          </div>
          <div class="popup-btn confirm" @click="handleConfirm">
           <span>
            Löschen
           </span> 
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  songTitle: {
    type: String,
    default: ''
  },
  songUuid: {
    type: String,
    default: ''
  },
  // نصوص اختيارية لإعادة استخدام البوب اب في سياقات أخرى (مثل حذف Entwurf/Release)
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm', props.songUuid);
};

const handleCancel = () => {
  emit('cancel');
};

// منع التمرير عند فتح البوب أب
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style lang="scss" scoped>
.confirm-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.confirm-popup {
  display: flex;
  width: 560px;
  padding: 52px 32px 40px 32px;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
  flex-shrink: 0;
  animation: slideUp 0.3s ease;
  border-radius: 20px;
  border: 2px solid var(--Main-Colors-Strawberry, #D15);
  background: var(--Main-Colors-Slate, #26282D);
}


.top-line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 28px;
  align-self: stretch;

  .popup-title {
    color: var(--Main-Colors-Strawberry, #D15);
    text-align: center;
    font-family: Heebo;
    align-self: stretch;
    font-size: 28px;
    font-style: normal;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;
  }


  .sub-title{
    /* يحفظ 
 في الرسالة فتُعرض على سطرين، دون أن يتغيّر شيء
       للرسائل المكتوبة على سطر واحد (حذف الأغنية في FirstSection). */
    white-space: pre-line;
    color: var(--Main-Colors-White, #FFF);
text-align: center;
font-family: Heebo;
font-size: 18px;
font-style: normal;
font-weight: 300;
line-height: normal;
align-self: stretch;
  }

}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: absolute;
  top: 20px;
  right: 20px;
}

.popup-icon {
  font-size: 40px;
  line-height: 1;
}

.popup-close {
  background: none;
  border: none;
  color: var(--Main-Colors-Dove, #6A6C6D);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-close:hover {
  color: #FFF;
  background: rgba(255, 255, 255, 0.1);
}

.popup-body h3 {
  color: #FFF;
  font-family: Heebo;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
}

.popup-body p {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
  margin-bottom: 8px;
}

.popup-body p strong {
  color: var(--Strawberry, #D15);
  font-weight: 600;
}

.popup-warning {
  color: #FF9800 !important;
  font-size: 14px !important;
  margin-top: 12px !important;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.popup-footer {
  display: flex;
padding-top: 24px;
justify-content: space-between;
align-items: flex-start;
align-self: stretch;
}

.popup-btn {
  display: flex;
width: 160px;
padding: 12px 20px 13px 20px;
justify-content: center;
align-items: center;
gap: 10px;
border-radius: 5px;
background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
  transition: all 0.3s ease;


  span{
    color: var(--Main-Colors-White, #FFF);
font-family: Heebo;
font-size: 16px;
font-style: normal;
font-weight: 400;
line-height: .9;
text-transform: uppercase;
  }
}

.popup-btn.cancel {
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  color: var(--Main-Colors-White, #FFF);
}

.popup-btn.cancel:hover {
  background: #990033;
}

.popup-btn.confirm {
  background: var(--Strawberry, #D15);
  color: white;
}

.popup-btn.confirm:hover {
  background: #990033;
  
}

.popup-btn.confirm:active {
  transform: scale(1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 1599px) {
  .confirm-popup {
    padding: 24px;
   
  }

  .popup-body h3 {
    font-size: 18px;
  }

  .popup-body p {
    font-size: 14px;
  }
}
</style>