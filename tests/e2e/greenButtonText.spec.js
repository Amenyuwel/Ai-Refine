import { expect, test } from "@playwright/test";

const WHITE = "rgb(255, 255, 255)";

test("home UPLOAD IMAGE button has white text", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: "UPLOAD IMAGE" });
  await expect(button).toHaveCSS("color", WHITE);
});

test("about section green button has white text and icon", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Learn augmentation" });
  await link.scrollIntoViewIfNeeded();
  await expect(link.locator("span")).toHaveCSS("color", WHITE);
  await expect(link.locator("svg")).toHaveCSS("color", WHITE);
});
