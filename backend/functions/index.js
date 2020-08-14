const functions = require('firebase-functions');

const cors = require('cors')({ origin: true })

import { dialogFlowGateway, scraper, dialogflowWebhook } from '../bot/routes'
import { firebaseInit } from '../firebase/config';

firebaseInit()

exports.dialogFlowGateway = dialogFlowGateway
exports.scraper = scraper
exports.dialogflowWebhook = dialogflowWebhook