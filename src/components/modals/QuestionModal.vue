<template>
  <div>
    <!-- النافذة الأصلية لإدخال السؤال -->
    <div class="modal fade" :id="modalId" tabindex="-1" :aria-labelledby="modalId + 'Label'" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <button type="button" class="btn-closee" data-bs-dismiss="modal" aria-label="Close"></button>
          <div class="modal-header">
            <h5 class="modal-title" :id="modalId + 'Label'">{{ reference === 'KONTAKT_FLOW' ? 'WIE KÖNNEN WIR DIR HELFEN?' : 'FAQ - STELLE DEINE FRAGE' }}</h5>
          </div>
          <div class="modal-body">
            <p>{{ reference === 'KONTAKT_FLOW' ? 'Trage hier Deine Frage ein und wir werden uns zeitnah bei Dir melden!' : 'Stelle uns Deine Frage zu den FAQs!' }}</p>
            <textarea :placeholder="reference === 'KONTAKT_FLOW' ? 'Deine Frage...' : 'Deine FAQ-Frage...'" v-model="question"></textarea>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="confirm-btn"
              :class="{ filled: isFormFilled }"
              style="border-radius: 5px;"
              :style="{ backgroundColor: isFormFilled ? '#dd1155' : '', color: isFormFilled ? '#ffffff' : '' }"
              :disabled="!isFormFilled"
              @click="submitQuestion"
            >
              Senden
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDataStore } from '@/stores/data';
import apiRequest from '@/lib/apiRequest';

export default {
  name: 'QuestionModal',
  props: {
    modalId: {
      type: String,
      default: 'questionModal',
    },
    reference: {
      type: String,
      default: 'KONTAKT_FLOW',
      validator: (value) => ['KONTAKT_FLOW', 'FAQ_FLOW'].includes(value),
    },
  },
  data() {
    return {
      question: '',
      isFormFilled: false,
    };
  },
  computed: {
    user() {
      const store = useDataStore();
      return store.user;
    },
  },
  watch: {
    question() {
      this.checkFormFilled();
    },
  },
  mounted() {
    const store = useDataStore();
    store.loadUser().catch(error => {
      console.error('Error loading user data:', error);
    });
  },
  methods: {
    checkFormFilled() {
      this.isFormFilled = this.question.trim() !== '';
    },
    async submitQuestion() {
      if (this.isFormFilled && this.user) {
        this.isLoading = true;
        try {
          const response = await apiRequest.post('/contact', {
            name: this.user.name || 'Unknown',
            email: this.user.email || 'Unknown',
            message: this.question,
            reference: this.reference, // إضافة السياق إلى البيانات المرسلة
          });
          console.log('Email sent:', response.data);

          // Close current modal
          const currentModal = document.getElementById(this.modalId);
          if (currentModal) {
            const bootstrapModal = window.bootstrap.Modal.getInstance(currentModal);
            bootstrapModal.hide();
          }

          // Open confirmation modal
          const confirmModal = document.getElementById('ReportBugModalConfirm');
          if (confirmModal) {
            const bootstrapConfirmModal = new window.bootstrap.Modal(confirmModal);
            bootstrapConfirmModal.show();
          }

          // Reset form
          this.resetModal();
        } catch (error) {
          console.error('Error sending email:', error.response?.data || error.message);
       
        } finally {
          this.isLoading = false;
        }
      } else {
       
      }
    },
    openModal() {
      const modal = document.getElementById(this.modalId);
      if (!modal) {
        console.error('QuestionModal: لا يوجد عنصر بالمعرّف', this.modalId);
        return;
      }
      const Modal = window.bootstrap?.Modal;
      if (!Modal) {
        console.error('QuestionModal: Bootstrap JS غير محمّل — تعذّر فتح النافذة');
        return;
      }
      // getOrCreateInstance بدل new: النقر المتكرّر كان ينشئ نسخةً وخلفيةً جديدتين.
      Modal.getOrCreateInstance(modal).show();
    },
    resetModal() {
      this.question = '';
      this.isFormFilled = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-content {
  border: none;
  background-color: #26282d;
  padding: 30px;
  border-radius: 20px;
}

.modal-title-msg {
  margin-top: 24px;
  margin-bottom: 28px;
  text-align: center;
  text-transform: uppercase;
  color: white;
}

.btn-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 25px;
  color: white;
  margin-top: 10px;
  text-transform: uppercase;
  background-color: var(--icon);
  border-radius: 5px;
  border: 0;
}

.btn-message:focus {
  border: 0;
}

.btn-message:hover {
  background-color: #990033;
}

.modal-dialog {
  max-width: 750px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 94vh;
}

.modal-header {
  border: 0;
  justify-content: center;
  padding: 0;
}

.modal-title {
  font: normal normal bold 28px/41px Heebo;
  color: #ffffff;
}

.modal-body {
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 0;
}

.modal-body p {
  text-align: center;
  font: normal normal 300 20px/29px Heebo;
  color: #6a6c6d;
}

.modal-body textarea {
  background: #1b1c20 0% 0% no-repeat padding-box;
  border-radius: 5px;
  width: 100%;
  margin: 15px 0;
  font: normal normal 300 20px/20px Heebo;
  color: #ffffff;
  padding: 14px 10px;
  border: none;
  height: 140px;
}

.modal-body textarea:focus {
  border: none;
  outline: none;
}

.modal-footer {
  justify-content: flex-end;
  border: 0;
  padding: 0;
  padding-right: 12px;
}

.confirm-btn {
  font-size: 16px;
  line-height: 22px;
  transition: background-color 0.3s ease;
  padding: 14px;
  background-color: #586266;
  text-transform: uppercase;
  width: 120px;
  color: #aeafb3;
  border: 0;
}

.confirm-btn.filled {
  background-color: #dd1155;
  color: #ffffff;
}

.confirm-btn.filled:hover {
  background-color: #990033 !important;
}

.btn-closee {
  position: absolute;
  right: 20px;
  top: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3E%3Cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3E%3C/svg%3E");
  width: 14px;
  height: 14px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  background-color: transparent;
  border: 0;
}
</style>
