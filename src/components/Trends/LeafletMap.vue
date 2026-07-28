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
      tooltip: null
    }
  },

  watch: {
    countriesData: {
      deep: true,
      handler() {
        this.updateMapColors()
      }
    }
  },

  async mounted() {
    await this.loadLeaflet()
    this.initMap()
    await this.loadCountries()
  },

  methods: {
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

      // لون خلفية البحر
      this.map.getContainer().style.background = "transparent"
      
      // تقليل z-index للحاوية الرئيسية للخريطة
      this.map.getContainer().style.zIndex = "1"
    },

    // دالة للحصول على اللون بناءً على ترتيب الدولة
    getColorForCountry(rank, totalCountries) {
      if (!rank || rank === 0) {
        return {
          fillColor: "#6A6C6D",
          fillOpacity: 0.2
        }
      }
      
      const baseColor = "#DD1155"
      const opacity = Math.max(0.1, 1.0 - ((rank - 1) * 0.09))
      
      console.log(`🎨 Country rank ${rank}: opacity = ${opacity.toFixed(2)}`)
      
      return {
        fillColor: baseColor,
        fillOpacity: opacity
      }
    },

    async loadCountries() {
      const res = await fetch(
        "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
      )
      const geojson = await res.json()
      
      this.geoLayer = this.L.geoJSON(geojson, {
        style: (feature) => {
          const countryName = feature.properties.name
          const countryData = this.countriesData[countryName]
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
          const countryName = feature.properties.name
          const countryData = this.countriesData[countryName]
          
          let tooltipContent = `<strong>${countryName}</strong>`
          if (countryData && countryData.count) {
            tooltipContent += `<br><span style="color: #DD1155;">👥 ${countryData.count.toLocaleString()} Zuhörer</span>`
            if (countryData.rank) {
              tooltipContent += `<br><span style="color: #DD1155; opacity: 0.7;">🏆 Rang: ${countryData.rank}</span>`
            }
          } else {
            tooltipContent += `<br><span style="color: #6A6C6D;">Keine Daten verfügbar</span>`
          }
          
          layer.bindTooltip(tooltipContent, {
            sticky: true,
            direction: 'top',
            className: 'country-tooltip'
          })
          
          layer.on("mouseover", () => {
            layer.setStyle({
              weight: 3,
              color: "#DD1155"
            })
          })
          
          layer.on("mouseout", () => {
            this.geoLayer.resetStyle(layer)
          })
        }
      }).addTo(this.map)
      
      // تقليل z-index للطبقات المختلفة بعد إضافة الخريطة
      this.reduceMapZIndex()
    },
    
    // دالة لتقليل z-index لجميع عناصر الخريطة
    reduceMapZIndex() {
      if (!this.map) return
      
      // تقليل z-index للحاوية الرئيسية
      const container = this.map.getContainer()
      if (container) {
        container.style.zIndex = "1"
      }
      
      // تقليل z-index لجميع الألواح
      const panes = document.querySelectorAll('.leaflet-pane')
      panes.forEach(pane => {
        pane.style.zIndex = "1"
      })
      
      // تقليل z-index للتحكمات
      const controls = document.querySelectorAll('.leaflet-control')
      controls.forEach(control => {
        control.style.zIndex = "2"
      })
      
      // تقليل z-index للتولتيبات
      const tooltips = document.querySelectorAll('.leaflet-tooltip')
      tooltips.forEach(tooltip => {
        tooltip.style.zIndex = "1001"
      })
    },
    
    // تحديث ألوان الخريطة عند تغيير البيانات
    updateMapColors() {
      if (!this.geoLayer) return
      
      this.geoLayer.eachLayer(layer => {
        const feature = layer.feature
        if (feature) {
          const countryName = feature.properties.name
          const countryData = this.countriesData[countryName]
          const rank = countryData?.rank || 0
          
          const { fillColor, fillOpacity } = this.getColorForCountry(rank, Object.keys(this.countriesData).length)
          
          layer.setStyle({
            fillColor: fillColor,
            fillOpacity: fillOpacity
          })
        }
      })
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

/* تقليل z-index لجميع عناصر Leaflet */
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

/* تنسيق التولتيب */
:deep(.country-tooltip) {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(221, 17, 85, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  font-family: Heebo, sans-serif;
  font-size: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001 !important;
}

:deep(.country-tooltip::before) {
  border-top-color: rgba(221, 17, 85, 0.3);
}

/* إزالة الـ outline */
:deep(.leaflet-pane > svg path.leaflet-interactive) {
  outline: none !important;
}

:deep(.leaflet-interactive) {
  outline: none !important;
}
</style>