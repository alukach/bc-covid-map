import XLSX from "xlsx";
import config from "./config";
import { setupMap } from "./map";
import { colors, labels } from "./data";
import { getLastObjectUrl } from "./s3";

async function build() {
  const s3Url = await getLastObjectUrl({
    bucket: "data.opencovid.ca",
    prefix: "archive/bc/case-testing-vaccine-summary-by-CHSA-and-LHA",
    region: "us-east-2",
  });

  const res = await fetch(s3Url);
  if (!res.ok) throw new Error("fetch failed");

  const workbook = XLSX.read(new Uint8Array(await res.arrayBuffer()), {
    type: "array",
  });

  const dataset = "LHA"; // HA, CHSA, LHA
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[dataset]);
  const dataValueField = "C_ADR_7day";

  await setupMap({ config, dataset, rows, dataValueField });

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
