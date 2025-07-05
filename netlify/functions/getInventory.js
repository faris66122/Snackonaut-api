// Netlify Function in CommonJS
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  try {
    const token = process.env.VENDON_API_TOKEN;
    const machineId = "90553182";

    if (!token) {
      console.error("VENDON_API_TOKEN fehlt!");
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "API-Token fehlt!" })
      };
    }

    // 1) Hole alle Produkte
    console.log("Hole Produkte von Vendon API ...");
    const prodRes = await fetch(
      `https://cloud.vendon.net/rest/v1.7.0/products?machine_id=${machineId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!prodRes.ok) {
      console.error("Products API Fehler:", prodRes.status);
      throw new Error("Products API " + prodRes.status);
    }
    const { result: products } = await prodRes.json();

    // 2) Hole die Bestandszahlen
    console.log("Hole Bestandszahlen von Vendon API ...");
    const invRes = await fetch(
      `https://cloud.vendon.net/rest/v1.7.0/stats/inventoryReport?machine_id=${machineId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!invRes.ok) {
      console.error("Inventory API Fehler:", invRes.status);
      throw new Error("Inventory API " + invRes.status);
    }
    const { result: inventory } = await invRes.json();

    // 3) Baue ein schnelles Nachschlage-Objekt: Produkt-ID → Menge
    const invMap = Object.fromEntries(
      inventory.map(item => [item.product_id, item.amount])
    );

    // 4) Formatiere die Antwort so, wie dein Webflow-Code sie erwartet:
    const output = products.map(p => ({
      name: p.name,
      amount: invMap[p.id] || 0,
      capacity: p.machine_defaults.amount_max || 0
    }));

    console.log("Output:", output);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(output)
    };
  } catch (err) {
    console.error("Function-Fehler:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
