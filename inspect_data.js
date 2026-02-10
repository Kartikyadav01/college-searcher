const axios = require('axios');

const URL = 'https://raw.githubusercontent.com/VarthanV/Indian-Colleges-List/master/colleges.json';

async function run() {
    try {
        console.log('Fetching...');
        const res = await axios.get(URL);
        const data = res.data;

        console.log('Total:', data.length);

        // Count commonly used terms
        const eng = data.filter(c => c.college && /engineering/i.test(c.college));
        const tech = data.filter(c => c.college && /technology/i.test(c.college));
        const poly = data.filter(c => c.college && /polytechnic/i.test(c.college));
        const iit = data.filter(c => c.college && /indian institute of technology/i.test(c.college));

        console.log('With "Engineering":', eng.length);
        console.log('With "Technology":', tech.length);
        console.log('With "Polytechnic":', poly.length);

        // Check college_type values
        const types = [...new Set(data.map(c => c.college_type))];
        console.log('Types:', types);

    } catch (e) {
        console.error(e);
    }
}

run();
