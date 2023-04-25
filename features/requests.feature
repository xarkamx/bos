Feature: API endpoints

Background:
Given a base URL of "http://localhost:8000"

Scenario: Health check
When a GET request is sent to "/health/check"
Then the response status should be 200

Scenario: Get root path
When a GET request is sent to "/"
Then the response status should be 200

Scenario: Create client
When a POST request is sent to "/clients/" and the request body contains:
"""
{
"name": "John",
"phones": ["1234567890"],
"legal": false
}
"""
Then the response status should be 200
And clientID will be saved as "clientId"

Scenario: Get list of clients
When a GET request is sent to "/clients/"
Then the response status should be 200

Scenario: Get client by ID
When a GET request is sent to "/clients/{{clientId}}"
Then the response status should be 200

Scenario: Update client by ID
When a PUT request is sent to "/clients/{{clientId}}" and the request body contains:
"""
{
"name": "John Doe",
"phones": ["1234567890", "0987654321"],
"legal": true
}
"""
Then the response status should be 200


Scenario: Create inventory item
When a POST request is sent to "/products/{{productId}}/inventory" and the request body contains:
"""
{
"quantity": 10
}
"""
Then the response status should be 200

Scenario: Get list of inventory items
When a GET request is sent to "/products/inventory"
Then the response status should be 200

Scenario: Get info path
When a GET request is sent to "/info/"
Then the response status should be 200

Scenario: Get payments path
When a GET request is sent to "/payments/"
Then the response status should be 200

Scenario: Create payment
When a POST request is sent to "/payments/" and the request body contains:
"""
{
	"amount":500,
	"paymentType":"sale",
	"flow":"outflow",
	"description":"pago del 2%",
	"paymentMethod":1
}
"""
Then the response status should be 200


Scenario: Create order
When a POST request is sent to "/orders/" and the request body contains:
"""
{"clientId":1,"discount":0,"partialPayment":"5","paymentType":"1","items":[{"productId":2,"quantity":100}]}
"""
Then the response status should be 200
And orderId Will be saved

Scenario: Delete unexisting order
When a DELETE request is sent to "/orders/99999999999"
Then the response status should be 404


Scenario: Delete order
When a DELETE request is sent to "/orders/{{orderId}}"
Then the response status should be 200

Scenario: Delete product
When a DELETE request is sent to "/products/1"
Then the response status should be 200
