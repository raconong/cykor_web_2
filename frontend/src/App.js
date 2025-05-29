import React, { useState, useEffect } from 'react'; //리엑트 라이브러리
import { io } from 'socket.io-client'; //socket 서버 연결

const socket = io('http://localhost:3001');


//참고 https://velog.io/@cychann/React-Class-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-vs-Function-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8
function App(){
    const [message, setMessage] = useState(''); //메시지 
    const [chat, setChat] = useState([]); //기존 메시지 목록



// https://xiubindev.tistory.com/100 
// 메시지 불러오기 
    useEffect(() => { //화면이 그려지면 한번 시행
        
        //과거 메시지 수신
        socket.on('chat history', (messages) => { setChat(messages.map((m) => m.message)); });
        socket.on('chat message',(msg) =>{setChat((prevChat) => [...prevChat, msg]);} );  
        //chat message 이벤트 발생시 수행
        //서버에서 전달된 msg를 setchat 호출
        //기존 메시지 배열 복사, 뒤에 msg 연결 

        return () => { socket.off('chat message');
                       socket.off('chat history');
        }; //중복 등록되지 않도록 제거 
    },[]);


// 메시지 전송 처리
    const sendMessage = (event) =>{ //https://programming119.tistory.com/100
        event.preventDefault(); //submit 되고 창이 돌아오는것을 방지 
        if(message.trim()==='')return;//빈 메시지 방지
        socket.emit('chat message',message); // 입력받은 메시지 비우기 
        setMessage(''); //메시지 비우기 
    };

    return(
        <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
         <h2> 실시간 채팅 </h2>
         <form onSubmit={sendMessage}>
            <input 
             type="text" 
             value={message}
             onChange={(event)=>setMessage(event.target.value)}
             placeholder="메시지 입력"
             style={{ width: '70%', padding: '8px'}}
            />
            <button type="submit" style={{ padding: '8px 12px', marginLeft: '10px' }}>
                메시지 전송
            </button>
        </form>


         {/* 채팅 출력 폼폼 */}
        <ul style={{ marginTop: '20px' }}>
        {chat.map((msg, idx) => ( <li key={idx} style={{ marginBottom: '5px' }}>{msg}</li>))}
        </ul> 




        </div>
    );




}

export default App;




