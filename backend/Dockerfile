FROM node:18
RUN apt-get update && apt-get install -y netcat-openbsd
WORKDIR /app

# 설치
COPY package*.json ./
RUN npm install

# 전체 코드 복사
COPY . .

# wait-for-it.sh 복사 및 실행 권한 부여
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 3001

# mongo:27017 이 열릴 때까지 기다렸다가 backend 실행
CMD ["/wait-for-it.sh", "mongo:27017", "--", "node", "index.js"]
