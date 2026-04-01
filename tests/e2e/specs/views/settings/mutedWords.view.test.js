import { test, expect } from "../../../base.js";
import { login } from "../../../helpers.js";
import { MockServer } from "../../../mockServer.js";

test.describe("Settings Muted Words view", () => {
  test("should display header and form sections", async ({ page }) => {
    const mockServer = new MockServer();
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    await expect(view.locator('[data-testid="header-title"]')).toContainText(
      "Muted words",
      { timeout: 10000 },
    );

    await expect(view).toContainText("Add muted words and tags");
    await expect(view).toContainText(
      "Posts can be muted based on their text, their tags, or both.",
    );

    await expect(
      view.locator('[data-testid="muted-word-input"]'),
    ).toBeVisible();
    await expect(view.locator('[data-testid="duration-group"]')).toBeVisible();
    await expect(view.locator('[data-testid="target-group"]')).toBeVisible();
    await expect(
      view.locator('[data-testid="exclude-following"]'),
    ).toBeVisible();
    await expect(view.locator('[data-testid="muted-word-add"]')).toBeVisible();
  });

  test("should display empty state when no muted words exist", async ({
    page,
  }) => {
    const mockServer = new MockServer();
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    await expect(
      view.locator('[data-testid="muted-word-empty"]'),
    ).toContainText("You haven't muted any words or tags yet", {
      timeout: 10000,
    });
  });

  test("should display existing muted words", async ({ page }) => {
    const mockServer = new MockServer();
    mockServer.mutedWords = [
      {
        id: "word-1",
        value: "spoiler",
        targets: ["content", "tag"],
        actorTarget: "all",
      },
      {
        id: "word-2",
        value: "politics",
        targets: ["tag"],
        actorTarget: "all",
      },
    ];
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    const items = view.locator('[data-testid="muted-word-item"]');
    await expect(items).toHaveCount(2, { timeout: 10000 });

    // List is reversed (newest first)
    await expect(items.nth(0)).toContainText("politics");
    await expect(items.nth(0)).toContainText("in tags");
    await expect(items.nth(1)).toContainText("spoiler");
    await expect(items.nth(1)).toContainText("in text & tags");
  });

  test("should add a muted word", async ({ page }) => {
    const mockServer = new MockServer();
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    await expect(view.locator('[data-testid="muted-word-empty"]')).toBeVisible({
      timeout: 10000,
    });

    await view.locator('[data-testid="muted-word-input"]').fill("test-word");
    await view.locator('[data-testid="muted-word-add"]').click();

    await expect(view.locator('[data-testid="muted-word-item"]')).toHaveCount(
      1,
      { timeout: 10000 },
    );
    await expect(
      view.locator('[data-testid="muted-word-item"]').first(),
    ).toContainText("test-word");
    await expect(
      view.locator('[data-testid="muted-word-empty"]'),
    ).not.toBeVisible();
  });

  test("should remove a muted word", async ({ page }) => {
    const mockServer = new MockServer();
    mockServer.mutedWords = [
      {
        id: "word-1",
        value: "removeme",
        targets: ["content", "tag"],
        actorTarget: "all",
      },
    ];
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    await expect(view.locator('[data-testid="muted-word-item"]')).toHaveCount(
      1,
      { timeout: 10000 },
    );

    await view.locator('[data-testid="muted-word-delete"]').click();

    // Confirm dialog should appear
    const dialog = page.locator("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog).toContainText("Are you sure?");
    await expect(dialog).toContainText(
      'This will delete "removeme" from your muted words',
    );

    // Click Remove to confirm
    await dialog.locator(".confirm-button").click();

    await expect(view.locator('[data-testid="muted-word-item"]')).toHaveCount(
      0,
      { timeout: 10000 },
    );
    await expect(
      view.locator('[data-testid="muted-word-empty"]'),
    ).toBeVisible();
  });

  test("should show error for empty input", async ({ page }) => {
    const mockServer = new MockServer();
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    const addButton = view.locator('[data-testid="muted-word-add"]');
    await expect(addButton).toBeVisible({ timeout: 10000 });

    // Button should be disabled when input is empty
    await expect(addButton).toBeDisabled();

    // Type a word, button should become enabled
    await view.locator('[data-testid="muted-word-input"]').fill("test");
    await expect(addButton).toBeEnabled();

    // Clear input, button should be disabled again
    await view.locator('[data-testid="muted-word-input"]').fill("");
    await expect(addButton).toBeDisabled();
  });

  test("should display expiry information", async ({ page }) => {
    const mockServer = new MockServer();
    const futureDate = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    mockServer.mutedWords = [
      {
        id: "word-1",
        value: "temporary",
        targets: ["content", "tag"],
        actorTarget: "all",
        expiresAt: futureDate,
      },
    ];
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    const item = view.locator('[data-testid="muted-word-item"]');
    await expect(item).toBeVisible({ timeout: 10000 });
    await expect(item.locator(".muted-word-item-meta")).toContainText(
      "Expires in",
    );
  });

  test("should display exclude-following label", async ({ page }) => {
    const mockServer = new MockServer();
    mockServer.mutedWords = [
      {
        id: "word-1",
        value: "filtered",
        targets: ["content", "tag"],
        actorTarget: "exclude-following",
      },
    ];
    await mockServer.setup(page);

    await login(page);
    await page.goto("/settings/muted-words");

    const view = page.locator("#settings-muted-words-view");
    const item = view.locator('[data-testid="muted-word-item"]');
    await expect(item).toBeVisible({ timeout: 10000 });
    await expect(item.locator(".muted-word-item-meta")).toContainText(
      "Excludes users you follow",
    );
  });
});
