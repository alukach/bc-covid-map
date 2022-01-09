import mapboxgl from "mapbox-gl";

export const colors = {
  C_ADR_7day: [
    // Avg daily rate
    [0, "rgb(255, 255, 255)"],
    [0.1, "rgb(226, 214, 240)"],
    [15.1, "rgb(187, 164, 204)"],
    [30.1, "rgb(151, 121, 170)"],
    [45.1, "rgb(101, 72, 125)"],
    [60, "rgb(101, 72, 125)"],
  ],
};

export const labels = {
  C_ADR_7day:
    "Average daily rate per 100,000 population of COVID-19 cases reported during past 7 days",
  C_ADR_8_14day:
    "Average daily rate per 100,000 population of COVID-19 cases reported 8 to 14 days ago",
  C_ADR_7day_change:
    "Absolute change in average daily rate compared to prior 7 day period",
  "7d_positivity_public":
    "Testing positivity rate (%) of publicly funded COVID-19 tests during past 7 days",
  D1_12_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 12+ years receiving 1st dose",
  D1_5_11_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 5 to 11 years receiving 1st dose",
  D1_12_17_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 12 to 17 years receiving 1st dose",
  D1_18_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 18+ years receiving 1st dose",
  D1_18_49_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 18 to 49 years receiving 1st dose",
  D1_50_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 50+ years receiving 1st dose",
  D2_12_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 12+ years receiving 2nd dose",
  D2_12_17_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 12 to 17 years receiving 2nd dose",
  D2_18_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 18+ years receiving 2nd dose",
  D2_18_49_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 18 to 49 years receiving 2nd dose",
  D2_50_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 50+ years receiving 2nd dose",
  D3_70_coverage:
    "COVID-19 vaccine coverage (%) among persons aged 70+ years receiving 3rd dose",
};

export function setupMap({ config, dataset, data, dataValueField }) {
  const source = "local-health-area";
  const sourceLayer = "LHA_2018-b1d2l2";

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    hash: true,
    minZoom: 6,
    maxZoom: 12,
    accessToken: config.mapboxAccessToken,
    center: [-121.75, 51.5],
  });

  window.map = map;

  map.on("load", () => {
    const layerIdField = `${dataset}_CD`;
    const dataIdField = `${dataset}18_Code`;

    map.addSource("local-health-area", {
      type: "vector",
      url: `mapbox://${config.boundariesTileset}`,
      promoteId: layerIdField,
    });

    map.addLayer(
      {
        id: "areas",
        type: "fill",
        source,
        "source-layer": sourceLayer,
        paint: {
          // We determine the color for each polygon and then encode that information
          // into a matchExpression that looks up the polygon by its ID
          // https://docs.mapbox.com/mapbox-gl-js/example/data-join/
          "fill-color": data
            .reduce(
              (prev, row) => [
                ...prev,
                `${row[dataIdField]}`,
                getColor(colors[dataValueField], row[dataValueField]),
              ],
              ["match", ["get", layerIdField]]
            )
            .concat("rgb(175,175,175)"), // nodata value
        },
      },
      // Place below lines
      // https://docs.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/
      map.getStyle().layers.find((layer) => layer.type === "line").id
    );

    map.addLayer(
      {
        id: "area-borders",
        type: "line",
        source,
        "source-layer": sourceLayer,
        paint: {
          "line-color": "#666",
          "line-width": 1.5,
        },
      },
      // Place below symbols
      map.getStyle().layers.find((layer) => layer.type === "symbol").id
    );

    map.addLayer({
      id: "labels",
      type: "symbol",
      source,
      "source-layer": sourceLayer,
      paint: {
        "text-color": "#000",
        "text-halo-color": "#ddd",
        "text-halo-width": 1.5,
        "text-halo-blur": 0.5,
      },
    });

    // When a click event occurs on a feature in the local-health-area layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on("click", "area", (e) => {
      const [{ properties }] = e.features;

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(
          `<h3>${properties.LHA_Name}</h3>` +
            "<table>" +
            Object.entries({
              "Local Health Area": "LHA_Name",
              "Health Authority": "HA_Name",
              Population: "LHA_Pop16",
            })
              .map(
                ([label, prop]) =>
                  `<tr><th>${label}</th><td>${properties[prop]}</td></tr>`
              )
              .join("") +
            "</table>"
        )
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the local-health-area layer.
    map.on("mouseenter", "local-health-area", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", "local-health-area", () => {
      map.getCanvas().style.cursor = "";
    });

    // CUMULATIVE Colors
    // Rate per 100k population by LHA
    // 0, rgba(255,255,255),
    // 0.1, rgba(201,210,230),
    // 1500.1, rgba(139,170,204),
    // 3000.1, rgba(92, 140, 183),
    // 4500.1, rgba(58, 97, 133),
    // 6000, rgba(35, 61, 86)
  });
}

function getColor(levels, value) {
  for (const i in levels) {
    const [lower, color] = levels[i];

    if (!levels[Number(i) + 1]) return color;

    const [upper] = levels[Number(i) + 1];
    if (lower <= value && value < upper) return color;
  }
}
