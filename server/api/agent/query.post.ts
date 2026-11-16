import {defineEventHandler} from 'h3';
import {handleAgent} from '../../lib/node-adapter';
export default defineEventHandler(event=>handleAgent(event,'query'));
