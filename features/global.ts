import assert from 'assert';
import { Given, When, Then } from '@cucumber/cucumber';
import axios from 'axios';

let baseUrl: string;
let axiosResponse: any;

type PayloadType = {
  method: string;
  url: string;
  data?: any;
}

const specialValues:any = {
  clientId:1,
  productId:2,
}
async function request(method:string, endpoint:string, body:any) {
  try{
    const payload:PayloadType = {
      method,
      url: `${baseUrl}${endpoint}`
    }
    if (method === 'POST' || method === 'PUT') {
      payload.data = body; 
    }

    const response = await axios(payload);

    axiosResponse = response;
    return response;
  }catch(err:any){
    axiosResponse = err.response;
    return err.response;
  }
  
}

Given('a base URL of {string}', (url: string) => {
  baseUrl = url;
});

When('a GET request is sent to {string}', async (endpoint: string) => {
  endpoint = replaceHandlebarWithValue(endpoint);
  await request('GET', endpoint, {});
});

When('a POST request is sent to {string} and the request body contains:', async (endpoint: string, docString: string) => {
  endpoint = replaceHandlebarWithValue(endpoint);
  const parsedBody = JSON.parse(docString);
  await request('POST', endpoint, parsedBody);
});

When('a PUT request is sent to {string} and the request body contains:', async (endpoint: string, body: string) => {
  endpoint = replaceHandlebarWithValue(endpoint);
  const parsedBody = JSON.parse(body);
  await request('PUT', endpoint, parsedBody);
});

When('a DELETE request is sent to {string}', async (endpoint: string) => {
  endpoint = replaceHandlebarWithValue(endpoint);
  await request('DELETE', endpoint, {});
});

Then('the response status should be {int}', (expectedStatus: number) => {
  assert.strictEqual(axiosResponse.status, expectedStatus);
});

Then('the response should contain {string}', (expectedBody: string) => {
  assert.strictEqual(axiosResponse.data.includes(expectedBody), true);
});

Then('clientID will be saved as "clientId"', () => {
  specialValues.clientId = axiosResponse.data[0];
})

Then('orderId Will be saved', () => {
  specialValues.orderId = axiosResponse.data.data.orderId;
});

function replaceHandlebarWithValue(path:string){

  const keys = Object.keys(specialValues);
  keys.forEach((key:string)=>{
    path = path.replace(`{{${key}}}`,specialValues[key]);
  })
  return path;
}