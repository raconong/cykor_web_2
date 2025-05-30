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

module.exports = router;