import React, { useState, useEffect,useRef } from 'react'; //리엑트 라이브러리
//https://hihiha2.tistory.com/19
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
    const [roomid, setRoomid] = useState('room1');
    const chatendRef = useRef(null);
    const [friendname, setFriendName] = useState(''); //친구추가 입력값 상태
    const [friends, setFriends] = useState([]);//친구 목록 



    //방 관련 설정
    const [roomlist, setRoomList] = useState([]);
    const [newroomname, setnewroomname] = useState('');



//방 목록록
    const fetchrooms = async () => {
      const res = await fetch('http://localhost:3001/api/auth/rooms');
      const data = await res.json();
      if (res.ok) setRoomList(data.rooms.map(r => r.name));
    };


//방 생성
  const handlecreateRoom = async () => {
    if (!newroomname.trim()) return;

    const res = await fetch('http://localhost:3001/api/auth/createroom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newroomname })
    });

    const data = await res.json();
    if (res.ok) {
      alert('방 생성 완료');
      setnewroomname('');
      fetchrooms();
    } else {
      alert(data.message);
    }
  };




  //방 제거
  const handleDeleteRoom = async (roomname) => {
  if (!window.confirm(`'${roomname}' ㄹㅇ 삭제할까`)) return;//확인창

  const res = await fetch('http://localhost:3001/api/auth/deleteroom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: roomname })
  }); //json 형태로 확인 

  const data = await res.json();
  if (res.ok) {
    alert('삭제 완료');
    fetchrooms();
    if (roomid === roomname) setRoomid('room1'); //삭제된 방의 경우 기본방 room1으로 이동 
  } else {
    alert(data.message);
  }
};



//dm
const handleEnterDM = (friendname) => {
  // 친구 이름과 내 이름을 정렬해서 방 이름을 항상 고정된 순서로 설정
  const sorted = [user.username, friendname].sort();
  const dmRoom = `DM_${sorted[0]}_${sorted[1]}`;
  setRoomid(dmRoom); // 해당 DM 방으로 입장 -> dm으로 입장 
};






//친구 목록 가져오기
  const fetchFriends = async (u = user) => {
    if (!u || !u.username) return;
    const res = await fetch('http://localhost:3001/api/auth/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u.username })
    });

    const data = await res.json();
    if (res.ok) {
      setFriends(data.friends);
    } else {
      alert(`${data.message}`);
    }
  };




  //친구 제거 함수
  const handleRemoveFriend = async (friendusername) => {
  const res = await fetch('http://localhost:3001/api/auth/removefriend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user.username, friendusername }) //json형태로 사용
  });

  const data = await res.json();
  if (res.ok) {
    alert(`${data.friend} 친구 제거 완료`);
    fetchFriends(); // 목록 갱신
  } else {
    alert(data.message);
  }
};


// https://xiubindev.tistory.com/100 
// 메시지 불러오기 
//방 입장시 서버에 표시 
   useEffect(() => {
        socket.emit('join room', roomid);
    }, [roomid]);


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
    },[roomid]);
    useEffect(() => {chatendRef.current?.scrollIntoView({ behavior: 'smooth' });}, [chat]);


    useEffect(() => {if (user) {fetchFriends();fetchrooms(); }}, [user]);



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
          const newUser = { username: loginform.username };
          setuser(newUser); // user 상태 설정
          fetchFriends(newUser); // user 값 넘겨주기
          fetchrooms();
    } else {
      alert(data.message);
    }
  };


// 메시지 전송 처리
    const sendMessage = (event) =>{ //https://programming119.tistory.com/100
        event.preventDefault(); //submit 되고 창이 돌아오는것을 방지 
        if(message.trim()==='')return;//빈 메시지 방지
        socket.emit('chat message',{ nickname: user.username, message,roomid}); // 입력받은 메시지 비우기, roomid 기능 추가
        setMessage(''); //메시지 비우기 
    };



  const handleaddfriend = async () => {
    if (!friendname.trim()) return;//friendname이 공백인 경우 그냥 return
    const res = await fetch('http://localhost:3001/api/auth/addfriend', { // 친구 추가 api
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({//json형태로 전송 
        username: user.username,
        friendusername: friendname
      })
    });

    const data = await res.json(); //서버로 받은 값을 data에 저장 
    if (res.ok) {
      alert(`${data.friend} 친구추가`);
      setFriendName('');
      fetchFriends(); //친구추가 이후 목록 갱신 
    } else {
      alert(` ${data.message}`);
    }
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
            <h2>실시간 채팅- {roomid}</h2> {/*방 이름 추가 */}
            <button onClick={() => setuser(null)} style={{ padding: '6px 10px', fontSize: '12px' }}>
              로그아웃웃
            </button>
          </div>
          {/*방 생성*/}
             <div style={{ marginBottom: '15px' }}>
              <input 
              type="text" 
              placeholder="새 방 이름 입력" 
              value={newroomname} onChange={(e) => setnewroomname(e.target.value)} style={{ padding: '6px', width: '60%' }} />
              <button onClick={handlecreateRoom} style={{ marginLeft: '10px' }}>방 생성 </button>
             </div>


            {/*방 목록 불러오기*/}
           <div style={{ marginBottom: '20px' }}>
            <h4>방 목록</h4>
            {roomlist.map((room, idx) => (
              <div key={idx} style={{ marginBottom: '5px' }}>
                <button onClick={() => setRoomid(room)}>{room}</button>
                <button onClick={() => handleDeleteRoom(room)} style={{ marginLeft: '8px', fontSize: '10px' }}>삭제</button>
               </div>
            ))}

           </div>





            {/*친구추가 세팅*/}
            <div style={{ marginBottom: '15px' }}>
              <input type="text" placeholder="친구 아이디 입력" value={friendname} onChange={(e) => setFriendName(e.target.value)} style={{ width: '60%', padding: '6px' }}/>
              <button onClick={handleaddfriend} style={{ marginLeft: '8px', padding: '6px 10px' }}>
                친구추가
              </button>
              
            </div>

            {/*친구 목록 */}
            <div style={{ marginBottom: '20px' }}>
              <h4>친구 목록</h4>
              <ul style={{ paddingLeft: '20px' }}>
                {friends.map((f, i) => ( 
                  <li key={i}> 
                  {f} 
                  <button onClick={() => handleRemoveFriend(f)} style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '12px' }} >
                     제거 
                  </button>

                  <button onClick={() => handleEnterDM(f)} style={{ marginLeft: '6px', padding: '2px 6px', fontSize: '12px' }}>
                    dm
                  </button>
                     </li> ))}
              </ul>

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
         {/* 채팅 출력 폼, user추가 + 자동 스크롤, 메시지 필터링 */}
        <ul style={{ marginTop: '20px' }}>
                {chat
                    .filter((msg) => msg.roomid === roomid)
                    .map((msg, idx) => (
                        <li key={idx} style={{ marginBottom: '5px', textAlign: msg.nickname === user.username ? 'right' : 'left' }}>
                            <strong>{msg.nickname}</strong>: {msg.message}
                            <div style={{ fontSize: '10px', color: '#888' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </li>
                    ))}
                <div ref={chatendRef} />
          </ul> 
        </div>
    );
}

export default App;




