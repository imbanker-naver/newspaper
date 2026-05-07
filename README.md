# newspaper

간단한 인터넷신문 매각/인수 접수 웹 앱입니다.

## 무료 운영 방향

비용 발생 가능성을 피하기 위해 결제 계정을 연결하지 않는 Firebase Spark 플랜 기준으로 운영합니다.

- Firebase Hosting: 정적 웹 호스팅
- Firebase Authentication: 이메일/비밀번호 로그인
- Cloud Firestore: 회원 및 접수 데이터 저장

Cloud Run, Cloud Functions, App Hosting, 서버 기반 이메일 발송은 사용하지 않습니다.

## 로컬 확인

정적 파일로 동작하므로 별도 Express 서버 없이 브라우저에서 확인할 수 있습니다. Firebase 연동 테스트는 `firebase-config.js`에 실제 Firebase 웹 앱 설정값을 넣은 뒤 진행합니다.

첫 화면:

```text
index.html
```

접수 화면:

```text
deal.html
```

관리자 화면:

```text
admin.html
```

## 기능

- 모든 사용자는 로그인 후 이용
- 이름, 이메일, 비밀번호 기반 회원가입
- 일반 회원 로그인 시 접수 페이지로 이동
- 관리자 이메일 `imbanker@naver.com` 로그인 시 관리자 대시보드로 이동
- 접수 데이터는 Firestore `submissions` 컬렉션에 저장
- 회원 데이터는 Firestore `users` 컬렉션에 저장

## Firebase 설정

1. Firebase 프로젝트를 Spark 플랜으로 생성합니다.
2. Authentication에서 이메일/비밀번호 로그인을 활성화합니다.
3. Firestore Database를 생성합니다.
4. Firebase 웹 앱 설정값을 `firebase-config.js`에 입력합니다.
5. 보안 규칙은 `firestore.rules`를 배포합니다.

자세한 절차는 `FIREBASE_SPARK_DEPLOYMENT.md`를 참고하세요.
