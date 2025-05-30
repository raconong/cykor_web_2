const express = require('express'); //express 웹 프레임워크
const router = express.Router(); //라우터 -> register,login 생성 
const User = require('./usersetting');


//https://velog.io/@jihukimme/React-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EB%A1%9C%EA%B7%B8%EC%95%84%EC%9B%83-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0
router.post('/register', async (req, res) => { //회원가입 
  const { username, password } = req.body;//https://www.google.com/search?q=req.body&rlz=1C1GCEU_koKR1161KR1161&oq=req.body&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQABiABDIMCAIQABgUGIcCGIAEMgcIAxAAGIAEMgcIBBAAGIAEMgcIBRAAGIAEMgYIBhAAGB4yBggHEAAYHjIGCAgQABgeMgYICRAAGB7SAQc0MThqMGo0qAIAsAIA&sourceid=chrome&ie=UTF-8
  try {
    const exist = await User.findOne({ username }); //이미 같은 id가 있는지 확인 
    if (exist) return res.status(400).json({ message: '이미 저장된 id' }); //저장된 값이 있는 경우 

    const user = new User({ username, password }); //user 정보 획득 및 저장  
    await user.save();
    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err });
  }
});

// 로그인
router.post('/login', async (req, res) => { //request,response
  const { username, password } = req.body; //request에서 id,password 추출
  const user = await User.findOne({ username, password }); //해당 요소 찾기
  if (!user) return res.status(401).json({ message: '로그인 실패' }); //user 데이터가 없는 경우 

  res.status(200).json({ message: '로그인 성공', user: { username } }); //로그인 response 전송 
});



router.post('/addfriend', async (req, res) => {
  const { username, friendusername } = req.body;
  try{
        const user = await User.findOne({ username }); //사용자자
        const friend = await User.findOne({ username: friendusername }); //추가하려는 이름
        if (!user || !friend) {// 둘중 하나가 없는 유저인 경우 
          return res.status(404).json({ message: '없는 유저' });
         }


        const alreadyfriend = user.friends.includes(friend._id); //이미 친구추가되어 있는지 체크 
        if (alreadyfriend) {
          return res.status(400).json({ message: '이미 친구추가됨' });
        }

        //친구 추가
        user.friends.push(friend._id);
        friend.friends.push(user._id);
        await user.save();
        await friend.save(); 
        res.status(200).json({ message: '친구 추가 완료', friend: friend.username }); //친구 추가 완료 체크 


  }catch (err) { //error 확인 
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});




//친구 목록 확인용 api
router.post('/list', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username }); //user찾기 
    if (!user) return res.status(404).json({ message: '사용자 없음' });

    const friends = await User.find({ _id: { $in: user.friends } }, 'username');//friend 확인 
    res.json({ friends: friends.map(f => f.username) });
  } catch (err) {
    res.status(500).json({ message: '서버 에러' });
  }
});


//친구 제거 api
router.post('/removefriend', async (req, res) => {
  const { username, friendusername } = req.body;
  try {
    const user = await User.findOne({ username }); //user찾기 -> 기존과 동일 
    const friend = await User.findOne({ username: friendusername });

    if (!user || !friend) { //둘중에 데이터가 없는 경우 
      return res.status(404).json({ message: '없는 유저' });
    }

    //배열에서 제거 
    user.friends = user.friends.filter(fId => !fId.equals(friend._id)); //친구 id를 제거해서 새로 확인 
    friend.friends = friend.friends.filter(fId => !fId.equals(user._id));
    await user.save();
    await friend.save(); 

    res.status(200).json({ message: '친구 제거 완료', friend: friend.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});


module.exports = router;