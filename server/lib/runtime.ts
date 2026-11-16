import {readConfig} from './config';
import {createAgentService} from './agent-service';
import {createHandlers} from './handlers';
export function getHandlers(){const config=readConfig();return createHandlers(config,createAgentService(config));}
