//backend index.js 코드 작성

//https://soonysoon.tistory.com/79 참고함
// https://jackcokebb.tistory.com/11 

const express = require('express'); //express 프레임 워크 설정
const http = require('http'); //node js http
const { Server } = require('socket.io');
const cors = require('cors'); // cors 상수 저장

const app = express(); // 서버에 필요한 기능인 미들웨어를 어플리케이션에 추가 
const server= http.createServer(app);
const socketio = require('socket.io'); //https://smaivnn.tistory.com/2
const io = new socketio.Server(server, {
    cors: { origin: "*",methods: ['GET', 'POST'] } //모든 출처 허용, get,post 메서드 허용
});

app.use(cors()); //해당 cors 미들웨어 적용 


io.on('connection', (socket) => { //클라이언트가 socket.io로 연결한 경우
    console.log('사용자 연결됨:', socket.id); //연결된 경우 log 

    // 채팅 메시지 수신
    socket.on('chat message', (msg) => { //클라이언트가 메시지를 보내는 경우 
        console.log('받은 메시지:', msg); // 서버에 받은 메시지  저장
        io.emit('chat message', msg); // 전체 클라이언트에게 메시지 전송 -> 모든 연결된 사용자 
    });

    socket.on('disconnect', () => { //연결 종료 
        console.log('사용자 연결 종료:', socket.id);
    });
});



//서버 설정 -> node.js 서버를 3001에서 실행
const PORT = 3001;
server.listen(PORT, () => {
    console.log("서버가 http://localhost:" + PORT + " 에서 실행중");
});
























