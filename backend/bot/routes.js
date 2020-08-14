import * as functions from 'firebase-functions'
import { SessionsClient } from 'dialogflow'
import * as serviceAccount from '../../firebaseServiceAcct.json'
import request from 'request'
import cheerio from 'cheerio'
import { WebhookClient } from 'dialogflow-fulfillment'

const cors = require('cors')({ origin: true })

export const dialogFlowGateway = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        try {
            const { text } = request.query
            const queryInput = {
                text: {
                    text,
                    languageCode: 'en-us'
                }
            }
            const sessionId = 'foo'
            console.log(queryInput, sessionId)
            const sessionClient = new SessionsClient({ credentials: serviceAccount })
            const session = sessionClient.sessionPath('chatbot-8510b', sessionId)
            try {
                const responses = await sessionClient.detectIntent({ session, queryInput })
                const result = responses[0].queryResult
                response.send(result)
            } catch (e) {
                console.log(e)
                response.json({ msg: e.message })
            }
        } catch (e) {
            console.log(e)
            response.status(200).json({ fulfillmentMessages: [{ text: { text: ['Sorry, what is it again?'] } }] })
        }
    })
})

export const dialogflowWebhook = functions.https.onRequest((async (request, response) => {
    const agent = new WebhookClient({ request, response })

    console.log(JSON.stringify(request.body))

    function welcome(agent) {
        agent.add(`Hey there! How may I help you?`)
    }

    function fallback(agent) {
        agent.add(`Sorry, can you try that again?`)
    }

    function changeBase(agent) {
        console.log(agent)
        agent.add(`Base has been changed`)
    }

    let intentMap = new Map()
    intentMap.set('Default Welcome Intent', welcome)
    intentMap.set('Default Fallback Intent', fallback)
    intentMap.set('Change Base Intent', changeBase)
}))

export const scraper = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        functions.logger.info('Scraping stack overflow')
        request('https://stackoverflow.com/questions?tab=Newest', (error, response, html) => {
            let arr = []
            if (!error && response.statusCode === 200) {
                const $ = cheerio.load(html);
                const questions = $('.summary')
                questions.each((i, el) => {
                    const question = $(el).children('h3').children('a')
                    const href = `https://stackoverflow.com${question.attr('href')}`
                    arr.push({ question: question.text(), href: href })
                })
            }
            res.json(arr)
        })
    })
})

export const chatBot = functions.https.onRequest((request, response) => {
    functions.logger.info("Chat bot", { structuredData: true });
    response.send("Hello this is your chatbot")
})

export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

