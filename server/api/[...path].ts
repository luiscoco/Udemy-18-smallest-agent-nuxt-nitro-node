import {defineEventHandler,createError} from 'h3';
export default defineEventHandler(()=>{throw createError({statusCode:404,statusMessage:'API route not found'});});
