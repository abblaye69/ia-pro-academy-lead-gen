const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 1. Autoriser uniquement les requêtes POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, name, consent } = JSON.parse(event.body);

    // 2. Validation basique
    if (!email || !name || !consent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Champs manquants" })
      };
    }

    // 3. Préparation du payload pour l'API de formulaire HubSpot
    // HubSpot Portal ID: 48538399
    // Nous allons utiliser l'API de formulaire qui ne nécessite pas d'auth
    const PORTAL_ID = '48538399';
    
    // Séparer le nom en prénom et nom
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Appel direct à HubSpot pour créer un contact
    const hubspotEndpoint = `https://api.hubapi.com/crm/v3/objects/contacts`;
    
    const hubspotData = {
      properties: {
        email: email,
        firstname: firstName,
        lastname: lastName,
        lifecyclestage: "lead",
        ia_academy_consent: "true",
        ia_academy_source: "landing_page_v2"
      }
    };

    // Vérifier si la variable d'environnement existe
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
      console.error('HUBSPOT_ACCESS_TOKEN non définie');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Configuration serveur invalide" })
      };
    }

    console.log('Tentative de création de contact pour:', email);

    const response = await fetch(hubspotEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(hubspotData)
    });

    const responseData = await response.json();
    
    if (response.ok) {
      console.log('Contact créé avec succès:', responseData.id);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Lead enregistré avec succès" })
      };
    }

    // Gérer le cas du doublon (409)
    if (response.status === 409) {
      console.log('Contact existe déjà:', email);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Contact déjà enregistré" })
      };
    }

    // Autres erreurs
    console.error('Erreur HubSpot:', response.status, responseData);
    throw new Error(`Erreur HubSpot: ${JSON.stringify(responseData)}`);

  } catch (error) {
    console.error("Erreur serveur:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur interne du serveur" })
    };
  }
};
