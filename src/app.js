import XLSX from "xlsx";
import { setupMap } from "./map";

import { getLastObjectUrl } from "./s3";

const config = {
  mapboxAccessToken:
    "pk.eyJ1IjoiYWx1a2FjaCIsImEiOiJ3US1JLXJnIn0.xrpBHCwvzsX76YlO-08kjg",
  boundariesTileset: "alukach.5hmsd9ei",
};

const labels = {
  C_ADR_7day:
    "C_ADR_7day : Average daily rate per 100,000 population of COVID-19 cases reported during past 7 days",
  C_ADR_8_14day:
    "C_ADR_8_14day : Average daily rate per 100,000 population of COVID-19 cases reported 8 to 14 days ago",
  C_ADR_7day_change:
    "C_ADR_7day_change : Absolute change in average daily rate compared to prior 7 day period",
  "7d_positivity_public":
    "7d_positivity_public : Testing positivity rate (%) of publicly funded COVID-19 tests during past 7 days",
  D1_12_coverage:
    "D1_12_coverage : COVID-19 vaccine coverage (%) among persons aged 12+ years receiving 1st dose",
  D1_5_11_coverage:
    "D1_5_11_coverage : COVID-19 vaccine coverage (%) among persons aged 5 to 11 years receiving 1st dose",
  D1_12_17_coverage:
    "D1_12_17_coverage : COVID-19 vaccine coverage (%) among persons aged 12 to 17 years receiving 1st dose",
  D1_18_coverage:
    "D1_18_coverage : COVID-19 vaccine coverage (%) among persons aged 18+ years receiving 1st dose",
  D1_18_49_coverage:
    "D1_18_49_coverage : COVID-19 vaccine coverage (%) among persons aged 18 to 49 years receiving 1st dose",
  D1_50_coverage:
    "D1_50_coverage : COVID-19 vaccine coverage (%) among persons aged 50+ years receiving 1st dose",
  D2_12_coverage:
    "D2_12_coverage : COVID-19 vaccine coverage (%) among persons aged 12+ years receiving 2nd dose",
  D2_12_17_coverage:
    "D2_12_17_coverage : COVID-19 vaccine coverage (%) among persons aged 12 to 17 years receiving 2nd dose",
  D2_18_coverage:
    "D2_18_coverage : COVID-19 vaccine coverage (%) among persons aged 18+ years receiving 2nd dose",
  D2_18_49_coverage:
    "D2_18_49_coverage : COVID-19 vaccine coverage (%) among persons aged 18 to 49 years receiving 2nd dose",
  D2_50_coverage:
    "D2_50_coverage : COVID-19 vaccine coverage (%) among persons aged 50+ years receiving 2nd dose",
  D3_70_coverage:
    "D3_70_coverage : COVID-19 vaccine coverage (%) among persons aged 70+ years receiving 3rd dose",
};

getLastObjectUrl({
  bucket: "data.opencovid.ca",
  prefix: "archive/bc/case-testing-vaccine-summary-by-CHSA-and-LHA",
  region: "us-east-2",
})
  .then(fetch)
  .then((res) => {
    if (!res.ok) throw new Error("fetch failed");
    return res;
  })
  .then((res) => res.arrayBuffer())
  .then((buffer) => XLSX.read(new Uint8Array(buffer), { type: "array" }))
  .then((data) => setupMap({ config, data }));
