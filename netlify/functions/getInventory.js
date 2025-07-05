// netlify/functions/getInventory.js
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const token     = process.env.VENDON_API_TOKEN;
  const machineId = "90553182";

  if (!token) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "VENDON_API_TOKEN fehlt!" })
    };
  }

  try {
    // 1) Produkt-Metadaten + capacity
    const stockRes = await fetch(
      `https://cloud.vendon.net/rest/v1.7.0/stock?machine_id=${machineId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!stockRes.ok) throw new Error(`Stock API ${stockRes.status}`);
    const { result: meta } = await stockRes.json();

    // 2) Aktuelle Bestandszahlen
    const invRes = await fetch(
      `https://cloud.vendon.net/rest/v1.7.0/stats/inventoryReport?machine_id=${machineId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!invRes.ok) throw new Error(`Inventory API ${invRes.status}`);
    const { result: inv } = await invRes.json();

    // 3) Schneller Lookup: product_id → amount
    const invMap = Object.fromEntries(inv.map(x => [ x.product_id, x.amount ]));

    // 4) Finales Output-Array
    const output = meta.map(p => ({
      name:     p.name,
      amount:   invMap[p.id] ?? 0,
      capacity: p.machine_defaults?.amount_max ?? 0
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type":                "application/json"
      },
      body: JSON.stringify(output)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
