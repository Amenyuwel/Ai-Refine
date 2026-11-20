import { expect, test } from "@playwright/test";

const EXAMPLES = ["Animal", "Object", "Pest"];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// The app hands each file to URL.createObjectURL, so record them to inspect
// exactly what the drop delivered.
const recordObjectUrlFiles = (page) =>
  page.addInitScript(() => {
    window.__objectUrlFiles = [];
    const createObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (file) => {
      window.__objectUrlFiles.push(file);
      return createObjectURL(file);
    };
  });

for (const name of EXAMPLES) {
  test(`dragging the ${name} example into the page uploads it`, async ({
    page,
  }) => {
    await recordObjectUrlFiles(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const example = page.getByRole("button", {
      name: `${name} example image`,
    });
    await expect(example).toBeVisible();

    // Real pointer drag. dragstart is cancelled until the example files have
    // loaded, so retry the drag until the overlay shows.
    const overlayText = page.getByText("Drop your image here!");
    await expect(async () => {
      const box = await example.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(400, 300, { steps: 10 });
      await page.mouse.move(420, 320, { steps: 5 });
      try {
        await expect(overlayText).toBeVisible({ timeout: 500 });
      } catch (error) {
        await page.mouse.up();
        throw error;
      }
    }).toPass();

    await page.mouse.up();
    await page.waitForURL("**/upload");
    await expect(
      page.getByRole("button", { name: "Delete selected image" }),
    ).toBeVisible();
    await expect(page.locator('[data-tour="image-footer"] img')).toHaveCount(1);

    const droppedFile = await page.evaluate(async () => {
      const [file] = window.__objectUrlFiles;
      const bytes = new Uint8Array(await file.arrayBuffer());
      return {
        name: file.name,
        type: file.type,
        signature: Array.from(bytes.slice(0, 8)),
      };
    });
    expect(droppedFile.type).toBe("image/png");
    expect(droppedFile.name).toMatch(/\.png$/);
    expect(droppedFile.signature).toEqual(PNG_SIGNATURE);
  });
}

for (const name of EXAMPLES) {
  test(`the ${name} example shows a toast when its image is not ready`, async ({
    page,
  }) => {
    await page.route(`**/images/${name}.png`, (route) => route.abort());
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const example = page.getByRole("button", {
      name: `${name} example image`,
    });
    // The drag only reaches the handler once the page has hydrated, so retry
    const toast = page.getByText("Example image is not ready yet");
    await expect(async () => {
      const box = await example.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(400, 300, { steps: 10 });
      await page.mouse.up();
      await expect(toast).toBeVisible({ timeout: 500 });
    }).toPass();
    await expect(page).toHaveURL(/\/$/);

    await example.click();
    await expect(
      page.getByText("Failed to process example image"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });
}

for (const width of [375, 1280]) {
  for (const name of EXAMPLES) {
    test(`clicking the ${name} example loads it at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.getByRole("button", { name: `${name} example image` }).click();
      await page.waitForURL("**/upload");
      await expect(page.locator('[data-tour="image-footer"] img')).toHaveCount(
        1,
      );
    });
  }
}

test("an example is activated with the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Animal example image" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/upload");
  await expect(page.locator('[data-tour="image-footer"] img')).toHaveCount(1);
});
