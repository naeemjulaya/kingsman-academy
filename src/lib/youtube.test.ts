import { describe, expect, it } from "vitest";
import { extractYouTubeId } from "./youtube";

describe("extractYouTubeId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=12", "dQw4w9WgXcQ"],
    ["https://youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("accepts %s", (url, expected) => expect(extractYouTubeId(url)).toBe(expected));

  it.each([null, "", "not-a-url", "https://evil.example/watch?v=dQw4w9WgXcQ", "https://youtube.com/watch?v=short"])(
    "rejects %s", (url) => expect(extractYouTubeId(url)).toBeNull(),
  );
});
