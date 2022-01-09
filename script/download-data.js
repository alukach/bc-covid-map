const AWS = require("aws-sdk");
const XLSX = require("xlsx");
const fs = require("fs/promises");

const s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "us-east-2" });

async function listLastObject({ bucket, prefix }) {
  let nextToken;
  while (true) {
    const response = await s3
      .makeUnauthenticatedRequest("listObjectsV2", {
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: nextToken,
      })
      .promise();

    if (response["NextContinuationToken"]) {
      nextToken = response["NextContinuationToken"];
    } else {
      return { Bucket: bucket, ...response.Contents.pop() };
    }
  }
}

async function openFile({ Key, Bucket }) {
  const response = await s3
    .makeUnauthenticatedRequest("getObject", {
      Bucket,
      Key,
    })
    .promise();
  return response.Body;
}

async function downloadWorksheets(workbook) {
  return Promise.all(
    ["LHA", "HA", "CHSA"].map((dataset) => {
      const filename = `./src/data/${dataset}.json`;
      console.log(`Writing "${filename}.json"...`);
      fs.writeFile(
        filename,
        JSON.stringify(XLSX.utils.sheet_to_json(workbook.Sheets[dataset]))
      );
    })
  );
}

listLastObject({
  bucket: "data.opencovid.ca",
  prefix: "archive/bc/case-testing-vaccine-summary-by-CHSA-and-LHA",
  region: "us-east-2",
})
  .then(openFile)
  .then(XLSX.read)
  .then(downloadWorksheets)
  .then(() => console.log("Complete."));
