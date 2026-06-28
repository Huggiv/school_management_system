import { expect, test } from "@playwright/test";

async function seedAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem("sms_access_token", "access-token");
    localStorage.setItem("sms_refresh_token", "refresh-token");
    localStorage.setItem(
      "sms_auth_user",
      JSON.stringify({
        id: 1,
        first_name: "Portal",
        last_name: "User",
        email: "portal@test.local",
        role: "administrator",
      }),
    );
  });
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();

    if (url.includes("/auth/login")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tokens: {
            access_token: "access-token",
            refresh_token: "refresh-token",
            token_type: "bearer",
            expires_in: 1800,
          },
          user: {
            id: 1,
            first_name: "Portal",
            last_name: "User",
            email: "portal@test.local",
            role: "administrator",
          },
        }),
      });
      return;
    }

    if (url.includes("/dashboard")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ students: 10, teachers: 5 }) });
      return;
    }

    if (url.includes("/admissions")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [{ id: 1, application_number: "APP-1", student_name: "John", status: "pending" }] }),
      });
      return;
    }

    if (url.includes("/grades")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [{ id: 1, student_id: 1, subject: "Math", marks: 90, grade: "A" }] }),
      });
      return;
    }

    if (url.includes("/assignments")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [{ id: 1, title: "Worksheet", description: "Solve", due_date: new Date().toISOString() }] }),
      });
      return;
    }

    if (url.includes("/announcements") || url.includes("/events") || url.includes("/gallery")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ items: [] }) });
      return;
    }

    if (url.includes("/files/upload") || url.includes("/submissions")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ path: "uploads/mock.pdf" }) });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });
});

test("login flow", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "portal@test.local");
  await page.fill('input[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});

test("role dashboard flow", async ({ page }) => {
  await seedAuth(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
});

test("admission submit flow", async ({ page }) => {
  await seedAuth(page);
  await page.goto("/admission");
  await page.fill('input[placeholder="Student Name"]', "Alice");
  await page.fill('input[placeholder="Gender"]', "Female");
  await page.fill('input[placeholder="Parent Name"]', "Parent A");
  await page.fill('input[placeholder="Address"]', "Main Street");
  await page.fill('input[placeholder="Grade Applying For"]', "8");
  await page.fill('input[placeholder="Contact Number"]', "1234567890");
  await page.fill('input[placeholder="Email"]', "alice@test.local");
  await page.click('button:has-text("Submit Application")');
  await expect(page.getByText("Applications Management")).toBeVisible();
});

test("assignment submission flow", async ({ page }) => {
  await seedAuth(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      "sms_auth_user",
      JSON.stringify({ id: 2, first_name: "Student", last_name: "User", email: "student@test.local", role: "student" }),
    );
  });
  await page.goto("/assignments");
  await expect(page.getByText("Assignment Board")).toBeVisible();
});

test("grade view flow", async ({ page }) => {
  await seedAuth(page);
  await page.goto("/grade");
  await expect(page.getByText("Grade Management")).toBeVisible();
});
