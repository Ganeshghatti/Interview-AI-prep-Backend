import { RealtimeRelay } from './lib/relay.js';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const OPENAI_API_KEY = "eyJraWQiOiJzLTAwZWYwYTdlLWEwNWYtNDUzNy1hNjIwLTNkZmFmOTU0OGEzZSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJpYXQiOjE3NTQ3MTY2MTksImV4cCI6NDkwODcxNjYxOSwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNva2V0LmFpIiwidXNlcl9pZCI6IjkxNDQ4NGUzLWM4MzUtNDRiOC1hODlkLWM5ZTI3YzAyYjEwZCIsInRva2VuX3JhdGVfbGltaXQiOjEwMDAwLCJyZXF1ZXN0X3JhdGVfbGltaXQiOjEwMH0.QvqXhW8HrXVZFCb7dZ0UzInsFlJUQZTcco5NTroJ_h7sSV1ZyP4glrKm-GkIMpE3L0W5FBQkPIpYIiQSYcjN8gMRcT-UnRq-NG1lRJIz6IRdEvst99nu99xZ2SQtRpjyMRyW4wcnicV7aP-7FV7RRdUWNtLYJ_IFyQoeIF4KvXhcD4ekjmPL9H1f9Wbpx7q9jHnomsumb_2E-YIzJhkm-LkK-E9dSCk9Cxk92_j4Ul7X6ISPdu4p3_ksrrcC2_j-zIIg9vzyomFsWzuJFtwAhGwp2dPtxAjca5pALDaMivdc3nOs7npfbxw0whv6NuZJRxlxcsj8BXVgmLKIl9dTkw";

if (!OPENAI_API_KEY) {
  console.error(
    `Environment variable "OPENAI_API_KEY" is required.\n` +
      `Please set it in your .env file.`
  );
  process.exit(1);
}

const PORT = parseInt(process.env.PORT) || 8081;

const relay = new RealtimeRelay(OPENAI_API_KEY);
relay.listen(PORT);
