import assert from "node:assert/strict";
import { unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const appUrl = process.env.KOKWET_APP_URL || "http://localhost:5173";
const apiUrl = process.env.KOKWET_API_URL || "http://localhost:5000/api";
const adminEmail = process.env.KOKWET_ADMIN_EMAIL || "admin@kokwetgroceries.co.ke";
const adminPassword = process.env.KOKWET_ADMIN_PASSWORD || "admin1234";
const outcomes = [];
const imagePath = path.join(os.tmpdir(), `kokwet-selenium-${Date.now()}.png`);
const uploadedImagePaths = new Set();
const productName = `Selenium upload check ${Date.now()}`;

const options = new chrome.Options()
  .addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,1000");
let driver;

async function check(name, action) {
  try {
    await action();
    outcomes.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    outcomes.push({ name, ok: false, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function openPath(route, heading) {
  await driver.get(`${appUrl}${route}`);
  await driver.wait(async () => {
    const headings = await driver.findElements(By.css("h1, h2, h3"));
    for (const headingElement of headings) {
      if ((await headingElement.getText()).toLowerCase().includes(heading.toLowerCase())) return true;
    }
    return false;
  }, 12000, `The page ${route} did not show the expected heading: ${heading}`);
}

async function createAndVerifyUploadedProduct() {
  await openPath("/admin/products/new", "Add a new product");
  await driver.wait(until.elementLocated(By.css("select option:nth-child(2)")), 10000);
  await driver.findElement(By.xpath("//label[normalize-space()='Product name']/following-sibling::input")).sendKeys(productName);
  await driver.findElement(By.xpath("//label[normalize-space()='Description']/following-sibling::textarea")).sendKeys("Temporary Selenium image upload verification product.");
  const category = await driver.findElement(By.xpath("//label[normalize-space()='Category']/following-sibling::select"));
  const categoryChoices = await category.findElements(By.css("option"));
  assert.ok(categoryChoices.length > 1, "No categories are available for the product form.");
  await categoryChoices[1].click();
  await driver.findElement(By.xpath("//label[normalize-space()='Unit']/following-sibling::input")).sendKeys("1 piece");
  await driver.findElement(By.xpath("//label[contains(., 'Selling price')]/following-sibling::input")).sendKeys("25");
  await driver.findElement(By.xpath("//label[normalize-space()='Stock quantity']/following-sibling::input")).sendKeys("12");
  await driver.findElement(By.id("product-image")).sendKeys(imagePath);
  await driver.wait(until.elementLocated(By.css("img[alt='Product photo preview']")), 5000);
  const submitButton = await driver.findElement(By.css("form button[type='submit']"));
  await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", submitButton);
  await driver.executeScript("arguments[0].click()", submitButton);
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes("/admin/products") && !currentUrl.includes("/new");
  }, 20000, "Product form did not complete and return to the product list.");

  const row = await driver.wait(async () => {
    const rows = await driver.findElements(By.css("tbody tr"));
    for (const candidate of rows) if ((await candidate.getText()).includes(productName)) return candidate;
    return false;
  }, 15000, "Uploaded product did not appear in the admin product list.");
  const image = await row.findElement(By.css("img")).getAttribute("src");
  assert.ok(image.startsWith("http://localhost:5000/uploads/"), `Expected a stored upload URL, got ${image}`);
  uploadedImagePaths.add(path.basename(new URL(image).pathname));

  await row.findElement(By.xpath(".//button[contains(., 'Delete')]" )).click();
  await driver.findElement(By.xpath("//button[contains(., 'Yes, delete')]" )).click();
  await driver.wait(async () => {
    const rows = await driver.findElements(By.css("tbody tr"));
    for (const candidate of rows) if ((await candidate.getText()).includes(productName)) return false;
    return true;
  }, 10000, "Temporary test product could not be deleted from the dashboard.");
}

async function cleanupProduct() {
  if (!driver) return;
  const filenameList = [...uploadedImagePaths];
  try {
    const result = await driver.executeAsyncScript((url, name, done) => {
      const stored = localStorage.getItem("kokwet_user");
      const token = stored ? JSON.parse(stored).token : "";
      fetch(`${url}/products/admin/all`, { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => response.ok ? response.json() : [])
        .then((products) => {
          const product = products.find((item) => item.name === name);
          if (!product) return done(null);
          fetch(`${url}/products/${product._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
            .then(() => done(null)).catch((error) => done(error.message));
        }).catch((error) => done(error.message));
    }, apiUrl, productName);
    if (result) console.error(`Cleanup warning: ${result}`);
  } catch { /* browser may not have reached the admin session */ }
  for (const filename of filenameList) {
    if (/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(filename)) {
      await unlink(path.resolve("../backend/uploads", filename)).catch(() => {});
    }
  }
}

try {
  await writeFile(imagePath, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=", "base64"));
  driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30000, script: 15000 });

  await check("admin login and dashboard", async () => {
    await driver.get(`${appUrl}/admin/login`);
    await driver.findElement(By.css("input[type='email']")).sendKeys(adminEmail);
    await driver.findElement(By.css("input[type='password']")).sendKeys(adminPassword);
    await driver.executeScript("document.querySelector('form').requestSubmit()");
    await driver.wait(until.urlContains("/admin"), 12000);
    await driver.wait(until.elementLocated(By.xpath("//*[contains(., 'Welcome back') or contains(., 'Total orders')]")), 12000);
  });

  for (const [route, heading] of [
    ["/admin/products", "Products"],
    ["/admin/categories", "Categories"],
    ["/admin/orders", "Orders"],
    ["/admin/staff", "Staff and employment"],
    ["/admin/statistics", "Business statistics"],
    ["/admin/settings", "Store settings"],
  ]) {
    await check(`admin component ${route}`, () => openPath(route, heading));
  }

  await check("admin uploads and displays a product image, then deletes the temporary product", createAndVerifyUploadedProduct);

  await check("customer storefront and featured content", () => openPath("/", "Fresh groceries"));
  await check("client category browsing", () => openPath("/categories", "All categories"));
  await check("client search page", () => openPath("/search?q=milk", "Results for"));
  await check("client cart page", () => openPath("/cart", "Your cart"));
  await check("client login page", () => openPath("/login", "Log in to your account"));
  await check("client signup page", () => openPath("/register", "Create your account"));
  await check("client guided help page", () => openPath("/help", "How can we help?"));

  await check("footer links have active destinations", async () => {
    const links = await driver.findElements(By.css("footer a"));
    assert.ok(links.length >= 10, `Expected at least 10 footer links, found ${links.length}`);
    for (const link of links) assert.ok(await link.getAttribute("href"), "Found a footer link without a destination.");
  });

  await check("live help chat accepts a typed enquiry", async () => {
    await driver.findElement(By.css("button[aria-label='Open quick help']")).click();
    await driver.wait(until.elementLocated(By.css("#kokwet-help-message")), 5000);
    await driver.findElement(By.css("#kokwet-help-message")).sendKeys("Can I track my order?");
    await driver.findElement(By.css("button[aria-label='Send message']")).click();
    await driver.wait(async () => {
      const bodyText = await driver.findElement(By.css("body")).getText();
      return bodyText.includes("Can I track my order?") && bodyText.includes("Sign in to view delivery progress");
    }, 5000, "The live chat did not render the typed enquiry and its response");
  });

  await check("client login reports invalid credentials without crashing", async () => {
    await openPath("/login", "Log in to your account");
    await driver.findElement(By.css("input[type='email']")).sendKeys("selenium-no-account@example.invalid");
    await driver.findElement(By.css("input[type='password']")).sendKeys("invalid-password");
    const formState = await driver.executeScript("return { valid: document.querySelector('form').checkValidity(), email: document.querySelector('input[type=email]').value, button: document.querySelector('form button[type=submit]').outerHTML };");
    console.log(`Login form state: ${JSON.stringify(formState)}`);
    await driver.findElement(By.css("button[type='submit']")).click();
    await driver.sleep(1000);
    let error;
    try { error = await driver.wait(until.elementLocated(By.css(".text-red-600")), 15000); }
    catch (waitError) { throw new Error(`${waitError.message}; visible page text: ${(await driver.findElement(By.css("body")).getText()).slice(-700)}`); }
    assert.match(await error.getText(), /incorrect|account|log in/i);
  });
} catch (error) {
  console.error(`Selenium run stopped: ${error.stack || error.message}`);
  outcomes.push({ name: "selenium runner", ok: false, error: error.message });
} finally {
  await cleanupProduct();
  await unlink(imagePath).catch(() => {});
  if (driver) await driver.quit().catch(() => {});
}

const failures = outcomes.filter((outcome) => !outcome.ok);
console.log(`\nSelenium result: ${outcomes.length - failures.length}/${outcomes.length} checks passed.`);
if (failures.length) process.exitCode = 1;
