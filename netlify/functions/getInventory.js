// === FINALE, ROBUSTE VERSION DES BACKEND-CODES ===

exports.handler = async function(event, context) {
    const machineId = '90553182';
    const apiToken = process.env.VENDON_API_TOKEN;

    const headers = {
        'Access-Control-Allow-Origin': '*',
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
        
        // KORREKTUR: Filtere die Rohdaten und verarbeite nur Einträge,
        // die eine gültige Kapazität haben (echte Produktschächte).
        const products = data.result
            .filter(p => typeof p.max_amount === 'number' && p.max_amount > 0)
            .map(p => ({
                name: p.product_name,
                amount: p.amount,
                capacity: p.max_amount 
            }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(products)
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
