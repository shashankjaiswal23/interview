const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const url = 'https://www.flipkart.com/realme-x2-pearl-green-64-gb/p/itm75023903eb431';

async function configureBrowser() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(url);
    return page;
}

async function checkPrice(page){
    await page.reload();
    let html = await page.evaluate(()=> document.body.innerHTML);
    let check = cheerio.load(html);
    let cd = check('._9-sL7L').html();
    if(cd == null){
        console.log('In Stock');
    } else {
        console.log('Out of Stock')
    }
}

async function monitor(){
    let page = await configureBrowser();
    await checkPrice(page);
}

monitor();