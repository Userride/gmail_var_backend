Server (Express + MongoDB)
--------------------------
1. cd server
2. npm install
3. copy .env.example to .env and edit values (or set env vars directly)
   - If you don't have SMTP set up for dev, the register endpoint will return a 'verifyLink' in the JSON response you can use to verify.
4. npm run dev
