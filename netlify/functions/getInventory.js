// === KORRIGIERTER BACKEND-CODE MIT CORS-HEADER ===

exports.handler = async function(event, context) {
    const machineId = '90553182';
    const apiToken = process.env.VENDON_API_TOKEN;

    // KORREKTUR: CORS-Header, um Anfragen vom Browser zu erlauben
    const headers = {
        'Access-Control-Allow-Origin': '*', // Erlaubt Anfragen von jeder Domain
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(`https://cloud.vendon.net/rest/v1.7.0/stats/inventoryReport?machine_id=${machineId}`, {
            headers: {
                'Authorization': apiToken
            }
        });

        if (!response.ok) {
            return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Failed to fetch data from Vendon' }) };
        }

        const data = await response.json();
        const products = data.result.map(p => ({
            name: p.product_name,
            amount: p.amount,
            capacity: p.capacity 
        }));

        return {
            statusCode: 200,
            headers, // Wichtig: Die Header hier mitsenden
            body: JSON.stringify(products)
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
