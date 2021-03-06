import * as functions from 'firebase-functions'
import { SessionsClient } from 'dialogflow'
import * as serviceAccount from '../../firebaseServiceAcct.json'
import request from 'request'
import cheerio from 'cheerio'
import { WebhookClient } from 'dialogflow-fulfillment'
import { changeBaseOfNumber } from './utils'

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
        const { queryResult } = request.body
        console.log(queryResult.parameters)

        const number = queryResult.parameters['number']
        const targetBase = queryResult.parameters['target-base']
        const currentBase = queryResult.parameters['current-base']

        console.log(number, currentBase, targetBase)

        const changedNumber = changeBaseOfNumber(number, currentBase, targetBase)
        if (isNaN(changedNumber)) {
            agent.add(`I'm afraid but it doesn't look like the conversion can be performed`)
            return
        }
        agent.add(`${number} on conversion from ${currentBase} to ${targetBase} gives ${changedNumber}`)
    }

    function redirectionUrl(agent) {
        const { queryResult } = request.body
        let query = queryResult.parameters['query']
        query = `${query}`.trim()
        if (query.startsWith('https://') || query.startsWith('http://') || query.startsWith('www.')) {
            agent.add('/redirect:' + `${query}`.split('')[0])
        } else {
            query = `${query}`.replace(' ', '+')
            agent.add('/redirect:' + `https://google.com/search?q=${query}`)
        }
    }

    function youtubeSearch(agent) {
        const { queryResult } = request.body
        let query = queryResult.parameters['query']
        query = `${query}`.trim().replace(' ', '+')
        agent.add('/redirect:' + `https://www.youtube.com/results?search_query=${query}`)
    }

    let intentMap = new Map()
    intentMap.set('Default Welcome Intent', welcome)
    intentMap.set('Default Fallback Intent', fallback)
    intentMap.set('Change Base Intent', changeBase)
    intentMap.set('Web Search', redirectionUrl)
    intentMap.set('Youtube search', youtubeSearch)
    agent.handleRequest(intentMap)
}))

export const scraper = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        functions.logger.info('Scraping stack overflow')
        request('https://stackoverflow.com/questions?tab=Newest', (error, response, html) => {
            let arr = []
            console.log(error, request)
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

