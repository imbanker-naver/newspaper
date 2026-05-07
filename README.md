# newspaper

간단한 인터넷신문 매각/인수 접수 웹 앱입니다.

## 서버 실행 방법

1. 프로젝트 루트로 이동합니다.
2. `npm install`을 실행하여 종속성을 설치합니다.
3. 서버를 실행하려면 `npm start`를 사용합니다.
4. 브라우저에서 `http://localhost:3000`을 열면 로그인 화면이 먼저 표시됩니다.
5. 관리자 계정으로 로그인하면 관리자 대시보드로, 일반 회원으로 로그인하면 접수 페이지로 이동합니다.

## 환경 변수

- `ADMIN_EMAIL`: 관리자 이메일 주소 (기본값: `imbanker@naver.com`)
- `ADMIN_NAME`: 관리자 이름 (기본값: `관리자`)
- `ADMIN_PASSWORD`: 공개 서버에서 관리자 계정을 자동 생성할 때 사용할 비밀번호
- `DATABASE_PATH`: 데이터 저장 파일 경로 (지정하지 않으면 프로젝트 루트의 `database.json`)
- `SMTP_HOST`: SMTP 서버 호스트
- `SMTP_PORT`: SMTP 포트 (기본값: 587)
- `SMTP_SECURE`: `true` 또는 `false`
- `SMTP_USER`: SMTP 사용자 이름
- `SMTP_PASS`: SMTP 비밀번호
- `SMTP_FROM`: 발신자 이메일 주소 (지정하지 않으면 기본값 사용)

## 기능

- 이름, 이메일, 비밀번호 기반의 간단 회원가입
- `매각 희망` / `인수 희망` 접수
- 회원 및 접수 데이터는 `database.json` 파일에 저장됩니다.
- 비밀번호는 해시 형태로 저장됩니다.
- 관리자 이메일은 `imbanker@naver.com`으로 전송됩니다.
- 접수자에게 확인 이메일을 자동 발송합니다.
- 첫 접속 화면은 로그인 페이지입니다 (`http://localhost:3000/login.html`).
- 모든 사용자는 로그인 후 서비스를 이용할 수 있습니다.
- 관리자 계정으로 로그인하면 대시보드에서 회원 목록과 접수 목록을 확인할 수 있습니다.

## 공개 배포

이 앱은 Express API가 필요하므로 Firebase Hosting 단독 정적 호스팅으로는 배포할 수 없습니다.

Firebase를 사용할 경우 권장 구성은 Firebase Hosting + Cloud Run입니다.

- Firebase Hosting: 공개 URL, SSL, CDN
- Cloud Run: Express 앱 실행
- Firestore: 운영 데이터 저장 권장

Firebase Hosting에서 Cloud Run의 `newspaper` 서비스로 모든 요청을 rewrite하는 `firebase.json`을 포함했습니다. 자세한 절차는 `FIREBASE_DEPLOYMENT.md`를 참고하세요.
