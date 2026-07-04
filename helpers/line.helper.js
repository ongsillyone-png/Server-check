const https = require('https');

/**
 * Send notification text to LINE via MOPH Notify API
 * @param {string} text - The message body to send
 * @param {string} clientKey - client-key header
 * @param {string} secretKey - secret-key header
 * @returns {Promise<Object>} response status and message
 */
const sendMophNotifyText = (text, clientKey, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!clientKey || !secretKey) {
      return reject(new Error('MOPH Notify client-key and secret-key are required.'));
    }

    const payload = JSON.stringify({
      messages: [
        {
          type: "text",
          text: text
        }
      ]
    });

    const options = {
      hostname: 'morpromt2f.moph.go.th',
      port: 443,
      path: '/api/notify/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-key': clientKey,
        'secret-key': secretKey,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve({ success: true, statusCode: res.statusCode, response: parsed });
          } catch (e) {
            resolve({ success: true, statusCode: res.statusCode, response: data });
          }
        } else {
          reject(new Error(`MOPH API Error (Status: ${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

module.exports = {
  sendMophNotifyText
};
