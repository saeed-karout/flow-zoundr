<template>
  <div ref="mapContainer" class="leaflet-map"></div>
</template>

<script>
export default {
  name: "LeafletMap",

  props: {
    center: {
      type: Array,
      default: () => [50, 20]
    },
    zoom: {
      type: Number,
      default: 3
    },
    countriesData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      map: null,
      L: null,
      geoLayer: null,
      isMapReady: false,
      hoveredCountry: null,
      popup: null
    }
  },

  watch: {
    countriesData: {
      deep: true,
      handler(newVal) {
        console.log('🗺️ [LeafletMap] countriesData تغير:', Object.keys(newVal));
        this.updateMapColors();
        this.updatePopupContent();
      }
    }
  },

  async mounted() {
    console.log('🗺️ [LeafletMap] mounted');
    await this.loadLeaflet();
    this.initMap();
    await this.loadCountries();
    this.isMapReady = true;
  },

  methods: {
    formatNumber(num) {
      if (!num && num !== 0) return '0';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    async loadLeaflet() {
      if (!window.L) {
        await this.loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
        await this.loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css")
      }
      this.L = window.L
    },

    loadScript(src) {
      return new Promise(resolve => {
        const script = document.createElement("script")
        script.src = src
        script.onload = resolve
        document.head.appendChild(script)
      })
    },

    loadCss(href) {
      return new Promise(resolve => {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = href
        link.onload = resolve
        document.head.appendChild(link)
      })
    },

    initMap() {
      this.map = this.L.map(this.$refs.mapContainer, {
        zoomControl: false,
        attributionControl: false
      }).setView(this.center, this.zoom)

      this.map.getContainer().style.background = "transparent"
      this.map.getContainer().style.zIndex = "1"
      
      // ✅ إنشاء popup مع منع التحريك التلقائي
      this.popup = this.L.popup({
        closeButton: false,
        closeOnClick: false,
        className: 'country-popup',
        offset: [0, -20],
        autoPan: false, // ✅ منع تحريك الخريطة
        autoPanPadding: [0, 0]
      });
    },

    findCountryData(geoName) {
      if (!geoName) return null;
      
      if (this.countriesData[geoName]) {
        return this.countriesData[geoName];
      }
      
      const normalizedGeo = geoName.toLowerCase().trim();
      for (const key of Object.keys(this.countriesData)) {
        if (key.toLowerCase().trim() === normalizedGeo) {
          return this.countriesData[key];
        }
      }
      
      const geoParts = normalizedGeo.split(' ');
      for (const key of Object.keys(this.countriesData)) {
        const keyParts = key.toLowerCase().split(' ');
        if (geoParts.every(part => keyParts.includes(part))) {
          return this.countriesData[key];
        }
        if (keyParts.every(part => geoParts.includes(part))) {
          return this.countriesData[key];
        }
      }
      
      return null;
    },

    getColorForCountry(rank, totalCountries) {
      if (!rank || rank === 0) {
        return {
          fillColor: "#6A6C6D",
          fillOpacity: 0.15
        };
      }
      
      const baseColor = "#DD1155";
      const opacity = Math.max(0.15, 1.0 - ((rank - 1) * 0.08));
      
      return {
        fillColor: baseColor,
        fillOpacity: opacity
      };
    },

    updatePopupContent() {
      if (!this.popup || !this.hoveredCountry) return;
      
      const data = this.findCountryData(this.hoveredCountry);
      if (data && data.count) {
        this.popup.setContent(`
          <div class="popup-content">
            <div class="popup-name">${data.name || this.hoveredCountry}</div>
            <div class="popup-count">${this.formatNumber(data.count)}</div>
          </div>
        `);
      }
    },

    async loadCountries() {
      console.log('🗺️ [LeafletMap] loadCountries بدء...');
      
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
        )
        const geojson = await res.json()
        
        if (this.geoLayer) {
          this.map.removeLayer(this.geoLayer);
          this.geoLayer = null;
        }
        
        const self = this;
        
        this.geoLayer = this.L.geoJSON(geojson, {
          style: (feature) => {
            const countryData = this.findCountryData(feature.properties.name)
            const rank = countryData?.rank || 0
            const { fillColor, fillOpacity } = this.getColorForCountry(rank, Object.keys(this.countriesData).length)
            
            return {
              fillColor: fillColor,
              color: "#26282D",
              weight: 1,
              fillOpacity: fillOpacity
            }
          },
          onEachFeature: (feature, layer) => {
            const countryName = feature.properties.name;
            
            layer.on("mouseover", function(e) {
              const data = self.findCountryData(countryName);
              
              self.hoveredCountry = countryName;
              
              if (data && data.count) {
                self.popup.setContent(`
                  <div class="popup-content">
                    <div class="popup-name">${data.name || countryName}</div>
                    <div class="popup-count">${self.formatNumber(data.count)}</div>
                  </div>
                `);
              } else {
                self.popup.setContent(`
                  <div class="popup-content">
                    <div class="popup-name">${countryName}</div>
                    <div class="popup-count">0</div>
                  </div>
                `);
              }
              
              // ✅ فتح البوب اب في موقع المؤشر بدون تحريك الخريطة
              self.popup.setLatLng(e.latlng);
              self.map.openPopup(self.popup);
              
              this.setStyle({
                weight: 3,
                color: "#DD1155"
              });
            });
            
            layer.on("mousemove", function(e) {
              // ✅ تحديث موقع البوب اب مع حركة المؤشر
              self.popup.setLatLng(e.latlng);
            });
            
            layer.on("mouseout", function() {
              self.map.closePopup(self.popup);
              self.hoveredCountry = null;
              
              if (self.geoLayer) {
                self.geoLayer.resetStyle(this);
              }
            });
          }
        }).addTo(this.map)
        
        console.log('🗺️ [LeafletMap] تم تحميل الخريطة بنجاح');
        this.reduceMapZIndex();
        
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 200);
        
      } catch (error) {
        console.error('🗺️ [LeafletMap] خطأ في تحميل الخريطة:', error);
      }
    },
    
    reduceMapZIndex() {
      if (!this.map) return
      
      const container = this.map.getContainer()
      if (container) {
        container.style.zIndex = "1"
      }
      
      const panes = document.querySelectorAll('.leaflet-pane')
      panes.forEach(pane => {
        pane.style.zIndex = "1"
      })
      
      const controls = document.querySelectorAll('.leaflet-control')
      controls.forEach(control => {
        control.style.zIndex = "2"
      })
    },
    
    updateMapColors() {
      if (!this.geoLayer) {
        console.warn('🗺️ [LeafletMap] geoLayer غير موجود');
        return;
      }
      
      console.log('🗺️ [LeafletMap] تحديث ألوان الخريطة...');
      
      this.geoLayer.eachLayer(layer => {
        const feature = layer.feature
        if (feature) {
          const countryData = this.findCountryData(feature.properties.name)
          const rank = countryData?.rank || 0
          const { fillColor, fillOpacity } = this.getColorForCountry(rank, Object.keys(this.countriesData).length)
          
          layer.setStyle({
            fillColor: fillColor,
            fillOpacity: fillOpacity
          })
        }
      })
      
      console.log('🗺️ [LeafletMap] تم تحديث الألوان');
    }
  }
}
</script>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  position: relative;
  z-index: 1;
}

