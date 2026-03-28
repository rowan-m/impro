import { test, expect } from "../../base.js";
import { login } from "../../helpers.js";
import { userProfile } from "../../fixtures.js";
import { MockServer } from "../../mockServer.js";

test.describe("App Shortcuts", () => {
  test("should open post composer automatically on /#newpost", async ({
    page,
  }) => {
    const mockServer = new MockServer();
    await mockServer.setup(page);

    await login(page);

    // Go to /#newpost
    await page.goto("/#newpost");

    // Wait for the post composer dialog to appear
    const composer = page.locator("post-composer .post-composer");
    await expect(composer).toBeVisible({ timeout: 10000 });

    // Check if the URL hash is cleared. It should end up on /
    await expect(page).toHaveURL("/");
  });

  test("should navigate to user profile on /#profile", async ({ page }) => {
    const mockServer = new MockServer();
    await mockServer.setup(page);

    await login(page);

    // Go to /#profile
    await page.goto("/#profile");

    // Wait for profile view to load
    const profileView = page.locator("#profile-view");
    await expect(profileView).toBeVisible({ timeout: 10000 });

    // Ensure the URL updated to the actual profile URL and hash is cleared
    await expect(page).toHaveURL(`/profile/${userProfile.did}`);
  });
});
