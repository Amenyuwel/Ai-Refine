import { expect, test } from "@playwright/test";

test("About link opens the info page at /info", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Learn augmentation" }).click();
  await page.waitForURL("**/info");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("old /feature/info URL no longer serves the info page", async ({
  page,
}) => {
  const response = await page.goto("/feature/info");
  expect(response.status()).toBe(404);
});
