const { Builder, By, Key, util } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const _ = require('lodash');
let cookies = [];

function gaussianRandom(start, end) {
  return Math.floor(start + gaussianRand() * (end - start + 1));
}

function gaussianRand() {
  var rand = 0;
  for (var i = 0; i < 6; i += 1) {
    rand += Math.random();
  }
  return rand / 6;
}

const devices = ['iPhone 6', 'iPhone 7', 'iPhone 8', 'iPhone X', 'iPad', 'Pixel 2'];

async function getDriver (mobile) {
  if (mobile) {
    return await new Builder().forBrowser('chrome')
      .setChromeOptions(new chrome.Options()
        .setMobileEmulation({deviceName: _.sample(devices)})
        .addArguments(`user-data-dir=${chromeProfile}`)
        .addArguments('test-type'))
      .build();
  } else {
    return await new Builder().forBrowser('chrome')
      .setChromeOptions(new chrome.Options()
        .addArguments(`user-data-dir=${chromeProfile}`))
      .build();
  }
};

async function getLocalStorageItem(driver, key) {
  return await driver.executeScript("return localStorage.getItem(arguments[0])", key);
}

async function setLocalStorageItem(driver, key, value) {
  return await driver.executeScript("return localStorage.setItem(arguments[0], arguments[1])", key, value);
}

async function runSelenium (options) {
  console.log(options);

  let driver = await getDriver(options.mobile);

  await driver.sleep(1000);

  console.log(await getLocalStorageItem(driver, 'tracking_id'));
  console.log(await driver.manage().getCookies());

  await driver.sleep(2000);

  for (i = 0; i < (options.seconds); i++) {
    console.log('JUST HANGING AROUND');
    await driver.sleep(1000);
    await driver.findElement(By.tagName('body')).sendKeys(_.sample([Key.PAGE_DOWN, Key.PAGE_UP]));
  };

  if (!options.bounce) {
    console.log('DIDNT BOUNCE');
    await driver.navigate().refresh();
    await driver.sleep(3000);
  }

  if (options.hit) {
    console.log('ITS A HIT!');
    await driver.findElement(By.xpath('//a[@class="chat-whatsapp"]')).click();
    await driver.sleep(2000);
    await driver.findElement(By.tagName('body')).sendKeys(Key.CONTROL + Key.TAB);
  }

  await driver.sleep(2000);

  if (!options.repeated) {
    console.log('NEW USER, REMOVE COOKIES');
    await driver.manage().deleteAllCookies();
  };

  await driver.sleep(1000);

  await driver.close();
  await driver.quit();
  await driver.sleep(120000);
}

const scripts = [];

for (i = 0; i < sessions; i++) {
  scripts.push({id: i, mobile: 0, bounce: 0, hit: 0, repeated: 0, seconds: avgSeconds});
};

for (i = 0; i < mobiles; i++) {
  _.sample(scripts.filter((script) => !script.mobile)).mobile = 1;
};

for (i = 0; i < bounces; i++) {
  _.sample(scripts.filter((script) => !script.bounce)).bounce = 1;
};

for (i = 0; i < hits; i++) {
  _.sample(scripts.filter((script) => !(script.hit || script.bounce))).hit = 1;
};

for (i = 0; i < (sessions - users); i++) {
  _.sample(_.initial(scripts).filter((script) => !script.repeated)).repeated = 1;
};

async function runScripts (scripts) {
  for (const script of scripts) {
    await runSelenium(script);
  };
};

runScripts(scripts);
