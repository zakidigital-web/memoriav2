import { describe, expect, it } from "vitest";
import { getUserFromRequest } from "../api/_lib/auth";

describe("auth", () => {
  it("returns null when no bearer token is provided", async () => {
    const req: any = {
      headers: {
        host: "localhost",
      },
      query: {},
    };
    const user = await getUserFromRequest(req);
    expect(user).toBeNull();
  });
});
