exports.handler = async function(event, context) {
    const machineId = '90553182';
    const apiToken = process.env.VENDON_API_TOKEN; 

    try {
        const response = await fetch(`https://cloud.vendon.net/rest/v1.7.0/stats/inventoryReport?machine_id=${machineId}`, {
            headers: { 'Authorization': apiToken }
        });

        if (!response.ok) {
            return { statusCode: response.status, body: JSON.stringify({ error: 'Failed to fetch data from Vendon' }) };
        }

        const data = await response.json();
        const products = data.result.map(p => ({
            name: p.product_name,
            amount: p.amount,
            capacity: p.capacity 
        }));

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(products)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
