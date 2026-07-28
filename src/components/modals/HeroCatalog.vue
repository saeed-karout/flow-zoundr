<template>
  <div class="heroRelease">
    <div class="release-details">
      <div class="release-header">
        <span>{{ currentTopic }}</span>
      </div>

      <div class="release-info">
        <div class="info-text">
          <span>{{ currentTitle }}</span>
          <p>{{ currentDescription }}</p>
        </div>

        <div class="search-box">
          <input
            type="text"
            class="search-input"
            :placeholder="searchPlaceholder"
            v-model="localSearch"
            @input="emitSearch"
            @keyup.enter="emitSearch"
          />
          <img
            v-if="!localSearch"
            src="@/assets/icons/catalog/Search.svg"
            class="icon"
            alt="search"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeroCatalog',

  props: {
    // الطريقة المفضلة: تمرير status مباشرة
    status: {
      type: String,
      default: 'releases'
    },

    // أو يمكنك تمرير القيم يدوياً (اختياري - للتوافق مع الاستخدام القديم)
    topic: String,
    title: String,
    description: String,

    // إذا أردت تخصيص نص البحث
    searchPlaceholder: {
      type: String,
      default: 'Suche ...'
    }
  },

  data() {
    return {
      localSearch: ''
    }
  },

  computed: {
    currentTopic() {
      if (this.topic) return this.topic
      return this.getConfig(this.status).topic
    },

    currentTitle() {
      if (this.title) return this.title
      return this.getConfig(this.status).title
    },

    currentDescription() {
      if (this.description) return this.description
      return this.getConfig(this.status).description
    }
  },

  methods: {
    getConfig(status) {
      const configs = {
        releases: {
          topic: 'Releases',
          title: 'Deine Veröffentlichungen',
          description:
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...'
        },

        entwürfe: {
          topic: 'Entwürfe',
          title: 'Deine Unveröffentlichten Entwürfe',
          description:
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit, sed quia consequuntur.'
        },

        korrektur: {
          topic: 'Korrektur',
          title: 'Deine ausstehenden Korrekturen',
          description:
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...'
        },

        takedowns: {
          topic: 'Takedowns',
          title: 'Deine Zurückgezogenen Releases',
          description:
            'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...'
        },

        // يمكنك إضافة المزيد من الحالات هنا لاحقاً
      }

      return configs[status?.toLowerCase()] || configs.releases
    },

    emitSearch() {
      // نرسل الحدث للأب مع القيم المهمة
      this.$emit('update:search', this.localSearch)
      // أو يمكنك إرسال object أكثر تفصيلاً
      // this.$emit('search', { query: this.localSearch, status: this.status })
    }
  }
}
</script>


<style lang='scss' scoped>

.search-input {
  transition: all 0.2s ease;
}

.search-input:focus {
  background: #222428;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.25);
}
.heroRelease {
  display: flex;
  width: 100%;
  height: 350px;
  align-items: flex-end;
  gap: 5px;
  border-radius: 20px;
  background: url('../../assets/icons/catalog/bg-primary/hero-relese.jpg') lightgray 0px -85.333px / 50.714% 148.762% no-repeat;
}

.release-details {
  display: flex;
  padding: 30px;
  align-items: flex-end;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(38, 40, 45, 0.00) 0%, var(--Main-Colors-Slate, #26282D) 50%);
}

.release-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
}

.release-header span {
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 56px;
  font-style: normal;
  font-weight: 700;
  line-height: 0.7;
  text-transform: uppercase;
  opacity: 0.7;
}

.release-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 52px;
  flex: 1 0 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
}

.info-text span {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  align-self: stretch;
  overflow: hidden;
  color: var(--Main-Colors-White, #FFF);
  text-overflow: ellipsis;
  font-family: Heebo;
  font-size: 28px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  opacity: 0.7;
}

.info-text p {
  align-self: stretch;
  color: var(--Main-Colors-White, #FFF);
  font-family: Heebo;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: 0.7px;
  opacity: 0.7;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  position: relative;
}

.search-input {
  display: flex;
  height: 50px;
  padding: 12px 16px 12px 30px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  border-radius: 5px;
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
  width: 100%;
  border: 1px solid var(--primary);
  font-family: Heebo;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  color: white;
}

.search-input:focus-visible {
  border: 1px solid var(--primary);
  outline: 0 !important;
  color: white;
  font-size: 18px;
  line-height: normal;
  height: 50px;
}

.icon {
  position: absolute;
  width: 18px;
  left: 16px;
}

.search-input::placeholder {
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 18px;
  font-weight: 400;
  line-height: normal;
  padding-left: 12px;
}

@media (min-width: 1440px) and (max-width: 1599px){
  .heroRelease{
    height: 300px;
  }


  .info-text span{
    font-size: 26px;
  }

  .info-text p{
    font-size: 13px;
  }
}
@media (min-width: 1600px) and (max-width: 2074px){
  .release-info{
    gap: 48px;
  }
}

@media (min-width: 2075px) and (max-width: 2560px){
  .release-info{
    gap: 80px;
  }
}


@media (min-width:2560px) {
   .release-info{
    gap: 80px;
  }
}
</style>