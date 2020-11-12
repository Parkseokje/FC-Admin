# FC Admin

## 준비사항

- Node : v8.16.1
- Python : 2.7.16
- `yarn install`

## 빌드 및 배포

- yarn build
- git add...push
- yarn deploy (aws에 등록된 ssh 인증키 필요)

## 트러블 슈팅

- 서버 로그 확인: ssh 접속 > pm2 log
- 서버 리부팅: ssh 접속 > pm2 restart 0
