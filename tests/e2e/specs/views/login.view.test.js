import { test, expect } from "../../base.js";
import { MockServer } from "../../mockServer.js";

test.describe("Login view", () => {
  test("should display the login form", async ({ page }) => {
    await page.goto("/login");

    const loginView = page.locator("#login-view");
    await expect(
      loginView.getByRole("heading", { name: "Sign in" }),
    ).toBeVisible();
    await expect(loginView.locator("h2")).toContainText("IMPRO");

    const handleInput = page.locator('input[name="handle"]');
    await expect(handleInput).toBeVisible();
    await expect(handleInput).toHaveAttribute(
      "placeholder",
      "example.bsky.social",
    );

    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
  });

  test("should show error for invalid username", async ({ page }) => {
    const mockServer = new MockServer();
    await mockServer.setup(page);

    await page.goto("/login");

    await page.locator('input[name="handle"]').fill("invalid.test");
    await page.getByRole("button", { name: "Next" }).click();

    await expect(page.locator(".error-message")).toBeVisible({
      timeout: 10000,
    });
  });

  test("advanced section is collapsed by default and reveals the app view dropdown when expanded", async ({
    page,
  }) => {
    await page.goto("/login");

    const advanced = page.locator("#login-advanced");
    const select = advanced.locator('select[name="appview"]');

    await expect(advanced).toBeVisible();
    await expect(select).toBeHidden();

    await advanced.locator("summary").click();
    await expect(select).toBeVisible();
    await expect(select.locator("option")).toHaveText([
      "Bluesky",
      "Blacksky",
      "Custom",
    ]);
  });

  test("custom option reveals DID inputs and toggles off when a default is reselected", async ({
    page,
  }) => {
    await page.goto("/login");

    const advanced = page.locator("#login-advanced");
    await advanced.locator("summary").click();
    const select = advanced.locator('select[name="appview"]');

    await expect(
      advanced.locator('input[name="appViewServiceDid"]'),
    ).toHaveCount(0);

    await select.selectOption("custom");
    await expect(
      advanced.locator('input[name="appViewServiceDid"]'),
    ).toBeVisible();
    await expect(
      advanced.locator('input[name="chatServiceDid"]'),
    ).toBeVisible();

    await select.selectOption("bluesky");
    await expect(
      advanced.locator('input[name="appViewServiceDid"]'),
    ).toHaveCount(0);
  });

  test("prefills the advanced section from localStorage", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "appview-config",
        JSON.stringify({
          id: "blacksky",
          displayName: "Blacksky",
          appViewServiceDid: "did:web:api.blacksky.community#bsky_appview",
          chatServiceDid: "did:web:api.blacksky.community#bsky_chat",
        }),
      );
    });

    await page.goto("/login");

    const advanced = page.locator("#login-advanced");
    await advanced.locator("summary").click();
    await expect(advanced.locator('select[name="appview"]')).toHaveValue(
      "blacksky",
    );
  });

  test("prefills custom DID inputs when stored config is custom", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "appview-config",
        JSON.stringify({
          id: "custom",
          displayName: "Custom",
          appViewServiceDid: "did:web:custom.example#bsky_appview",
          chatServiceDid: "did:web:custom.example#bsky_chat",
        }),
      );
    });

    await page.goto("/login");

    const advanced = page.locator("#login-advanced");
    await advanced.locator("summary").click();
    await expect(advanced.locator('select[name="appview"]')).toHaveValue(
      "custom",
    );
    await expect(
      advanced.locator('input[name="appViewServiceDid"]'),
    ).toHaveValue("did:web:custom.example#bsky_appview");
    await expect(advanced.locator('input[name="chatServiceDid"]')).toHaveValue(
      "did:web:custom.example#bsky_chat",
    );
  });
});
