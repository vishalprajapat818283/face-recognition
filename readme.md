## for running project run this command from face_recognition_project
./start_test.sh

## //for manual open
run this from frontend-->terminal 1---->npm run dev -- --host 0.0.0.0

run this from face_recognition_project-->terimnal 2 ----->source venv/bin/activate (this will run backend innside a vertual environment)

run this from backend-->terminal 2 ----->uvicorn main:app --host 0.0.0.0 --port 8000

run this from face_recognition_project-->terminal 3------>cloudflared tunnel --url http://localhost:5173

run this from face_recognition_project-->terminal 4------->cloudflared tunnel --url http://localhost:8000

run this if web url or api is not working -->terminal 5------>sudo ufw allow 5173/tcp

run this if web url or api is not working -->terminal 5------>sudo ufw allow 8000/tcp

//frontend/vite.config.js should be---><br>
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true //can be removed for security
  }
})


## //to run  only on local host

run this from face_recognition_project-->terimnal 1------->source venv/bin/activate

runn this from backend-->terminal 1---->uvicorn main:app --reload

run this from frontend -->terminal 2-------->npn run dev

update this line from frontend/src/api to

const API_BASE_URL ="http://localhost:8000";

//frontend/vite.config.js should be---><br>
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()]
})

## after closing all terminal by ctr+c run this on any terminal except venv
sudo ufw delete allow 5173/tcp<br>
sudo ufw delete allow 8000/tcp





