import { expect, test } from "@playwright/test";

async function seedAdminAuth(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    localStorage.setItem("sms_access_token", "access-token");
    localStorage.setItem("sms_refresh_token", "refresh-token");
    localStorage.setItem(
      "sms_auth_user",
      JSON.stringify({
        id: 1,
        first_name: "Workflow",
        last_name: "Admin",
        email: "workflow-admin@test.local",
        role: "administrator",
      }),
    );
  });
}

test("admission workflow enforces audited bulk transition payload and shows decision log", async ({ page }) => {
  await seedAdminAuth(page);

  let bulkPayload: Record<string, unknown> | null = null;

  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/admissions/management")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: 101,
              application_number: "APP-T060-1",
              student_name: "Workflow Learner",
              class_name: "grade_7",
              reviewer_name: "Unassigned",
              status: "pending",
              created_at: new Date().toISOString(),
            },
          ],
          page: 1,
          size: 100,
          total: 1,
        }),
      });
      return;
    }

    if (url.includes("/admissions/bulk-status")) {
      bulkPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ updated: 1 }),
      });
      return;
    }

    if (url.includes("/admissions/101/decision-log")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              timestamp: new Date().toISOString(),
              actor: "admin",
              reason: "Eligibility screening complete",
              source: "bulk-status",
              from_status: "pending",
              to_status: "under_review",
            },
          ],
        }),
      });
      return;
    }

    if (url.includes("/admissions/101/notes")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] }),
      });
      return;
    }

    if (url.includes("/auth/refresh-token")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "access-token",
          refresh_token: "refresh-token",
          token_type: "bearer",
          expires_in: 1800,
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.goto("/admission/manage");
  await expect(page.getByRole("heading", { name: "Application Management" })).toBeVisible();

  await page.getByLabel("Select admission APP-T060-1").check();
  await page.locator(".management-actions select").selectOption("under_review");
  await page.getByPlaceholder("Decision reason (required for audit)").fill("Eligibility screening complete");

  const bulkResponse = page.waitForResponse((response) => response.url().includes("/admissions/bulk-status"));
  await page.getByRole("button", { name: "Apply Status to Selected" }).click();
  await bulkResponse;

  expect(bulkPayload).toBeTruthy();
  expect(bulkPayload?.status).toBe("under_review");
  expect(bulkPayload?.reason).toBe("Eligibility screening complete");
  expect(bulkPayload?.actor).toBe("admin");

  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.getByRole("heading", { name: "Decision Audit Log" })).toBeVisible();
  await expect(page.getByText("pending -> under_review")).toBeVisible();
  await expect(page.getByText("Eligibility screening complete")).toBeVisible();
});
