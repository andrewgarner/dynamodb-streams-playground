import { describe, expect, it } from "@jest/globals";
import { DynamoDBStreamEvent } from "aws-lambda";
import { ContextExamples } from "@aws-lambda-powertools/commons";
import { getProcessedItems, handler } from "./index.js";

describe("handler", () => {
  it("handles a DynamoDB stream event", async () => {
    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventID: "c4ca4238a0b923820dcc509a6f75849b",
          eventName: "INSERT",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "eu-west-1",
          dynamodb: {
            Keys: {
              Id: {
                N: "101",
              },
            },
            NewImage: {
              Message: {
                S: "New item!",
              },
              Id: {
                N: "101",
              },
            },
            ApproximateCreationDateTime: 1428537600,
            SequenceNumber: "4421584500000000017450439091",
            SizeBytes: 26,
            StreamViewType: "NEW_AND_OLD_IMAGES",
          },
          eventSourceARN: "arn:aws:dynamodb:eu-west-1:123456789012:table/playground/stream/2015-06-27T00:48:05.899",
        },
        {
          eventID: "c81e728d9d4c2f636f067f89cc14862c",
          eventName: "MODIFY",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "eu-west-1",
          dynamodb: {
            Keys: {
              Id: {
                N: "101",
              },
            },
            NewImage: {
              Message: {
                S: "This item has changed",
              },
              Id: {
                N: "101",
              },
            },
            OldImage: {
              Message: {
                S: "New item!",
              },
              Id: {
                N: "101",
              },
            },
            ApproximateCreationDateTime: 1428537600,
            SequenceNumber: "4421584500000000017450439092",
            SizeBytes: 59,
            StreamViewType: "NEW_AND_OLD_IMAGES",
          },
          eventSourceARN: "arn:aws:dynamodb:eu-west-1:123456789012:table/playground/stream/2015-06-27T00:48:05.899",
        },
        {
          eventID: "eccbc87e4b5ce2fe28308fd9f2a7baf3",
          eventName: "REMOVE",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "eu-west-1",
          dynamodb: {
            Keys: {
              Id: {
                N: "101",
              },
            },
            OldImage: {
              Message: {
                S: "This item has changed",
              },
              Id: {
                N: "101",
              },
            },
            ApproximateCreationDateTime: 1428537600,
            SequenceNumber: "4421584500000000017450439093",
            SizeBytes: 38,
            StreamViewType: "NEW_AND_OLD_IMAGES",
          },
          eventSourceARN: "arn:aws:dynamodb:eu-west-1:123456789012:table/playground/stream/2015-06-27T00:48:05.899",
        },
      ],
    };

    await expect(handler(event, ContextExamples.helloworldContext)).resolves.toMatchObject({ batchItemFailures: [] });
    await expect(getProcessedItems()).resolves.toMatchObject([
      { Id: 101, Message: "New item!" },
      { Id: 101, Message: "This item has changed" },
    ]);
  });

  it("reports a batch item failure when there is an error processing a record", async () => {
    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventID: "c4ca4238a0b923820dcc509a6f75849b",
          eventName: "INSERT",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "eu-west-1",
          dynamodb: {
            Keys: {
              Id: {
                N: "101",
              },
            },
            NewImage: {
              Message: {
                S: "Unsupported item!",
              },
              Id: {
                N: "101",
              },
            },
            ApproximateCreationDateTime: 1428537600,
            SequenceNumber: "4421584500000000017450439091",
            SizeBytes: 26,
            StreamViewType: "NEW_AND_OLD_IMAGES",
          },
          eventSourceARN: "arn:aws:dynamodb:eu-west-1:123456789012:table/playground/stream/2015-06-27T00:48:05.899",
        },
        {
          eventID: "eccbc87e4b5ce2fe28308fd9f2a7baf3",
          eventName: "REMOVE",
          eventVersion: "1.1",
          eventSource: "aws:dynamodb",
          awsRegion: "eu-west-1",
          dynamodb: {
            Keys: {
              Id: {
                N: "101",
              },
            },
            OldImage: {
              Message: {
                S: "This item has changed",
              },
              Id: {
                N: "101",
              },
            },
            ApproximateCreationDateTime: 1428537600,
            SequenceNumber: "4421584500000000017450439093",
            SizeBytes: 38,
            StreamViewType: "NEW_AND_OLD_IMAGES",
          },
          eventSourceARN: "arn:aws:dynamodb:eu-west-1:123456789012:table/playground/stream/2015-06-27T00:48:05.899",
        },
      ],
    };

    await expect(handler(event, ContextExamples.helloworldContext)).resolves.toMatchObject({
      batchItemFailures: [{ itemIdentifier: "4421584500000000017450439091" }],
    });
  });
});
