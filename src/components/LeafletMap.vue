<template>
  <div ref="mapContainer" class="leaflet-map"></div>
</template>

<script>
export default {
  name: "LeafletMap",

  props: {
  includedCountries: {
    type: Array,
    default: () => []
  },
  excludedCountries: {
    type: Array,
    default: () => []
  }
},

  data() {
    return {
      map: null,
      L: null,
      geoLayer: null
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
      }).setView([30, 20], 3)

      // SEA COLOR
      this.map.getContainer().style.background = "#26282D"
    },

    async loadCountries() {

      const res = await fetch(
        "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
      )

      const geojson = await res.json()
      const iso2ToIso3 = {
  ES: "ESP",
  GE: "GEO",
  DE: "DEU",
  AT: "AUT",
  CH: "CHE",
  US: "USA",
  GB: "GBR",
  FR: "FRA",
  IT: "ITA",
  NL: "NLD",
  BE: "BEL",
  SE: "SWE"
}

      this.geoLayer = this.L.geoJSON(geojson, {

        style: (feature) => {

const code = feature.id

const included = this.includedCountries
  .map(c => iso2ToIso3[c])
  .includes(code)

const excluded = this.excludedCountries
  .map(c => iso2ToIso3[c])
  .includes(code)

let fillColor = "#6A6C6D"

if (included || excluded) {
  fillColor = "#1B1C20"
}

return {
  fillColor,
  color: "#26282D",
  weight: 1,
  fillOpacity: 1
}
},

        onEachFeature: (feature, layer) => {

          const name = feature.properties.name

          layer.bindTooltip(name, {
            sticky: true
          })

          layer.on("mouseover", () => {
            layer.setStyle({
              weight: 2
            })
          })

          layer.on("mouseout", () => {
            this.geoLayer.resetStyle(layer)
          })

        }

      }).addTo(this.map)

    }

  }
}
</script>

<style scoped>
.leaflet-map {
  width: 100%;
  height: 100%;
  border-radius: 20px;
}
</style>