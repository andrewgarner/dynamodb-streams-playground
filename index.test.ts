import { describe, expect, it } from "@jest/globals";
import { dynamoDBStream } from "./index";

describe("dynamoDB Streams", () => {
  it("works", () => {
    expect(dynamoDBStream).toBe("DynamoDB Stream");
  });
});
