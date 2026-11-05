import {render} from './engine.mjs';
self.onmessage=({data:m})=>{try{const result=render(new Uint8ClampedArray(m.pixels),m.w,m.h,m.settings);self.postMessage({id:m.id,...result},[result.pixels.buffer]);}catch(e){self.postMessage({id:m.id,error:e.message});}};
