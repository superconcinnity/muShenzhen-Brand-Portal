const fs=require('fs'),path=require('path');
(async()=>{
 const sources=JSON.parse(fs.readFileSync(path.join(__dirname,'surround-batch-sources.json'),'utf8'));
 for(const source of sources){
  const config=JSON.parse(fs.readFileSync(path.join(__dirname,source.id+'.json'),'utf8'));
  const destination=path.resolve(__dirname,'..',config.image.src);
  if(!destination.startsWith(path.join(__dirname,'assets')+path.sep))throw Error('Unexpected asset destination');
  const response=await fetch(source.imageUrl,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error(`${source.id}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  const meta=await require('sharp')(bytes).metadata();
  if(!meta.width||!meta.height)throw Error('Invalid image '+source.id);
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
  console.log(`${source.id}: ${meta.width} × ${meta.height}`);
 }
})().catch(error=>{console.error(error);process.exitCode=1});
