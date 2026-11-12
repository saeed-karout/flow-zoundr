<template>
  <div class="heroRelease" :style="{ backgroundImage: heroBackgroundImage }">
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
          <!-- الأيقونة والـ placeholder يختفيان معاً بمجرّد وجود نصّ،
               فيخلو السطر للكتابة من 16px دون أي تراكب. -->
          <img
            v-if="!localSearch"
            src="@/assets/icons/catalog/Search.svg"
            class="icon"
            alt="search"
          />
          <!-- placeholder مرسوم كعنصر مستقلّ لا كسمة native:
               الـ placeholder الأصلي يتبع padding الحقل، فكان يزحف مع المؤشر
               عند التركيز. فصله يجعل موضعه ثابتاً تماماً. -->
          <span v-if="!localSearch" class="search-placeholder">{{ searchPlaceholder }}</span>
          <input
            type="text"
            class="search-input"
            v-model="localSearch"
            @input="emitSearch"
            @keyup.enter="emitSearch"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// نفس صور الأقسام المستعملة في CatalogHome.vue — مصدر واحد للصورتين.
import Releases  from '@/assets/icons/catalog/bg-primary/hero-relese.jpg?url';
import Takedowns from '@/assets/icons/catalog/bg-primary/Takedowns.jpg?url';
import Entwürfe  from '@/assets/icons/catalog/bg-primary/Entwürfe.jpg?url';
import Korrektur from '@/assets/icons/catalog/bg-primary/Korrektur.jpg?url';

const BACKGROUNDS = {
  releases:  Releases,
  entwürfe:  Entwürfe,
  korrektur: Korrektur,
  takedowns: Takedowns,
};

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
    },

    // المكوّن يُستدعى بطريقتين: بـ :status من CatalogStatusView،
    // وبـ topic من صفحات releases/entwürfe/korrektur/takedowns القديمة.
    currentBackground() {
      const key = String(this.status || this.topic || '').toLowerCase().trim()
      return BACKGROUNDS[key] || BACKGROUNDS.releases
    },

    // طبقتان في background-image — الأولى هي العليا.
    // التدرّج 274deg يبدأ معتماً من اليمين وينتهي شفّافاً يساراً،
    // فتظهر الصورة يساراً ويبقى النصّ مقروءاً يميناً.
    heroBackgroundImage() {
      return 'linear-gradient(274deg, rgb(38, 40, 45), rgb(38, 40, 45), transparent), '
           + `url(${this.currentBackground})`
    }
  },

  methods: {
    getConfig(status) {
      const configs = {
        releases: {
          topic: 'Releases',
          title: 'DEINE VERÖFFENTLICHUNGEN',
          description:
            'Hier findest Du eine Übersicht Deiner bereits veröffentlichten Singles, EPs und Alben. So behältst Du Deine Releases im Blick – übersichtlich und an einem Ort. Klicke auf Deinen Release, um weitere Information zu erhalten. '
        },

        entwürfe: {
          topic: 'Entwürfe',
          title: 'DEINE ENTWÜRFE',
          description:
            'Hier findest Du eine Übersicht Deiner als Entwurf gespeicherten Singles, EPs und Alben. Bearbeite Deine Releases weiter und bereite sie in Ruhe auf die Veröffentlichung vor.'
        },

        korrektur: {
          topic: 'Korrektur',
          title: 'DEINE KORREKTUREN',
          description:
            'Hier findest Du eine Übersicht Deiner Singles, EPs und Alben, bei denen noch Korrekturen nötig sind. Nimm die entsprechenden Anpassungen vor, damit Deine Releases veröffentlicht werden können.'
        },

        takedowns: {
          topic: 'Takedowns',
          title: 'DEINE TAKEDOWNS',
          description:
            'Hier findest Du eine Übersicht Deiner Singles, EPs und Alben, die aus den Stores entfernt werden oder bereits entfernt wurden. So behältst Du sie im Blick.'
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

.heroRelease {
  display: flex;
  width: 100%;
  height: 350px;
  align-items: center;
  gap: 5px;
  border-radius: 20px;
  /* نفس طريقة عرض stages_banner: التدرّج يملأ الإطار (100% 100%)،
     والصورة تحته بعرض 50% وارتفاع auto — تحجيم منتظم يحفظ نسبة
     الأبعاد عند أيّ مقاس شاشة، بلا أيّ تمطيط. */
  background-repeat: no-repeat;
  background-size: 100% 100%, 50% auto;
  background-position: left center;
}

.release-details {
  display: flex;
  padding: 30px;
  align-items: flex-end;
  gap: 20px;
  flex: 1 0 0;
  align-self: stretch;
  border-radius: 20px;
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

/* الإطار نفسه يحمل الخلفية والحد والارتفاع والحشو، والأيقونة والحقل
   عنصرا flex حقيقيّان داخله. لا وضع مطلق ولا حشو محسوب يدوياً
   لإفساح مكان للأيقونة — فلا يمكن أن يتراكبا أبداً. */
.search-box {
  display: flex;
  align-items: center;
  align-self: stretch;
  height: 50px;
  padding: 12px 16px;
  border-radius: 5px;
  border: 1px solid var(--primary);
  background: var(--Main-Colors-Slate-Dark, #1B1C20);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.search-box:focus-within {
  background: #222428;
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.25);
}

/* الأيقونة خارج تدفّق الـ flex ومثبّتة عند 16px — موضعها الأصلي تماماً،
   ولا تتحرّك ولا تختفي عند التركيز. */
.icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  pointer-events: none;
}

.search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  /* حشو ثابت: المؤشر يبدأ دائماً من حافة الإطار (16px)، أي قبل الأيقونة،
     ولا يتغيّر شيء عند التركيز. */
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: Heebo;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  color: #FFF;
}

.search-input:focus,
.search-input:focus-visible {
  outline: 0 !important;
}

/* عند النقر في الحقل: تختفي الأيقونة ونصّ الإرشاد معاً،
   والمؤشر أصلاً عند 16px (حشو الحقل صفر) فيخلو السطر تماماً.
   يُغطّي :focus-within النقر والـ Tab والتركيز البرمجي بنفس القاعدة،
   والـ v-if يتكفّل بحالة وجود نصّ بعد مغادرة الحقل. */
.search-box:focus-within .icon,
.search-box:focus-within .search-placeholder {
  display: none;
}

/* ثابت عند 42px — نفس موضعه الأصلي — ولا يتأثّر بحشو الحقل أو بالتركيز. */
.search-placeholder {
  position: absolute;
  left: 42px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--Main-Colors-Dove, #6A6C6D);
  font-family: Heebo;
  font-size: 18px;
  font-weight: 400;
  line-height: normal;
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