:deep(.leaflet-container) {
  z-index: 1 !important;
}

:deep(.leaflet-pane) {
  z-index: 1 !important;
}

:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 2 !important;
}

:deep(.leaflet-control) {
  z-index: 2 !important;
}

:deep(.leaflet-control-attribution) {
  display: none !important;
}

/* ✅ تنسيق البوب اب */
:deep(.country-popup .leaflet-popup-content-wrapper) {
  background: rgba(27, 28, 32, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(221, 17, 85, 0.4);
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  max-width: 300px !important;
}

:deep(.country-popup .leaflet-popup-content) {
  margin: 0;
  padding: 10px 16px;
  min-width: 60px;
  text-align: center;
}

:deep(.country-popup .leaflet-popup-tip) {
  background: rgba(27, 28, 32, 0.92);
  border: 1px solid rgba(221, 17, 85, 0.4);
}

:deep(.popup-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0px;
}

:deep(.popup-name) {
  color: rgba(255, 255, 255, 0.7);
  font-family: Heebo, sans-serif;
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

:deep(.popup-count) {
  color: #DD1155;
  font-family: Heebo, sans-serif;
  font-size: 18px;
  font-weight: 700;
}

:deep(.leaflet-pane > svg path.leaflet-interactive) {
  outline: none !important;
}

:deep(.leaflet-interactive) {
  outline: none !important;
}
</style>