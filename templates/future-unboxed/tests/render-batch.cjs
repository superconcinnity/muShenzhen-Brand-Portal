const path=require('path'),{spawnSync}=require('child_process');
for(const id of ['nothing-studio','nothing-worn','rabbit-hand','teenage-ko2']){
 const result=spawnSync(process.execPath,[path.join(__dirname,'../render.cjs'),path.join(__dirname,id+'.json'),path.join(__dirname,id)],{stdio:'inherit',env:process.env});
 if(result.status!==0){process.exitCode=1;break;}
}
