
<template>
  <main>
    <div class="father">
      <div class="contents">
        <TitleSection title="Du Hast noch Fragen?" description="Hier findest die am häufigsten gestellten Fragen." />
        <div class="main">
          <div class="faq-box">
            <div class="faq">
              <div class="col1">
                <div v-for="(item, index) in faqItems.slice(0, 5)" :key="index" class="faq-item" :class="{ 'expanded': item.expanded }">
                  <div class="title-item" @click="toggleItem(index)">
                    <div class="text-title">
                      <div class="num-question">{{ index + 1 }}.</div>
                      <div class="question">{{ item.question }}</div>
                    </div>
                    <div class="down" :class="{ 'up': item.expanded }">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="10" viewBox="0 0 17 10" fill="none">
                        <path d="M15.5 1.5L8.5 8.5L1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <p class="description" v-show="item.expanded">
                    {{ item.answer }}
                  </p>
                </div>
              </div>
              <div class="col2">
                <div v-for="(item, index) in faqItems.slice(5, 10)" :key="index + 5" class="faq-item" :class="{ 'expanded': item.expanded }">
                  <div class="title-item" @click="toggleItem(index + 5)">
                    <div class="text-title">
                      <div class="num-question">{{ index + 6 }}.</div>
                      <div class="question">{{ item.question }}</div>
                    </div>
                    <div class="down" :class="{ 'up': item.expanded }">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="10" viewBox="0 0 17 10" fill="none">
                        <path d="M15.5 1.5L8.5 8.5L1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <p class="description" v-show="item.expanded">
                    {{ item.answer }}
                  </p>
                </div>
              </div>
            </div>
            <div class="btns" @click="openQuestionModal">
              <span>Weitere Fragen?</span>
            </div>
          </div>
        </div>
        <QuestionModal ref="questionModal" modal-id="questionModal" reference="FAQ_FLOW" />
      </div>
    </div>
  </main>
</template>

<script>
import TitleSection from '@/components/TitleSection.vue';
import { useDataStore } from '@/stores/data';
import { mapState } from 'pinia';
import QuestionModal from '@/components/modals/QuestionModal.vue';
import apiRequest from '@/lib/apiRequest';

export default {
  components: {
    TitleSection,
    QuestionModal,
  },
  data() {
    return {
      faqItems: [],
      question: '',
      isTextareaFilled: false,
    };
  },
  computed: {
    ...mapState(useDataStore, ['user']),
  },
  watch: {
    question(newVal) {
      this.isTextareaFilled = newVal.trim() !== '';
    },
  },
  async created() {
    await this.fetchFAQs();
  },
  methods: {
    async fetchFAQs() {
      try {
        const response = await apiRequest.get('/faqs'); // لا حاجة لتمرير الرأوس يدويًا
        this.faqItems = response.data.data.map(item => ({
          ...item,
          expanded: false,
        }));
      } catch (error) {
        console.error('Error fetching FAQs:', error);
       
      }
    },
    toggleItem(index) {
      this.faqItems[index].expanded = !this.faqItems[index].expanded;
    },
    ask_question() {
      // console.log('Question modal opened');
      this.question = '';
      this.isTextareaFilled = false;
    },
    openQuestionModal() {
      this.$refs.questionModal.openModal();
      this.$refs.questionModal.resetModal();
    },
  },
};
</script>

<style lang="scss" scoped>
main {
  display: flex;
  height: calc(100vh - 71px - 50px);
  position: relative;
}

.father {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  position: absolute;
  top: 0;
}

.contents {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
}

.main {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.faq-box {
  display: flex;
  padding: 30px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 32px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background: var(--Main-Colors-Slate, #26282D);
}

.faq {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.col1,
.col2 {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
  flex: 1 0 0;
}

.faq-item {
  display: flex;
  padding: 21.5px 20px ;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
}

.faq-item.expanded {
  padding-bottom: 24px;
}

.title-item {
  display: flex;
  align-items: center;
  gap: 20px;
  align-self: stretch;
  border-radius: 5px;
  cursor: pointer;
}

.text-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
}

.text-title .num-question {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  width: 30px;
}

.text-title .question {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0.9px;
  flex: 1 0 0;
}

.down {
  width: 17px;
  transition: transform 0.3s ease;
}

.down.up {
  transform: rotate(180deg);
}

.description {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 0.9px;
  line-height: 1.5;
  margin-top: 10px;
  // padding: 0 10px;
  text-align: justify;
  align-self: stretch;
}

.faq-item.expanded .description {
  display: block;
}

.btns {
  display: flex;
  padding: 12px 20px 13px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Light, #3A3E42);
  cursor: pointer;
}

.btns:hover {
  background-color: #990033;
}

.btns span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

/* Responsive Styles */
@media (min-width: 1440px) and (max-width: 1599px) {
  .faq {
    gap: 20px;
  }
  .col1,
  .col2 {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    align-self: stretch;
  }
  .faq-item {
    // padding: 12px 20px;
  }
  .title-item {
    gap: 15px;
    position: relative;
  }
  .text-title {
    gap: 6px;
  }
  .text-title .num-question,
  .text-title .question {
    color: #FFF;
    font-family: Heebo;
    font-size: 18px;
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: 0.9px;
  }
  .description {
    font-size: 18px;
    line-height: 1.5;
    letter-spacing: 0.8px;
    margin-top: 8px;
    // padding: 0 10px;
    text-align: justify;
  }
  .btns {
    padding: 12px 20px 13px 20px;
  }
  .btns span {
    color: var(--Main-Colors-White, #FFF);
    font-family: Heebo;
    font-size: 16px;
    font-weight: 400;
    line-height: normal;
    text-transform: uppercase;
  }
  .down {
    width: 12.75px;
  }
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .faq-box {
    padding: 27px;
  }
  .faq {
    gap: 18px;
  }
  .col1,
  .col2 {
    gap: 18px;
  }
  .faq-item {
    // padding: 19.35px 18px 21.6px 18px;
    gap: 8px;
  }
  .title-item {
    gap: 18px;
  }
  .text-title {
    gap: 7.2px;
  }
  .text-title .num-question,
  .text-title .question {
    font-size: 18px;
    letter-spacing: 0.81px;
  }
  .description {
    font-size: 18px;
    line-height: 1.5;
    letter-spacing: 0.72px;
    margin-top: 8px;
    // padding: 0 8px;
    text-align: justify;
  }
  .btns {
    padding: 10.8px 18px 11.7px 18px;
  }
  .btns span {
    font-size: 14.4px;
  }
  .down {
    width: 15.3px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .faq-box {
    padding: 30px;
  }
  .faq {
    gap: 20px;
  }
  .col1,
  .col2 {
    gap: 20px;
  }
  .faq-item {
    // padding: 24.19px 22.5px 27px 22.5px;
    gap: 8px;
  }
  .title-item {
    gap: 20px;
  }
  .text-title {
    gap: 9px;
  }
  .text-title .num-question,
  .text-title .question {
    font-size: 18px;
    letter-spacing: 1.0125px;
  }
  .description {
    font-size: 18px;
    line-height: 1.5;
    letter-spacing: 0.9px;
    margin-top: 10px;
    // padding: 0 10px;
    text-align: justify;
  }
  .btns {
    padding: 13.5px 22.5px 14.625px 22.5px;
  }
  .btns span {
    font-size: 16px;
  }
  .down {
    width: 18px;
  }
}


@media (max-width:1620px) {
  .faq-item{
    height: 65px;
    display: flex;
    justify-content: center;
  }
}
</style>
