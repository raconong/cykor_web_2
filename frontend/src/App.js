import React, { useState, useEffect } from 'react'; //리엑트 라이브러리
import { io } from 'socket.io-client'; //socket 서버 연결

const socket = io('http://localhost:3001');


//참고 https://velog.io/@cychann/React-Class-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-vs-Function-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8
function App(){
    const [message, setMessage] = useState(''); //메시지 
    const [chat, setChat] = useState([]); //기존 메시지 목록

    //로그인
    const [user, setuser] = useState(null); 
    const [loginform, setLoginForm] = useState({ username: '', password: '' });
    const [isRegister, setIsRegister] = useState(false); 
  



// https://xiubindev.tistory.com/100 
// 메시지 불러오기 
    useEffect(() => { //화면이 그려지면 한번 시행
        
        //과거 메시지 수신
        socket.on('chat history', (messages) => { setChat(messages);});
        socket.on('chat message',(msg) =>{setChat((prevChat) => [...prevChat, msg]);} );  
        //chat message 이벤트 발생시 수행
        //서버에서 전달된 msg를 setchat 호출
        //기존 메시지 배열 복사, 뒤에 msg 연결 

        return () => { socket.off('chat message');
                       socket.off('chat history');
        }; //중복 등록되지 않도록 제거 
    },[]);




//로그인 처리
  const handleAuth = async (e) => { //로그인/회원가입 처리 함수
    e.preventDefault();
    const url = `http://localhost:3001/api/auth/${isRegister ? 'register' : 'login'}`;//isRegister가 true인 경우 register 페이지로 이동 
    const res = await fetch(url, { //요청 전송 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, //json 형태 
      body: JSON.stringify(loginform) //loginform과 같은 형태를 json으로 변환하여 전송 
    });

    const data = await res.json(); //응답 처리 
    if (res.ok) { //응답 성공한 경우 
      setuser({ username: loginform.username }); // 로그인 성공 시 유저 설정
    } else {
      alert(data.message);
    }
  };


// 메시지 전송 처리
    const sendMessage = (event) =>{ //https://programming119.tistory.com/100
        event.preventDefault(); //submit 되고 창이 돌아오는것을 방지 
        if(message.trim()==='')return;//빈 메시지 방지
        socket.emit('chat message',{ nickname: user.username, message }); // 입력받은 메시지 비우기 
        setMessage(''); //메시지 비우기 
    };




    //페이지 
  if (!user) { //로그인 되어있는 경우 
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h2>{isRegister ? '회원가입' : '로그인'}</h2>
        <form onSubmit={handleAuth}>
          <input
            type="text"
            placeholder="아이디"
            value={loginform.username}
            onChange={(e) => setLoginForm({ ...loginform, username: e.target.value })} //loginform usersname과 password에 저장장
          /><br /><br />
          <input
            type="password"
            placeholder="비밀번호"
            value={loginform.password}
            onChange={(e) => setLoginForm({ ...loginform, password: e.target.value })}
          /><br /><br />
          <button type="submit">{isRegister ? '회원가입' : '로그인'}</button> {/*버튼을 통해 폼 전환이 되도록 한다*/}
          <p
            style={{ marginTop: '10px', cursor: 'pointer', color: 'blue' }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? '로그인 전환' : '회원가입 전환'}
          </p>
        </form>
      </div>
    );
  }

return(
        <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>실시간 채팅</h2>
            <button onClick={() => setuser(null)} style={{ padding: '6px 10px', fontSize: '12px' }}>
              로그아웃웃
            </button>

          </div>
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
         {/* 채팅 출력 폼, user추가 */}
        <ul style={{ marginTop: '20px' }}>
        {chat.map((msg, idx) => ( <li key={idx} style={{ marginBottom: '5px' }}> <strong>{msg.nickname}</strong>: {msg.message} </li> ))} {/*닉네임 추가 */}
        </ul> 
        </div>
    );
}

export default App;




