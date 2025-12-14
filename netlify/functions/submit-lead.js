const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 1. Allow only POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, name, consent } = JSON.parse(event.body);

    // 2. Basic validation
    if (!email || !name || !consent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    // 3. Prepare the data for HubSpot Forms API
    const PORTAL_ID = '48538399';
    const FORM_ID = '9e0324e0-a174-42d2-a845-4cf30b3e7460';

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // 4. Submit to HubSpot Forms API (no authentication required)
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: [
            {
              objectTypeId: "0-1",
              name: "email",
              value: email
            },
            {
              objectTypeId: "0-1",
              name: "firstname",
              value: firstName
            },
            {
              objectTypeId: "0-1",
              name: "lastname",
              value: lastName
            },
            {
              objectTypeId: "0-1",
              name: "consent",
              value: consent ? "true" : "false"
            }
          ]
        })
      }
    );

    const responseData = await hubspotResponse.json();

    if (!hubspotResponse.ok) {
      console.error('HubSpot API error:', responseData);
      return {
        statusCode: hubspotResponse.status,
        body: JSON.stringify({
          error: "HubSpot API error",
          details: responseData
        })
      };
    }

    console.log('Contact created successfully:', responseData);

    // 5. Trigger Make webhook to send welcome email with Kit IA Pro
    try {
      await fetch('https://hook.eu2.make.com/krsr95dfsjic1fr9g8ddc34qj3drzwwiqpyg79rcmjvvgdt8cqibgr3bjyxuxbj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: firstName + ' ' + lastName,
          firstName: firstName,
          lastName: lastName,
          date: new Date().toISOString()
        })
      });
      console.log('Make webhook triggered successfully for:', email);
    } catch (webhookError) {
      console.error('Failed to trigger Make webhook:', webhookError);
      // Don't fail the main request if webhook fails
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Lead submitted successfully",
        data: responseData
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message
      })
    };
  }
};
