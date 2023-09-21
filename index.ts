import { injectLambdaContext, Logger } from "@aws-lambda-powertools/logger";
import middy from "@middy/core";
import { BatchProcessor, EventType, processPartialResponse } from "@aws-lambda-powertools/batch";
import { DynamoDBRecord, DynamoDBStreamHandler } from "aws-lambda";
import { NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";

const items: unknown[] = [];
const logger: Logger = new Logger({ serviceName: "dynamodb-streams-playground" });
const processor = new BatchProcessor(EventType.DynamoDBStreams);
const unsupportedRegex = /unsupported/i;

const dynamoDBStreamHandler: DynamoDBStreamHandler = async (event, context) =>
  processPartialResponse(event, dynamoDBRecordHandler, processor, { context });

const dynamoDBRecordHandler = async (record: DynamoDBRecord): Promise<void> => {
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
