const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS for all routes

// Data Source
const DATA_URL = 'https://raw.githubusercontent.com/VarthanV/Indian-Colleges-List/master/colleges.json';

let collegesData = [];
// Hardcoded states list to prevent cold start delays on Home Page
const statesList = [
    "Andaman & Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu And Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
let dataLoadingPromise = null;

// Fetch Data (Optimized for Serverless)
async function getOrLoadData() {
    if (collegesData.length > 0) return; // Data already loaded

    if (dataLoadingPromise) {
        await dataLoadingPromise;
        return;
    }

    try {
        console.log(`Fetching data from ${DATA_URL}...`);
        dataLoadingPromise = axios.get(DATA_URL);
        const response = await dataLoadingPromise;

        if (Array.isArray(response.data)) {
            collegesData = response.data;
            console.log(`Successfully loaded ${collegesData.length} colleges.`);
        } else {
            console.error('Data format error: Expected an array.');
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        dataLoadingPromise = null; // Reset promise on error so we can retry
    }
}

// Routes
// Home Page (HTML)
app.get('/', (req, res) => {
    // No need to await data load here anymore, states are hardcoded

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Indian Colleges Search</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 500px; width: 90%; }
            h1 { color: #2c3e50; margin-bottom: 20px; }
            p { color: #7f8c8d; margin-bottom: 30px; }
            select { padding: 12px; width: 100%; border-radius: 4px; border: 1px solid #ddd; font-size: 16px; margin-bottom: 20px; }
            .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; font-size: 16px; transition: background 0.3s; border: none; cursor: pointer; width: 100%; }
            .btn:hover { background: #2980b9; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 Indian Colleges Search</h1>
            <p>Select a state to view the list of colleges.</p>
            
            <select id="stateSelect">
                <option value="">Select a State...</option>
                ${statesList.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>

            <button class="btn" onclick="goToState()">View Colleges</button>
        </div>

        <script>
            function goToState() {
                const state = document.getElementById('stateSelect').value;
                if (state) {
                    window.location.href = '/view/states/' + state;
                } else {
                    alert('Please select a state first.');
                }
            }
        </script>
    </body>
    </html>
    `;

    res.send(html);
});

app.get('/states', async (req, res) => {
    await getOrLoadData();
    if (collegesData.length === 0) return res.status(503).json({ error: 'Data loading failed or unavailable.' });
    res.json({ count: statesList.length, states: statesList });
});

// Get colleges by specific state (Clean URL)
app.get('/states/:state', async (req, res) => {
    await getOrLoadData();
    if (collegesData.length === 0) return res.status(503).json({ error: 'Data loading...' });

    const stateName = req.params.state.toLowerCase();
    const results = collegesData.filter(c => c.state && c.state.toLowerCase() === stateName);

    res.json({
        state: req.params.state,
        count: results.length,
        data: results
    });
});

// HTML View Route (PDF-like list)
app.get('/view/states/:state', async (req, res) => {
    await getOrLoadData();
    if (collegesData.length === 0) return res.send('<h1>Data loading... please refresh in a moment.</h1>');

    const stateName = req.params.state;
    // Check for filter
    const isEngineering = req.query.type === 'engineering';

    let results = collegesData.filter(c => c.state && c.state.toLowerCase() === stateName.toLowerCase());

    if (isEngineering) {
        // Filter for Engineering / Technology / Polytechnic
        const engineeringKeywords = /engineering|technology|polytechnic|institute of technology/i;
        results = results.filter(c => c.college && engineeringKeywords.test(c.college));
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Colleges in ${stateName}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .meta { margin-bottom: 20px; color: #7f8c8d; display: flex; justify-content: space-between; align-items: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #3498db; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            tr:hover { background-color: #f1f1f1; }
            .print-btn { padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
            .state-select { padding: 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 14px; min-width: 200px; }
            .filters { margin-top: 10px; display: flex; gap: 10px; align-items: center; }
            .filter-label { font-weight: bold; color: #555; cursor: pointer; display: flex; align-items: center; gap: 5px; }
            @media print {
                body { background: white; padding: 0; }
                .container { box-shadow: none; max-width: 100%; border-radius: 0; padding: 0; }
                .print-btn, .state-select-container, .filters { display: none; }
                h1 { color: black; border-bottom: 1px solid black; }
                th { background-color: #eee; color: black; border: 1px solid black; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="state-select-container" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div class="filters">
                    <label class="filter-label">
                        <input type="checkbox" id="engFilter" ${isEngineering ? 'checked' : ''} 
                        onchange="toggleFilter(this)"> 
                        Show Only Engineering Colleges
                    </label>
                </div>
                <div>
                    <label for="stateSelect"><strong>Change State:</strong> </label>
                    <select id="stateSelect" class="state-select" onchange="changeState(this.value)">
                        <option value="">Select a State...</option>
                        ${statesList.map(s => `<option value="${s}" ${s.toLowerCase() === stateName.toLowerCase() ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>
            </div>

            <h1>${isEngineering ? 'Engineering ' : ''}Colleges in ${stateName}</h1>
            
            <div class="meta">
                <span>Total Colleges: <strong>${results.length}</strong></span>
                <button class="print-btn" onclick="window.print()">Save as PDF / Print</button>
            </div>

            ${results.length === 0 ? '<h3>No colleges found for this filter.</h3>' : `
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%">#</th>
                        <th style="width: 40%">College Name</th>
                        <th style="width: 25%">District</th>
                        <th style="width: 30%">University / Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((c, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${c.college || c.name || 'N/A'}</td>
                        <td>${c.district || 'N/A'}</td>
                        <td>${c.university || c.college_type || 'N/A'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>

        <script>
            function toggleFilter(checkbox) {
                const url = new URL(window.location.href);
                if (checkbox.checked) {
                    url.searchParams.set('type', 'engineering');
                } else {
                    url.searchParams.delete('type');
                }
                window.location.href = url.toString();
            }

            function changeState(state) {
                if (!state) return;
                const url = new URL(window.location.href);
                url.pathname = '/view/states/' + state;
                window.location.href = url.toString();
            }
        </script>
    </body>
    </html>
    `;

    res.send(html);
});

app.get('/colleges', async (req, res) => {
    await getOrLoadData();
    if (collegesData.length === 0) return res.status(503).json({ error: 'Data loading...' });

    let { state, district, search, page = 1, limit = 20 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let results = collegesData;

    // Filter by State
    if (state) {
        results = results.filter(c => c.state && c.state.toLowerCase() === state.toLowerCase());
    }

    // Filter by District
    if (district) {
        results = results.filter(c => c.district && c.district.toLowerCase() === district.toLowerCase());
    }

    // Search by Name (college)
    if (search) {
        const query = search.toLowerCase();
        results = results.filter(c => c.college && c.college.toLowerCase().includes(query));
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
        total: results.length,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit),
        data: paginatedResults
    });
});

// Start Server Check
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        getOrLoadData();
    });
}

module.exports = app;
