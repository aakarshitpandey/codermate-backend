import * as functions from 'firebase-functions'
import { SessionsClient } from 'dialogflow'
import * as serviceAccount from '../../firebaseServiceAcct.json'
import request from 'request'
import cheerio from 'cheerio'

const cors = require('cors')({ origin: true })

export const dialogFlowGateway = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const { queryInput, sessionId } = request.body
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
    })
})

export const scraper = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        functions.logger.info('Scraping stack overflow')
        request('https://stackoverflow.com/questions?tab=Newest', (error, response, html) => {
            let arr = []
            if (!error && response.statusCode == 200) {
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

