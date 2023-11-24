const express = require('express');
const app = express();
const server = require('http').Server(app);
const hostname = '127.0.0.1';
const port = 8080;

const playwright = require("playwright");

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.urlencoded());
app.use(express.json());

//pre-flight requests
app.options('*', function(req, res) {
  res.send(200);
});

app.get('/', (err, res) => {
  res.status(200);
  res.json({ working: true });
  res.end();
});

//If we had more we'd make this /chatGPT
app.post('/', async (req, res) => {
  const { username, password } = req.body

  try {
    await cancelChatGPT(username, password, res)
  }
  catch (err) {
    console.log(err)
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//This cancels using Google Auth with MFA, which is my typical signup/use case
async function cancelChatGPT(username, password, res) {
  const browser = await playwright.firefox.launch({ headless: false });
  const context = await browser.newContext();
  const landingPage = await context.newPage();

  await landingPage.goto('https://openai.com/');

  await landingPage.click('text=Log in');

  return context.once('page', async (page) => {
    await page.waitForLoadState();
    await page.waitForSelector('[data-provider="google"]')

    await landingPage.close()
    await page.click('[data-provider="google"]')

    await page.getByLabel('Email or phone').fill(username)
    await page.getByText('Next').click()

    await page.getByLabel('Enter your password').fill(password)
    await page.getByText('Next').last().click()

    //Not Ideal
    await page.waitForTimeout(1000)

    const wrongPassword = await page.getByText('Wrong password. Try again or click Forgot password to reset it.').isVisible()

    if (wrongPassword) {
      console.log("User entered incorrect password.")
      // We could wait for user to correct password or return and come back later

      await browser.close()

      res.send({ success: false, error: "Incorrect Password." })

      return res.end()
    }

    //Not Ideal
    const MFA = page.url().includes('https://accounts.google.com/v3/signin/challenge/pwd')

    if (MFA) {
      console.log("Waiting for Multi-Factor Auth")
      //We should stream to the frontend telling them to allow mfa
    }

    await page.waitForURL("https://platform.openai.com/apps")

    await page.goto("https://chat.openai.com/auth/login?sso")

    await page.waitForURL("https://chat.openai.com/")
    await page.click('[id="headlessui-menu-button-:rc:"]')
    await page.getByText('My plan').click()
    await page.getByText("Manage my subscription").click()

    await page.waitForSelector('[data-test="cancel-subscription"]')
    await page.click('[data-test="cancel-subscription"]')

    await browser.close()

    res.send({ success: true })

    return res.end()
  });
}