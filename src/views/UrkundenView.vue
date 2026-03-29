```vue
<template>
  <!-- Unchanged: Template remains the same as provided -->
  <main>
    <div class="containers">
      <TitleSection title="Deine Urkunden"
        description="Hier siehst Du alle deine Urkunden und kannst diese herunterladen." />
      <div class="main">
        <div class="left" :style="{ height: leftHeight + 'px' }">
          <div class="show-data">
            <span class="date">2024-12-15</span>
         
           <img src="../assets/icons/download.svg" class="download" width="22" height="22" alt="icon download">
          </div>
        </div>
        <div class="data" :style="{ minHeight: leftHeight + 'px' }">
          <div class="scroll-container" ref="mainScrollContainer">
            <div class="col1">
              <div class="item" v-for="(item, index) in col1Items" :key="index">
                <div class="name"><span>{{ truncateName(item.name) }}</span></div>
                <div class="down" @click="downloadItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M20.642 22H1.35802C0.597531 22 0 21.4025 0 20.642C0 19.8815 0.597531 19.2839 1.35802 19.2839H20.642C21.4025 19.2839 22 19.8815 22 20.642C22 21.3753 21.3753 22 20.642 22Z" fill="#6A6C6D" />
                    <path d="M17.9259 6.51852H14.5309V0H7.38765V6.54568H4.04691C3.31358 6.54568 2.90617 7.36049 3.34074 7.95802L10.2667 17.3284C10.6198 17.7901 11.3259 17.8173 11.679 17.3284L18.6321 7.95802C19.0667 7.36049 18.6593 6.51852 17.9259 6.51852Z" fill="#6A6C6D" />
                  </svg>
                </div>
                <div class="save" @click="saveItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                    <path d="M9.99933 0L0.246001 2.39556C0.131927 2.42815 0.0585938 2.52593 0.0585938 2.64C0.140075 17.7059 9.99933 22 9.99933 22C9.99933 22 19.8586 17.7059 19.9401 2.64C19.9401 2.52593 19.8667 2.42815 19.7527 2.4037L9.99933 0ZM6.4223 17.5674C5.07785 15.9296 4.0023 14.0148 3.23637 11.8881C2.34008 9.43555 1.85933 6.67333 1.77785 3.68296L9.91785 1.49926L3.48082 5.21481C3.22822 11.8881 6.4223 17.5674 6.4223 17.5674Z" fill="#6A6C6D" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="col1" v-if="col2Items.length > 0">
              <div class="item" v-for="(item, index) in col2Items" :key="index">
                <div class="name"><span>{{ truncateName(item.name) }}</span></div>
                <div class="down" @click="downloadItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M20.642 22H1.35802C0.597531 22 0 21.4025 0 20.642C0 19.8815 0.597531 19.2839 1.35802 19.2839H20.642C21.4025 19.2839 22 19.8815 22 20.642C22 21.3753 21.3753 22 20.642 22Z" fill="#6A6C6D" />
                    <path d="M17.9259 6.51852H14.5309V0H7.38765V6.54568H4.04691C3.31358 6.54568 2.90617 7.36049 3.34074 7.95802L10.2667 17.3284C10.6198 17.7901 11.3259 17.8173 11.679 17.3284L18.6321 7.95802C19.0667 7.36049 18.6593 6.51852 17.9259 6.51852Z" fill="#6A6C6D" />
                  </svg>
                </div>
                <div class="save" @click="saveItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                    <path d="M9.99933 0L0.246001 2.39556C0.131927 2.42815 0.0585938 2.52593 0.0585938 2.64C0.140075 17.7059 9.99933 22 9.99933 22C9.99933 22 19.8586 17.7059 19.9401 2.64C19.9401 2.52593 19.8667 2.42815 19.7527 2.4037L9.99933 0ZM6.4223 17.5674C5.07785 15.9296 4.0023 14.0148 3.23637 11.8881C2.34074 9.43555 1.85933 6.67333 1.77785 3.68296L9.91785 1.49926L3.48083 5.21481C3.22822 11.8881 6.4223 17.5674 6.4223 17.5674Z" fill="#6A6C6D" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="shadow-blur" v-if="items.length > 14 && !isMainAtBottom"></div>
        </div>
      </div>
      <div class="newdata">
        <div class="new-left" :style="{ height: newLeftHeight + 'px' }">
          <div class="show-data">
            <span class="date">2024-12-15</span>
           <img src="../assets/icons/download.svg" class="download" width="22" height="22" alt="icon download">
          </div>
        </div>
        <div class="new-data" :style="{ minHeight: newLeftHeight + 'px' }">
          <div class="scroll-container" ref="newDataScrollContainer">
            <div class="col1">
              <div class="item" v-for="(item, index) in newCol1Items" :key="index">
                <div class="name"><span>{{ truncateName(item.name) }}</span></div>
                <div class="down" @click="downloadItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M20.642 22H1.35802C0.597531 22 0 21.4025 0 20.642C0 19.8815 0.597531 19.2839 1.35802 19.2839H20.642C21.4025 19.2839 22 19.8815 22 20.642C22 21.3753 21.3753 22 20.642 22Z" fill="#6A6C6D" />
                    <path d="M17.9259 6.51852H14.5309V0H7.38765V6.54568H4.04691C3.31358 6.54568 2.90617 7.36049 3.34074 7.95802L10.2667 17.3284C10.6198 17.7901 11.3259 17.8173 11.679 17.3284L18.6321 7.95802C19.0667 7.36049 18.6593 6.51852 17.9259 6.51852Z" fill="#6A6C6D" />
                  </svg>
                </div>
                <div class="save" @click="saveItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                    <path d="M9.99933 0L0.246001 2.39556C0.131927 2.42815 0.0585938 2.52593 0.0585938 2.64C0.140075 17.7059 9.99933 22 9.99933 22C9.99933 22 19.8586 17.7059 19.9401 2.64C19.9401 2.52593 19.8667 2.42815 19.7527 2.4037L9.99933 0ZM6.4223 17.5674C5.07785 15.9296 4.0023 14.0148 3.23637 11.8881C2.34074 9.43555 1.85933 6.67333 1.77785 3.68296L9.91785 1.49926L3.48083 5.21481C3.22822 11.8881 6.4223 17.5674 6.4223 17.5674Z" fill="#6A6C6D" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="col1" v-if="newCol2Items.length > 0">
              <div class="item" v-for="(item, index) in newCol2Items" :key="index">
                <div class="name"><span>{{ truncateName(item.name) }}</span></div>
                <div class="down" @click="downloadItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M20.642 22H1.35802C0.597531 22 0 21.4025 0 20.642C0 19.8815 0.597531 19.2839 1.35802 19.2839H20.642C21.4025 19.2839 22 19.8815 22 20.642C22 21.3753 21.3753 22 20.642 22Z" fill="#6A6C6D" />
                    <path d="M17.9259 6.51852H14.5309V0H7.38765V6.54568H4.04691C3.31358 6.54568 2.90617 7.36049 3.34074 7.95802L10.2667 17.3284C10.6198 17.7901 11.3259 17.8173 11.679 17.3284L18.6321 7.95802C19.0667 7.36049 18.6593 6.51852 17.9259 6.51852Z" fill="#6A6C6D" />
                  </svg>
                </div>
                <div class="save" @click="saveItem(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                    <path d="M9.99933 0L0.246001 2.39556C0.131927 2.42815 0.0585938 2.52593 0.0585938 2.64C0.140075 17.7059 9.99933 22 9.99933 22C9.99933 22 19.8586 17.7059 19.9401 2.64C19.9401 2.52593 19.8667 2.42815 19.7527 2.4037L9.99933 0ZM6.4223 17.5674C5.07785 15.9296 4.0023 14.0148 3.23637 11.8881C2.34074 9.43555 1.85933 6.67333 1.77785 3.68296L9.91785 1.49926L3.48083 5.21481C3.22822 11.8881 6.4223 17.5674 6.4223 17.5674Z" fill="#6A6C6D" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="shadow-blur" v-if="newItems.length > 14 && !isNewDataAtBottom"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
// Unchanged: Script remains the same as provided
import TitleSection from '@/components/TitleSection.vue';
import { useDataStore } from '@/stores/data';
import { mapState } from 'pinia';

export default {
  components: {
    TitleSection,
  },
  data() {
    return {
      items: [],
      col1Items: [],
      col2Items: [],
      newItems: [],
      newCol1Items: [],
      newCol2Items: [],
      isMainAtBottom: false,
      isNewDataAtBottom: false,
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    ...mapState(useDataStore, ['user']),
    leftHeight() {
      const itemCount = Math.ceil(this.items.length / 2);
      const height = itemCount * 50 + (itemCount - 1) * 8;
      return Math.min(398, Math.max(166, height));
    },
    newLeftHeight() {
      const itemCount = Math.ceil(this.newItems.length / 2);
      const height = itemCount * 50 + (itemCount - 1) * 8;
      return Math.min(398, Math.max(166, height));
    },
  },
  methods: {
    async fetchData() {
      const mockApiResponse = [
        { name: 'Document1.pdf' },
        { name: 'Document2.mp3' },
        { name: 'Document3.docx' },
        { name: 'Document4.pdf' },
        { name: 'Document5.mp3' },
        { name: 'Document6.docx' },
        { name: 'Document7.pdf' },
        { name: 'Document8.mp3' },
        { name: 'Document9.docx' },
        { name: 'Document10.pdf' },
        { name: 'Document11.mp3' },
        { name: 'Document12.docx' },
        { name: 'Document13.pdf' },
        { name: 'Document14.mp3' },
        { name: 'Document15SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS.docx' },
        { name: 'Document16.pdf' },
        { name: 'Document17.mp3' },
        { name: 'Document18.docx' },
        { name: 'Document19.pdf' },
        { name: 'Document20.mp3' },
      ];
      const data = mockApiResponse.slice(0, Math.max(3, Math.min(20, mockApiResponse.length)));
      this.items = data;
      this.distributeItems();
    },
    async fetchNewData() {
      const mockApiResponse = [
        { name: 'NewDocument1.pdf' },
        { name: 'NewDocument2.mp3' },
        { name: 'NewDocument3.docx' },
        { name: 'NewDocument4.pdf' },
        { name: 'NewDocument5.mp3' },
        { name: 'NewDocument6.docx' },
      ];
      const data = mockApiResponse.slice(0, Math.max(3, Math.min(20, mockApiResponse.length)));
      this.newItems = data;
      this.distributeNewItems();
    },
    truncateName(name) {
      if (this.windowWidth >= 2400) {
        return name;
      }
      const baseLimit = 21;
      const widthIncrement = Math.max(0, this.windowWidth - 1440);
      const additionalChars = Math.floor(widthIncrement / 50) * 2;
      const limit = baseLimit + additionalChars;
      if (name.length > limit) {
        return name.slice(0, limit) + '...';
      }
      return name;
    },
    distributeItems() {
      this.col1Items = [];
      this.col2Items = [];
      this.items.forEach((item, index) => {
        if (index % 2 === 0) {
          this.col1Items.push(item);
        } else {
          this.col2Items.push(item);
        }
      });
    },
    distributeNewItems() {
      this.newCol1Items = [];
      this.newCol2Items = [];
      this.newItems.forEach((item, index) => {
        if (index % 2 === 0) {
          this.newCol1Items.push(item);
        } else {
          this.newCol2Items.push(item);
        }
      });
    },
    downloadItem(item) {
      console.log(`Downloading ${item.name}`);
    },
    saveItem(item) {
      console.log(`Saving ${item.name}`);
    },
    checkMainScroll() {
      const container = this.$refs.mainScrollContainer;
      if (container) {
        this.isMainAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      }
    },
    checkNewDataScroll() {
      const container = this.$refs.newDataScrollContainer;
      if (container) {
        this.isNewDataAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;
      }
    },
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
  },
  mounted() {
    this.fetchData();
    this.fetchNewData();
    this.$nextTick(() => {
      const mainContainer = this.$refs.mainScrollContainer;
      const newDataContainer = this.$refs.newDataScrollContainer;
      if (mainContainer) {
        mainContainer.addEventListener('scroll', this.checkMainScroll);
      }
      if (newDataContainer) {
        newDataContainer.addEventListener('scroll', this.checkNewDataScroll);
      }
      window.addEventListener('resize', this.handleResize);
    });
  },
  beforeUnmount() {
    const mainContainer = this.$refs.mainScrollContainer;
    const newDataContainer = this.$refs.newDataScrollContainer;
    if (mainContainer) {
      mainContainer.removeEventListener('scroll', this.checkMainScroll);
    }
    if (newDataContainer) {
      newDataContainer.removeEventListener('scroll', this.checkNewDataScroll);
    }
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style lang="scss" scoped>
$primary: var(--Main-Colors-Slate-Dark, #1B1C20);
$secondary: var(--Main-Colors-Slate, #26282D);
$icon: var(--Main-Colors-Slate-Light, #3A3E42);
$move: var(--move, #3A3E42);
$white: var(--Main-Colors-White, #FFF);

main {
  display: flex;
  height: calc(100vh - 71px - 50px);
  width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto; /* Enable vertical scrolling for mobile */
  background: $primary;
  box-sizing: border-box;
}

.containers {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  height: 100%;
}

.main {
  display: flex;
  padding: 30px;
  align-items: stretch;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: $secondary;
}

.main .left {
  display: flex;
  width: 200px;
  min-width: 160px;
  padding: 12px 12px 20px 12px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
  background-size: 134px 130px; /* Fixed image size */
  position: relative;
}

.main .left .date {
  display: flex;
  padding: 8px 12px;
  align-items: flex-start;
  gap: 10px;
  border-radius: 14px;
  background: $icon;
  color: $white;
}


.show-data{
  opacity: 0;
}



.main .left .date span {
  color: $white;
  text-align: right;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.main .left .download {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.main .data {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1 0 0;
  position: relative;
}

.main .data .scroll-container {
  display: flex;
  width: 100%;
  max-height: 398px;
  overflow-y: auto;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.main .data .scroll-container::-webkit-scrollbar {
  display: none;
}

.main .data .col1 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  width: 50%;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  align-self: stretch;
}

.item .name {
  display: flex;
  height: 50px;
  padding: 16px 20px;
  align-items: center;
  gap: 20px;
  flex: 1 0 0;
  border-radius: 5px 0px 0px 5px;
  background: $primary;
}

.item .name span {
  color: #FFF;
  font-family: Heebo;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 1;
  flex: 1 0 0;
  width: 100%;
  overflow: hidden;
}

.item .down {
  display: flex;
  width: 50px;
  height: 50px;
  padding: 12px 14px;
  align-items: center;
  gap: 10px;
  background: $primary;
}

.item .down:hover {
  background: $move;
  cursor: pointer;
  transition: background 0.4s ease;
}

.item .down:hover svg path {
  fill: $white;
}

.item .save {
  display: flex;
  width: 50px;
  height: 50px;
  padding: 14px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 0px 5px 5px 0px;
  background: $primary;
}

.item .save:hover {
  background: $move;
  cursor: pointer;
  transition: background 0.4s ease;
}

.item .save:hover svg path {
  fill: $white;
}

.main .data .shadow-blur {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  pointer-events: none;
  background: linear-gradient(to top, rgba(38, 40, 45, 0.7), transparent);
  z-index: 10;
}

.newdata {
  display: flex;
  padding: 30px;
  align-items: stretch;
  gap: 20px;
  align-self: stretch;
  border-radius: 20px;
  background: $secondary;
}

.newdata .new-left {
  display: flex;
  width: 200px;
  min-width: 160px;
  padding: 12px 12px 20px 12px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  border-radius: 20px;
  background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
  background-size: 134px 130px; /* Fixed image size */
  position: relative;



}

.newdata .new-left:hover,.left:hover{
  .show-data{
      opacity: 1;

  }
}

.newdata .new-left .date {
  display: flex;
  padding: 8px 12px;
  align-items: flex-start;
  gap: 10px;
  border-radius: 14px;
  background: $icon;
  color: $white;
}

.newdata .new-left .date span {
  color: $white;
  text-align: right;
  font-family: Heebo;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  text-transform: uppercase;
}

.download:hover {
  filter: brightness(0) invert(1);
  cursor: pointer;
}

.newdata .new-left .download {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  position: absolute;
  bottom: 20px;
  right: 20px;

}

.newdata .new-data {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1 0 0;
  position: relative;
}

.newdata .new-data .scroll-container {
  display: flex;
  width: 100%;
  max-height: 398px;
  overflow-y: auto;
  gap: 16px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.newdata .new-data .scroll-container::-webkit-scrollbar {
  display: none;
}

.newdata .new-data .col1 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  width: 50%;
}

.newdata .new-data .shadow-blur {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  pointer-events: none;
  background: linear-gradient(to top, rgba(38, 40, 45, 0.7), transparent);
  z-index: 10;
}

/* Ensure text and SVG visibility */
.main .left .date,
.newdata .new-left .date {
  background: var(--icon); /* Slightly more opaque for readability */
}

.main .left .date span,
.newdata .new-left .date span {
  color: $white;
}

/* Media Queries: Adjust background image and layout for different screen sizes */
@media (max-width: 2099px) {
  .item .name span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

@media (min-width: 1440px) and (max-width: 1599px) {
  .containers {
    gap: 20px;
  }

  .main {
    padding: 30px;
    gap: 20px;
    border-radius: 20px;
  }

  .main .left {
    width: 210px;
    min-width: 210px;
    height: 398px;
    padding: 12px 12px 20px 12px;
    background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
    background-size: 134px 130px;
  }

  .main .left .date {
    padding: 8px 12px;
    gap: 75px;
    border-radius: 14px;
  }

  .main .left .download {
    width: 22px;
    height: 22px;
    bottom: 20px;
    right: 20px;
  }

  .newdata .new-left {
    min-width: 210px;
    padding: 12px 12px 20px 12px;
    background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
    background-size: 134px 130px;
  }

  /* Other styles unchanged */
}

@media (min-width: 1600px) and (max-width: 2074px) {
  .main .left {
    min-width: 210px;
    min-height: 398px;
    padding: 12px 12px 20px 12px;
    background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
    background-size: 134px 130px;
  }

  .newdata .new-left {
    min-width: 210px;
    max-height: 398px;
    padding: 12px 12px 20px 12px;
    background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
    background-size: 134px 130px;
  }

  /* Other styles unchanged */
}

@media (min-width: 2075px) and (max-width: 2560px) {
  .main .left {
    width: 210px;
    min-width: 180px;
    padding: 12px 12px 20px 12px;
    background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
    background-size: 134px 130px;
  }

  .newdata .new-left {
    min-width: 210px;
    min-height: 166px;
    padding: 12px 12px 20px 12px;
    background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
    background-size: 134px 130px;
  }

  /* Other styles unchanged */
}

/* Mobile-specific styles */
@media (max-width: 767px) {
  main {
    height: auto; /* Allow content to expand vertically */
    min-height: calc(100vh - 71px - 50px);
  }

  .containers {
    gap: 16px;
    padding: 16px;
  }

  .main, .newdata {
    flex-direction: column;
    padding: 20px;
    gap: 16px;
  }

  .main .left, .newdata .new-left {
    width: 100%;
    min-width: 100%;
    height: 200px; /* Reduced height for mobile */
    background: $primary url('/src/assets/images/Urkunden-image.svg') no-repeat center center;
    background-size: 134px 130px; /* Maintain fixed image size */
  }

  .main .data, .newdata .new-data {
    width: 100%;
    min-height: auto;
  }

  .main .data .scroll-container, .newdata .new-data .scroll-container {
    max-height: none; /* Allow natural scrolling */
    flex-direction: column;
  }

  .main .data .col1, .newdata .new-data .col1 {
    width: 100%;
  }

  .item .name span {
    font-size: 16px; /* Smaller text for mobile */
  }
}
</style>