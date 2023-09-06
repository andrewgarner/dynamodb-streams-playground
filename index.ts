import { injectLambdaContext, Logger } from "@aws-lambda-powertools/logger";
import middy from "@middy/core";
import { DynamoDBBatchItemFailure, DynamoDBRecord, DynamoDBStreamHandler } from "aws-lambda";
import { NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";

const items: unknown[] = [];
const logger: Logger = new Logger({ serviceName: "dynamodb-streams-playground" });
const unsupportedRegex = /unsupported/i;

const dynamoDBStreamHandler: DynamoDBStreamHandler = async (event) => {
  const batchItemFailures: DynamoDBBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await dynamoDBRecordHandler(record);
    } catch (error) {
      logger.error("Error processing record", error as Error);
      const itemIdentifier = record.dynamodb?.SequenceNumber;
      if (itemIdentifier) batchItemFailures.push({ itemIdentifier });
    }
  }

  return { batchItemFailures };
};

const dynamoDBRecordHandler = async (record: DynamoDBRecord) => {
  if (record.dynamodb && record.dynamodb.NewImage) {
    logger.info("Processing record", { record: record.dynamodb });
    const item = unmarshall(record.dynamodb.NewImage as { [key: string]: NativeAttributeValue });
    if (unsupportedRegex.test(item["Message"])) throw new Error("Unsupported item");
    logger.info("Processed item", { item });
    items.push(item);
  }
};

export const getProcessedItems = async () => items;

export const handler = middy(dynamoDBStreamHandler).use(injectLambdaContext(logger, { logEvent: true }));
