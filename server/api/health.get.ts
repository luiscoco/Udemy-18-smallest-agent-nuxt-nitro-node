import {defineEventHandler,setResponseStatus} from 'h3';
import {readConfig} from '../lib/config';
export default defineEventHandler(event=>{try{return {status:'ok',api_key_configured:readConfig().apiKeyConfigured};}catch{setResponseStatus(event,500);return {detail:'Server configuration could not be loaded.'};}});
