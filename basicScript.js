const {chromium} = require('playwright')
const expect = require('expect')
const cron = require('node-cron')
const fs = require('fs')
const path = require('path')

const task = cron.schedule('* * * * *',  async () => {
    console.log('running a task every minute')

    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext({ storageState: 'state.json'})
    const page = await context.newPage()
    await page.goto('https://showroom.hyundai.ru/')

    let carsEmpty
    try {
        carsEmpty = await page.innerHTML('.cars-container')
        expect(carsEmpty).toBe('<!----> <!---->')
        await browser.close()
    } catch (e) {
        fs.writeFile(path.resolve(__dirname, 'Results/cars.html'), carsEmpty, { flag: 'a+' }, err => {
            console.error(err)
        })
        await page.screenshot({path: 'Results/showroom.png', fullPage: true })

        const cars = await page.$$('.cars-container >> text="Подробнее"')

        if (cars.length) {
            const [newPage] = await Promise.all([
                context.waitForEvent('page'),
                await cars[0].click({ modifiers: ['Meta']})
            ])
            const bodyCar = await newPage.innerHTML('body')
            fs.writeFile(path.resolve(__dirname, 'Results/car.html'), bodyCar, { flag: 'a+' }, err => {
                console.error(err)
            })
            await newPage.screenshot({path: 'Results/car.png', fullPage: true })
        }

        /*
        const context2 = await browser.newContext();
        const page2 = await context2.newPage();
        await page2.goto('https://showroom.hyundai.ru/auth');
        await page2.type('input[name = "phone"]', '9956308051', { delay: 400 });
        await page2.press('input[name = "phone"]', 'Enter');
         */

        // await browser.close();
        task.stop()
    }
});
