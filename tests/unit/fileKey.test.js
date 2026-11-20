import { expect, test } from "vitest";
import { getFileKey, getFileSha256 } from "@/utils/fileKey";

const CAT_BYTES = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
const DOG_BYTES = new Uint8Array([137, 80, 78, 71, 4, 5, 6]);

const readFileKey = async (file) => getFileKey(file, await getFileSha256(file));

test("same bytes under another name and date give the same key", async () => {
  const original = new File([CAT_BYTES], "cat.png", { lastModified: 1 });
  const renamedCopy = new File([CAT_BYTES], "cat copy.png", {
    lastModified: 2,
  });

  expect(await readFileKey(renamedCopy)).toBe(await readFileKey(original));
});

test("different files with the same name give different keys", async () => {
  const cat = new File([CAT_BYTES], "image.png", { lastModified: 1 });
  const dog = new File([DOG_BYTES], "image.png", { lastModified: 1 });

  expect(await readFileKey(dog)).not.toBe(await readFileKey(cat));
});

test("the key is the SHA-256 of the content", async () => {
  const empty = new File([], "empty.png");

  expect(await readFileKey(empty)).toBe(
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
});

test("without a content hash the key is the file's identity", () => {
  const cat = new File([CAT_BYTES], "cat.png", { lastModified: 1 });

  expect(getFileKey(cat, null)).toBe("cat.png:7:1");
});
