import mapboxgl from "mapbox-gl";
import XLSX from "xlsx";

export function setupMap({ config, data }) {
  mapboxgl.accessToken = config.mapboxAccessToken;

  const source = "local-health-area";
  const sourceLayer = "LHA_2018-b1d2l2";

  const dataset = "LHA"; // HA, CHSA, LHA
  const rows = XLSX.utils.sheet_to_json(data.Sheets[dataset]);
  const dataValueField = "C_ADR_7day";

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v9",
    hash: true,
    minZoom: 6,
    maxZoom: 12,
  });

  window.map = map;

  map.on("load", () => {
    map.addSource("local-health-area", {
      type: "vector",
      url: `mapbox://${config.boundariesTileset}`,
      promoteId: `${dataset}_CD`,
    });

    // We determine the color for each polygon and then encode that information
    // into a matchExpression that looks up the polygon by its ID
    // https://docs.mapbox.com/mapbox-gl-js/example/data-join/
    const layerIdField = `${dataset}_CD`;
    const dataIdField = `${dataset}18_Code`;
    const matchExpression = ["match", ["get", layerIdField]];
    rows.forEach((row) =>
      matchExpression.push(
        `${row[dataIdField]}`,
        getColor(
          [
            // Avg daily rate
            [0, "rgb(255, 255, 255)"],
            [0.1, "rgb(226, 214, 240)"],
            [15.1, "rgb(187, 164, 204)"],
            [30.1, "rgb(151, 121, 170)"],
            [45.1, "rgb(101, 72, 125)"],
            [60, "rgb(101, 72, 125)"],
          ],
          row[dataValueField]
        )
      )
    );
    matchExpression.push("rgb(175,175,175)");
    map.addLayer(
      {
        id: "area",
        type: "fill",
        source,
        "source-layer": sourceLayer,
        paint: {
          "fill-color": matchExpression,
          "fill-outline-color": "#fff",
        },
      },
      // Find the index of the first line layer in the map style.
      // https://docs.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/
      map.getStyle().layers.find((layer) => layer.type === "line").id
    );

    map.addLayer({
      id: "label",
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
      console.log(properties);

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
