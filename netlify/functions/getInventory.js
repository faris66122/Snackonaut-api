// === FINALE, STABILE VERSION DES BACKEND-CODES ===

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
            headers: { 'Authorization': apiToken }
        });

        if (!response.ok) {
            return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Failed to fetch data from Vendon' }) };
        }

        const data = await response.json();
        
        // KORREKTUR: Wir nehmen alle Produkte, die einen Namen haben, und senden nur Name und Menge.
        const products = data.result
            .filter(p => p.product_name)
            .map(p => ({
                name: p.product_name,
                amount: p.amount
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
