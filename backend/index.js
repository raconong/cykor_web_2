//backend index.js 코드 작성

//https://soonysoon.tistory.com/79 참고함
// https://jackcokebb.tistory.com/11 

const express = require('express'); //express 프레임 워크 설정
const http = require('http'); //node js http
const { Server } = require('socket.io');
const cors = require('cors'); // cors 상수 저장
const mongoose=require('mongoose');
const path = require('path');
const chat = require('./chatsetting');
const authRoutes = require('./auth');

//mongodb 연결
// https://koreankoder.tistory.com/15
mongoose.connect('mongodb://localhost:27017/chatdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>console.log("connected"))
  .catch(err=>console.error("error : ",err));



const app = express(); // 서버에 필요한 기능인 미들웨어를 어플리케이션에 추가 
const server= http.createServer(app);
const socketio = require('socket.io'); //https://smaivnn.tistory.com/2
const { timestamp } = require('console');
const io = new socketio.Server(server, {
    cors: { origin: "*",methods: ['GET', 'POST'] } //모든 출처 허용, get,post 메서드 허용
});

app.use(cors()); //해당 cors 미들웨어 적용 
app.use(express.json());//req.body에서 json형태의 데이터 읽기
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //정적 파일 획득
app.use('/api/auth', authRoutes); //https://velog.io/@rhftnqls/auth-%EB%AF%B8%EB%93%A4%EC%9B%A8%EC%96%B4-%EB%A7%8C%EB%93%A4%EA%B8%B0
//auto routes 만들기




io.on('connection', async(socket) => { //클라이언트가 socket.io로 연결한 경우
    console.log('사용자 연결됨:', socket.id); //연결된 경우 log 



    //room 기능 추가
    socket.on('join room',async(roomid)=>{ socket.join(roomid); console.log(`${socket.id}가 방 ${roomid}에 입장`);


//해당 room의 데이터 수신
    const roomhistory = await chat.find({ roomid }).sort({ timestamp: 1 }).limit(50);
    socket.emit('chat history', roomhistory);
})


    // 채팅 메시지 수신 -> 받은 메시지만만
    socket.on('chat message', async ({ nickname, message, roomid }) => { //클라이언트가 메시지를 보내는 경우 + nickname도 추가 
        console.log('받은 메시지:', { nickname, message,roomid}); // 서버에 받은 메시지  저장
        const saved= await chat.create({ nickname, message, roomid});
        io.to(roomid).emit('chat message', { nickname: saved.nickname, message: saved.message, timestamp: saved.timestamp,roomid: saved.roomid });
        //해당 방에 포함된 사용자에게만 전송
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



