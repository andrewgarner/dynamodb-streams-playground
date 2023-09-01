import { describe, expect, it } from "@jest/globals";
import { myProject } from "./index";

describe("my project", () => {
  it("works", () => {
    expect(myProject).toBe("My project");
  });
});
