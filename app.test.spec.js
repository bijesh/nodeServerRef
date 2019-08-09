const expect = require('chai').expect;
const request = require('request');
//const chaiHttp = require('chai-http');
//chai.use(chaiHttp);

describe('app service test',()=>{

    describe('status code test',()=>{
      
        it('request return status code 200',()=>{
            request('http://localhost:3000/',(error,response,body)=>{
                expect(response.statusCode).to.equal(200);
                
            });            
        });

    });
});
