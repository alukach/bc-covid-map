import S3 from "aws-sdk/clients/S3";

export async function getLastObjectUrl({ bucket, region = "us-east-2", prefix }) {
  // TODO: Handle pagination.  Will only return 1000th object currently
  const objects = await new S3({ apiVersion: "2006-03-01", region })
    .makeUnauthenticatedRequest("listObjectsV2", {
      Bucket: bucket,
      Prefix: prefix,
    })
    .promise();
const lastObject = objects.Contents.pop()
  return `//s3-${region}.amazonaws.com/${bucket}/${lastObject.Key}`;
}
