import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { waitForDropListener } from "./waitForDropListener";

const FIXTURE = path.resolve(__dirname, "../fixtures/cat.png");

// Playwright has no file drag from the OS, so build the DataTransfer in the
// page and dispatch the drop the window listener handles.
const dropFixture = async (page) => {
  const base64 = (await readFile(FIXTURE)).toString("base64");
  const dataTransfer = await page.evaluateHandle((encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "cat.png", { type: "image/png" }));
    return transfer;
  }, base64);
  await waitForDropListener(page, dataTransfer);
  await page.dispatchEvent("body", "drop", { dataTransfer });
};

test("upload page has no GitHub or LinkedIn footer, home page keeps it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "GitHub profile" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "LinkedIn profile" }),
  ).toBeVisible();

  await dropFixture(page);
  await page.waitForURL("**/upload");
  await expect(
    page.getByRole("button", { name: "Delete selected image" }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "GitHub profile" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: "LinkedIn profile" }),
  ).toHaveCount(0);
  await expect(page.locator('[data-tour="image-footer"]')).toBeVisible();
});
