// === FINALE, PRODUKTIONSREIFE NETLIFY FUNCTION (MIT KORREKTEN HEADERN) ===

import fetch from 'node-fetch';

// Hilfsfunktion, um API-Anfragen an Vendon zu senden
async function vendonApiRequest(endpoint, token) {
    const url = `https://cloud.vendon.net/rest/v1.7.0/${endpoint}`;
    const response = await fetch(url, {
        headers: { 
            'Authorization': `Token ${token}`,
            'Accept': 'application/json' // KORREKTUR: Dieser Header ist entscheidend!
        }
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Vendon API-Fehler (${response.status}) bei ${endpoint}: ${errorBody}`);
    }
    return response.json();
}

export const handler = async function(event, context) {
    const machineId = '90553182';
    const apiToken = process.env.VENDON_API_TOKEN;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

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
            finalProducts = inventoryData.result
                .map(item => {
                    const capacity = capacityMap.get(item.product_name);
                    if (capacity) {
                        return { name: item.product_name, amount: item.amount, capacity: capacity };
                    }
                    return null;
                })
                .filter(p => p !== null);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(finalProducts)
        };
        
    } catch (error) {
        console.error("Fehler in der Netlify Function:", error.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
