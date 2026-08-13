import { test, expect } from "@playwright/test";

test.describe("QuestionCard UI Visual Verification Suite", () => {
  /**
   * WHY: Prepares the browser context environment before running individual assertions.
   * WHAT: Navigates the active headless browser tab to our dedicated React sandbox testing route.
   */
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/test-component");
  });

  /**
   * WHY: Verifies our XSS security fix successfully decodes character symbols inside a live browser layout.
   * WHAT: Inspects the header text node to guarantee the browser translated '&quot;' into literal punctuation.
   */
  test("20. should render the question header and successfully decode HTML entity codes into text", async ({
    page,
  }) => {
    const header = page.locator("h3");

    // Playwright checks the literal visual output of the page
    await expect(header).toHaveText(
      'Which planet is known as the "Red Planet"?',
    );
  });

  /**
   * WHY: Confirms clicking an option accurately mutates the game's state layout.
   * WHAT: Simulates a physical human finger clicking the 'Mars' button, and verifies that
   * all other buttons freeze and the themed "Selected" visual badge appears instantly.
   */
  test("21. should freeze option selections and display the Chosen badge when an option is clicked", async ({
    page,
  }) => {
    // Locate the multiple choice options buttons
    const marsButton = page.locator('button:has-text("Mars")');
    const venusButton = page.locator('button:has-text("Venus")');

    // Actively simulate a physical mouse click event handle
    await marsButton.click();

    // Forces Playwright to verify the 'Selected' text lives inside the Mars button layout block
    const selectedBadge = marsButton.locator("text=Selected");
    await expect(selectedBadge).toBeVisible();

    // Verify the safety rules work: all interactive option blocks must drop down to a disabled state
    await expect(marsButton).toBeDisabled();
    await expect(venusButton).toBeDisabled();
  });

  /**
   * WHY: Tests the robustness of our XSS decoding engine against a wide variety of symbols.
   * WHAT: Navigates to our stress-test scenario URL parameter and ensures amp, ord, and lt codes resolve cleanly.
   */
  test("22. should parse and cleanly display multiple different HTML entity characters simultaneously", async ({
    page,
  }) => {
    // Navigate explicitly to our character stress-test setup configuration parameter layout
    await page.goto(
      "http://localhost:3000/test-component?scenario=stress-test",
    );

    const header = page.locator("h3");
    const firstOption = page.locator("button").first();

    // Verify raw strings converted safely to literal characters: &amp; -> &, &#039; -> ', &lt; -> <
    await expect(header).toHaveText("Rock & Roll rules '90s trivia < Pop!");
    await expect(firstOption).toHaveText("True & Right");
  });

  /**
   * WHY: Catches off-by-one layout tracking bugs before they go live on production branches.
   * WHAT: Verifies that passing index 9 renders exactly as "10 / 10" in the tracking badge.
   * Scopes the locator by targeting the exact string directly to guarantee clean extraction.
   */
  test("23. should accurately calculate and render the correct boundary tracker metrics on the final question", async ({
    page,
  }) => {
    // Navigate explicitly to our final question layout setup parameters configuration page
    await page.goto(
      "http://localhost:3000/test-component?scenario=final-question",
    );

    // ✨ FIXED LINE: Looks specifically for the numeric tracking text string block itself
    const trackerBadge = page.getByText("10 / 10");

    // Confirms index 9 renders beautifully as "10 / 10" without text truncation or index off-by-one errors
    await expect(trackerBadge).toBeVisible();
  });
});
