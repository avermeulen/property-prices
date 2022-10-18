import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const urls = [
    'https://www.privateproperty.co.za/for-sale/gauteng/johannesburg/soweto/25?',
    'https://www.privateproperty.co.za/for-sale/gauteng/johannesburg/soweto/25?page=2',
    'https://www.privateproperty.co.za/for-sale/gauteng/johannesburg/soweto/25?page=3',
]


// const results = await scrape('https://www.privateproperty.co.za/for-sale/gauteng/johannesburg/soweto/25');

const results = []

// const url = `https://www.privateproperty.co.za/for-sale/gauteng/johannesburg/soweto/25?page=${pageNumber}`

// for (const url of urls) {

for (var i=1;i<=96;i++){
    const pageNumber = i;
    const url = `https://www.privateproperty.co.za/for-sale/gauteng/johannesburg/soweto/25?page=${pageNumber}`
    const properties = await scrape(url);
    results.push(...properties);
    console.log(`page : ${pageNumber}`);
}

console.log(results.length)

fs.writeFileSync('soweto.data.json', JSON.stringify(results), 'utf-8');

async function scrape(url) {
    const results = await axios.get(url);
    const $ = cheerio.load(results.data);
    const rows = $('.listingResult.row');
    const list = [];

    rows.each((_, e) => {

        const row = cheerio.load($(e).html());

        const data = {
            title: row('.title').text(),
            price: row('.priceDescription').text(),
            type: row('.propertyType').text(),
            suburb: row('.suburb').text(),
            address: row('.address').text(),
            info: row('.uspsString').text(),
        };

        const features = row('.features.row > div');

        // console.log(features.length);
        if (features[0] && features[1]) {
            data[$(features[1]).attr("class").replace('icon', '').trim()] = $(features[0]).text()
        }

        if (features[2] && features[3]) {
            data[$(features[3]).attr("class").replace('icon', '').trim()] = $(features[2]).text()
        }

        list.push(data);
    });
    return list;
}
