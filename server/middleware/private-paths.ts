import {defineEventHandler,getRequestURL,createError} from 'h3';
export default defineEventHandler(event=>{let path;try{path=decodeURIComponent(getRequestURL(event).pathname);}catch{throw createError({statusCode:400,statusMessage:'Invalid URL'});}if(path.split('/').some(part=>part.startsWith('.')))throw createError({statusCode:404,statusMessage:'Not found'});});
