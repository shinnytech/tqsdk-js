// import "regenerator-runtime/runtime";
import { version } from './package.json'
import TQSDK from './src/index'
import { TqWebsocket } from './src/tqwebsocket'
import DataManager from './src/datamanage'
TQSDK.TqWebsocket = TqWebsocket
TQSDK.DataManager = DataManager
TQSDK.version = version
export default TQSDK
