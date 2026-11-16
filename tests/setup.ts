import {afterEach} from 'vitest';
afterEach(()=>{document.documentElement.className='';history.replaceState(null,'','/');localStorage.clear();});
