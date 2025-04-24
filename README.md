# storage-api
Storage API for a school project, as there is none that match my requirements  
This wont be the most *secure* project, but I just need something that works  
## How worky?
You can upload stuff with api key and stuff idk
## Example usage
```bash
you@rightnow:~$ curl -X POST -F "file=@example.txt" -H "X-API-Key: balls" localhost:3000/v1/upload
{"res":"https://localhost:3000/files/f537947e-4328-4196-8f2a-c61d53482428.txt"}
```