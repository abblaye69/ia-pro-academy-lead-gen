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

    // 3. Préparation du payload HubSpot
    // Séparation Prénom/Nom
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

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

    // 4. Appel API HubSpot pour créer/mettre à jour le contact
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(hubspotData)
    });

    const responseData = await response.json();
    let contactId;

    // Gestion du doublon (Contact déjà existant) - Code 409
    if (response.status === 409) {
      console.log("Contact existant :", email);
      // Extraire l'ID du contact depuis le message d'erreur
      contactId = responseData.message.match(/ID: (\d+)/)?.[1];
      if (!contactId) {
        // Chercher le contact par email pour récupérer son ID
        const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filterGroups: [{
              filters: [{
                propertyName: "email",
                operator: "EQ",
                value: email
              }]
            }]
          })
        });
        const searchData = await searchResponse.json();
        contactId = searchData.results[0]?.id;
      }
    } else if (!response.ok) {
      throw new Error(`Erreur HubSpot: ${JSON.stringify(responseData)}`);
    } else {
      contactId = responseData.id;
    }

    // 5. Ajouter le contact à la liste HubSpot (ID: 9)
    if (contactId) {
      const LIST_ID = '9';
      const addToListResponse = await fetch(`https://api.hubapi.com/contacts/v1/lists/${LIST_ID}/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vids: [parseInt(contactId)]
        })
      });

      if (!parseInt.ok) {
        console.error("Erreur lors de l'ajout à la liste:", await addToListResponse.text());
        // On continue quand même, le contact est créé
      } else {
        console.log(`Contact ${contactId} ajouté à la liste ${LIST_ID}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Lead enregistré avec succès" })
    };

  } catch (error) {
    console.error("Erreur serveur:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur interne du serveur" })
    };
  }
};
