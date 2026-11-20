import { expect, test } from "@playwright/test";

test("navbar has no CONTACT link", async ({ page }) => {
  await page.goto("/");
  const navbar = page.getByRole("banner");
  await expect(navbar.getByRole("link", { name: "ABOUT" })).toBeVisible();
  await expect(navbar.getByRole("link", { name: "CONTACT" })).toHaveCount(0);
  await expect(page.locator("#contact")).toHaveCount(0);
});

test("upload page has no SHARE button", async ({ page }) => {
  await page.goto("/upload");
  await expect(page.getByRole("button", { name: "SHARE" })).toHaveCount(0);
});
