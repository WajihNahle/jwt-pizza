# Check if host is provided as a command line argument
if [ -z "$1" ]; then
  echo "Usage: $0 <host>"
  echo "Example: $0 https://pizza-service.ethanwag.click"
  exit 1
fi
host=$1

response=$(curl -s -X PUT $host/api/auth -d '{"email":"arakni@jwt.com", "password":"10Nazgul9!"}' -H 'Content-Type: application/json')
token=$(echo $response | jq -r '.token')

# Add users
curl -X POST $host/api/auth -d '{"name":"BadUSer", "email":"bad@jwt.com", "password":"badDiner"}' -H 'Content-Type: application/json'
curl -X POST $host/api/auth -d '{"name":"BadFranchisee", "email":"fbad@jwt.com", "password":"badFranchisee"}' -H 'Content-Type: application/json'

# Add menu
curl -X PUT $host/api/order/menu -H 'Content-Type: application/json' -d '{ "title":"FireBlast!!!!", "description": "Burnt to a crisp", "image":"pizza6.png", "price": 38 }'  -H "Authorization: Bearer $token"
curl -X PUT $host/api/order/menu -H 'Content-Type: application/json' -d '{ "title":"mamaRicci", "description": "Spicy treat 2.0", "image":"mamaRicci.png", "price": 42 }'  -H "Authorization: Bearer $token"
curl -X PUT $host/api/order/menu -H 'Content-Type: application/json' -d '{ "title":"3PiDelight", "description": "3", "image":"pizza7.png", "price": 42 }'  -H "Authorization: Bearer $token"
curl -X PUT $host/api/order/menu -H 'Content-Type: application/json' -d '{ "title":"LongOne", "description": "A long Square. L7 as it were", "image":"pizza8.png", "price": 28 }'  -H "Authorization: Bearer $token"

# Add franchise and store
curl -X POST $host/api/franchise -H 'Content-Type: application/json' -d '{"name": "Hell.inc", "admins": [{"email": "f@jwt.com"}]}'  -H "Authorization: Bearer $token"
curl -X POST $host/api/franchise/1/store -H 'Content-Type: application/json' -d '{"franchiseId": 666, "name":"HELL"}'  -H "Authorization: Bearer $token"

echo "Payload Delivered"