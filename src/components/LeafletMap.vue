<template>
  <div ref="mapContainer" class="leaflet-map"></div>
</template>

<script>
// جدول ISO-3166-1 كامل: الـ GeoJSON يعرّف الدول بـ alpha-3 في feature.id
// بينما الـ API يرجّع alpha-2. الجدول السابق كان يغطّي 9 دول فقط،
// فأيّ دولة خارجها (مثل AF) كانت تُترجم إلى undefined ولا تُلوّن أبداً.
const ISO2_TO_ISO3 = {
  AF: "AFG", AX: "ALA", AL: "ALB", DZ: "DZA", AS: "ASM", AD: "AND", AO: "AGO", AI: "AIA",
  AQ: "ATA", AG: "ATG", AR: "ARG", AM: "ARM", AW: "ABW", AU: "AUS", AT: "AUT", AZ: "AZE",
  BS: "BHS", BH: "BHR", BD: "BGD", BB: "BRB", BY: "BLR", BE: "BEL", BZ: "BLZ", BJ: "BEN",
  BM: "BMU", BT: "BTN", BO: "BOL", BQ: "BES", BA: "BIH", BW: "BWA", BV: "BVT", BR: "BRA",
  IO: "IOT", BN: "BRN", BG: "BGR", BF: "BFA", BI: "BDI", CV: "CPV", KH: "KHM", CM: "CMR",
  CA: "CAN", KY: "CYM", CF: "CAF", TD: "TCD", CL: "CHL", CN: "CHN", CX: "CXR", CC: "CCK",
  CO: "COL", KM: "COM", CD: "COD", CG: "COG", CK: "COK", CR: "CRI", CI: "CIV", HR: "HRV",
  CU: "CUB", CW: "CUW", CY: "CYP", CZ: "CZE", DK: "DNK", DJ: "DJI", DM: "DMA", DO: "DOM",
  EC: "ECU", EG: "EGY", SV: "SLV", GQ: "GNQ", ER: "ERI", EE: "EST", SZ: "SWZ", ET: "ETH",
  FK: "FLK", FO: "FRO", FJ: "FJI", FI: "FIN", FR: "FRA", GF: "GUF", PF: "PYF", TF: "ATF",
  GA: "GAB", GM: "GMB", GE: "GEO", DE: "DEU", GH: "GHA", GI: "GIB", GR: "GRC", GL: "GRL",
  GD: "GRD", GP: "GLP", GU: "GUM", GT: "GTM", GG: "GGY", GN: "GIN", GW: "GNB", GY: "GUY",
  HT: "HTI", HM: "HMD", VA: "VAT", HN: "HND", HK: "HKG", HU: "HUN", IS: "ISL", IN: "IND",
  ID: "IDN", IR: "IRN", IQ: "IRQ", IE: "IRL", IM: "IMN", IL: "ISR", IT: "ITA", JM: "JAM",
  JP: "JPN", JE: "JEY", JO: "JOR", KZ: "KAZ", KE: "KEN", KI: "KIR", KP: "PRK", KR: "KOR",
  KW: "KWT", KG: "KGZ", LA: "LAO", LV: "LVA", LB: "LBN", LS: "LSO", LR: "LBR", LY: "LBY",
  LI: "LIE", LT: "LTU", LU: "LUX", MO: "MAC", MG: "MDG", MW: "MWI", MY: "MYS", MV: "MDV",
  ML: "MLI", MT: "MLT", MH: "MHL", MQ: "MTQ", MR: "MRT", MU: "MUS", YT: "MYT", MX: "MEX",
  FM: "FSM", MD: "MDA", MC: "MCO", MN: "MNG", ME: "MNE", MS: "MSR", MA: "MAR", MZ: "MOZ",
  MM: "MMR", NA: "NAM", NR: "NRU", NP: "NPL", NL: "NLD", NC: "NCL", NZ: "NZL", NI: "NIC",
  NE: "NER", NG: "NGA", NU: "NIU", NF: "NFK", MK: "MKD", MP: "MNP", NO: "NOR", OM: "OMN",
  PK: "PAK", PW: "PLW", PS: "PSE", PA: "PAN", PG: "PNG", PY: "PRY", PE: "PER", PH: "PHL",
  PN: "PCN", PL: "POL", PT: "PRT", PR: "PRI", QA: "QAT", RE: "REU", RO: "ROU", RU: "RUS",
  RW: "RWA", BL: "BLM", SH: "SHN", KN: "KNA", LC: "LCA", MF: "MAF", PM: "SPM", VC: "VCT",
  WS: "WSM", SM: "SMR", ST: "STP", SA: "SAU", SN: "SEN", RS: "SRB", SC: "SYC", SL: "SLE",
  SG: "SGP", SX: "SXM", SK: "SVK", SI: "SVN", SB: "SLB", SO: "SOM", ZA: "ZAF", GS: "SGS",
  SS: "SSD", ES: "ESP", LK: "LKA", SD: "SDN", SR: "SUR", SJ: "SJM", SE: "SWE", CH: "CHE",
  SY: "SYR", TW: "TWN", TJ: "TJK", TZ: "TZA", TH: "THA", TL: "TLS", TG: "TGO", TK: "TKL",
  TO: "TON", TT: "TTO", TN: "TUN", TR: "TUR", TM: "TKM", TC: "TCA", TV: "TUV", UG: "UGA",
  UA: "UKR", AE: "ARE", GB: "GBR", US: "USA", UM: "UMI", UY: "URY", UZ: "UZB", VU: "VUT",
  VE: "VEN", VN: "VNM", VG: "VGB", VI: "VIR", WF: "WLF", EH: "ESH", YE: "YEM", ZM: "ZMB",
  ZW: "ZWE"
}

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
      geoLayer: null,
      popup: null
    }
  },

  async mounted() {
    await this.loadLeaflet()
    this.initMap()
    await this.loadCountries()
  },

  watch: {
    // بيانات الـ release تصل من الـ API بعد تركيب الخريطة، والتنسيق يُطبّق مرّة
    // واحدة عند الإنشاء — فبدون إعادة تطبيق تبقى كلّ الدول بلونها الافتراضي.
    excludedCountries() { this.refreshCountryStyles() },
    includedCountries() { this.refreshCountryStyles() }
  },

  methods: {
    // الدول المستثناة وحدها تأخذ #1B1C20؛ ما عداها يبقى على حاله.
    countryStyle(feature) {
      const excluded = this.excludedCountries
        .map(c => ISO2_TO_ISO3[String(c || '').toUpperCase()])
        .includes(feature.id)

      return {
        fillColor: excluded ? "#1B1C20" : "#6A6C6D",
        color: "#26282D",
        weight: 1,
        fillOpacity: 1
      }
    },

    refreshCountryStyles() {
      if (this.geoLayer) this.geoLayer.setStyle(this.countryStyle)
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
      }).setView([30, 20], 3)

      // SEA COLOR
      this.map.getContainer().style.background = "#26282D"

      // نفس بوب أب PublikumView (Trends/LeafletMap): يتبع المؤشر ولا يحرّك الخريطة.
      this.popup = this.L.popup({
        closeButton: false,
        closeOnClick: false,
        className: 'country-popup',
        offset: [0, -20],
        autoPan: false,
        autoPanPadding: [0, 0]
      })
    },

    async loadCountries() {

      const res = await fetch(
        "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
      )

      const geojson = await res.json()

      this.geoLayer = this.L.geoJSON(geojson, {

        style: this.countryStyle,

        onEachFeature: (feature, layer) => {

          const name = feature.properties.name
          const self = this

          layer.on("mouseover", function (e) {
            self.popup.setContent(
              `<div class="popup-content"><div class="popup-name">${name}</div></div>`
            )
            self.popup.setLatLng(e.latlng)
            self.map.openPopup(self.popup)

            this.setStyle({
              weight: 3,
              color: "#DD1155"
            })
          })

          layer.on("mousemove", function (e) {
            self.popup.setLatLng(e.latlng)
          })

          layer.on("mouseout", function () {
            self.map.closePopup(self.popup)
            if (self.geoLayer) self.geoLayer.resetStyle(this)
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

:deep(.leaflet-control-attribution) {
  display: none !important;
}

/* نفس تنسيق بوب أب الدول في PublikumView */
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

:deep(.leaflet-pane > svg path.leaflet-interactive),
:deep(.leaflet-interactive) {
  outline: none !important;
}
</style>