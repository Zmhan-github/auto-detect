const {chromium} = require('playwright')


;(async () => {
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('https://showroom.hyundai.ru/auth')
    await page.type('input[name = "phone"]', '9956308051', { delay: 400 })
    await page.press('input[name = "phone"]', 'Enter')

    page.setDefaultNavigationTimeout(90000)

    const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click('a[target="_blank"]')
    ])

    console.log(await newPage.title())
    await context.storageState({ path: 'state.json' })
    await browser.close();
})();











