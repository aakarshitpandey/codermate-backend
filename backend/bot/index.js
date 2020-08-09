import functions from 'firebase-functions'
import { SessionsClient } from 'dialogflow'
import * as serviceAccount from '../../firebaseServiceAcct.json'

const cors = require('cors')({ origin: true })

export const dialogFlowGateway = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const { queryInput, sessionId } = request.body
        const sessionClient = new SessionsClient({ credentials: serviceAccount })
        const session = sessionClient.sessionPath('me-chat', sessionId)

        const responses = await sessionClient.detectIntent({ session, queryInput })

        const result = responses[0].queryResult

        response.send(result)
    })
})