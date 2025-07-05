// === DETEKTIV-CODE: Sendet die ungefilterten Rohdaten an das Frontend ===

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
        
        // WICHTIG: Wir senden jetzt die kompletten, rohen "result"-Daten zurück, ohne Filterung.
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data.result) // Sende das rohe Ergebnis
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
