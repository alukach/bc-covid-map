import config from "./config";
import { setupMap, colors, labels } from "./map";

import LHA from "./data/LHA.json";
import HA from "./data/HA.json";
import CHSA from "./data/CHSA.json";

const data = {
  LHA, HA, CHSA
};

async function build() {
  const dataset = "LHA"; // HA, CHSA, LHA
  const dataValueField = "C_ADR_7day";

  console.log({ data });

  await setupMap({ config, dataset, data: data[dataset], dataValueField });

  buildLegend({ parent: document.getElementById("legend"), dataValueField });
}

function buildLegend({ parent, dataValueField }) {
  const description = document.createElement("p");
  description.className = "description";
  description.innerText = labels[dataValueField];

  parent.appendChild(description);

  // create legend
  // https://docs.mapbox.com/help/tutorials/choropleth-studio-gl-pt-2/
  const bands = colors[dataValueField];
  bands.forEach(([lower, color], i) => {
    const item = document.createElement("div");
    const key = document.createElement("span");
    key.className = "legend-key";
    key.style.backgroundColor = color;

    const value = document.createElement("span");
    value.className = "legend-key-descr";
    const upper = bands.length - 1 > i ? bands[i + 1][0] : undefined;
    value.innerHTML = `${lower}${upper !== undefined ? " - " + upper : "+"}`;
    item.appendChild(key);
    item.appendChild(value);
    parent.appendChild(item);
  });
}

build().catch(console.error);
