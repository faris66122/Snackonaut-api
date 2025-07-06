const fetch = require('node-fetch');

async function vendonApiRequest(endpoint, token) {
    const url = `https://cloud.vendon.net/rest/v1.7.0/${endpoint}`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Token ${token}`, 'Accept': 'application/json' }
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Vendon API-Fehler (${response.status}) bei ${endpoint}: ${errorBody}`);
    }
    return response.json();
}

exports.handler = async function(event, context) {
    const machineId = '90553182';
    const apiToken = process.env.VENDON_API_TOKEN;
    const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

    try {
        const productsData = await vendonApiRequest(`products?machine_id=${machineId}`, apiToken);
        const capacityMap = new Map();
        if (productsData.result) {
            productsData.result.forEach(p => {
                if (p.name && p.machine_defaults && typeof p.machine_defaults.amount_max === 'number' && p.machine_defaults.amount_max > 0) {
                    capacityMap.set(p.name, p.machine_defaults.amount_max);
                }
            });
        }

        const inventoryData = await vendonApiRequest(`stats/inventoryReport?machine_id=${machineId}`, apiToken);

        let finalProducts = [];
        if (inventoryData.result) {
            finalProducts = inventoryData.result.map(item => {
                const capacity = capacityMap.get(item.product_name);
                return capacity ? { name: item.product_name, amount: item.amount, capacity: capacity } : null;
            }).filter(p => p !== null);
        }

        return { statusCode: 200, headers, body: JSON.stringify(finalProducts) };
    } catch (error) {
        console.error("Fehler in Netlify Function:", error.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
