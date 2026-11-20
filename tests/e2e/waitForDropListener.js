import { expect } from "@playwright/test";

// The window drop listener is attached by an effect after hydration, which can
// land after the load event, and a drop before that is silently lost. The drag
// overlay only shows once the listener runs, so drag in until it does.
export const waitForDropListener = async (page, dataTransfer) => {
  await expect(async () => {
    await page.dispatchEvent("body", "dragenter", { dataTransfer });
    await expect(page.getByText("Drop your image here!")).toBeVisible({
      timeout: 200,
    });
  }).toPass();
};
