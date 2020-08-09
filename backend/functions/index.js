const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

// The Firebase Admin SDK to access Cloud Firestore.
const cors = require('cors')({ origin: true })
const admin = require('firebase-admin');
const { response } = require('express');
admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

exports.chatBot = functions.https.onRequest((request, response) => {
    functions.logger.info("Chat bot", { structuredData: true });
    response.send("Hello this is your chatbot")
})

exports.dialogFlowGateway = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const { queryInput, sessionId } = request.body
        const sessionClient = new SessionsClient({ credentials: serviceAccount })
        const session = sessionClient.sessionPath('me-chat', sessionId)

        const responses = await sessionClient.detectIntent({ session, queryInput })

        const result = responses[0].queryResult

        response.send(result)
    })
})
