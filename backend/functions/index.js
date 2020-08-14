const functions = require('firebase-functions');

const cors = require('cors')({ origin: true })

import { dialogFlowGateway, chatBot, helloWorld, scraper } from '../bot/routes'
import { firebaseInit } from '../firebase/config';

firebaseInit()

exports.helloWorld = helloWorld
exports.chatBot = chatBot
exports.dialogFlowGateway = dialogFlowGateway
exports.scraper = scraper