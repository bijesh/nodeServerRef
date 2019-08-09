process.on('message',(msg)=>{
console.log(`message from parent : ${msg} client running on process id: ${process.pid}`);
});

process.send({Hello :'client'});
