# Firebase Spark 무료 배포

비용 발생 가능성을 피하기 위해 결제 계정을 연결하지 않는 Firebase Spark 플랜 기준으로 배포합니다.

## 사용하는 서비스

- Firebase Hosting: 정적 파일 호스팅
- Firebase Authentication: 이메일/비밀번호 로그인
- Cloud Firestore: 회원/접수 데이터 저장

Cloud Run, Cloud Functions, App Hosting은 사용하지 않습니다.

## Firebase 콘솔 설정

1. Firebase 프로젝트를 생성합니다.
2. 요금제는 Spark로 유지합니다.
3. Authentication에서 이메일/비밀번호 제공업체를 활성화합니다.
4. Firestore Database를 생성합니다.
5. 웹 앱을 추가하고 SDK 설정값을 복사합니다.
6. `firebase-config.js`의 `firebaseConfig` 값을 실제 프로젝트 값으로 교체합니다.

## 배포

```bash
firebase login
firebase use --add
firebase deploy --only hosting,firestore:rules
```

배포 후 루트 URL은 로그인 화면으로 열립니다.

```text
https://YOUR_PROJECT_ID.web.app
```

## 관리자 계정

관리자 이메일은 `firebase-config.js`와 `firestore.rules`에 있는 `imbanker@naver.com`입니다. 이 이메일로 회원가입하면 관리자 역할로 저장되고 관리자 대시보드로 이동합니다.

## 제한 사항

- 서버 자동 이메일 발송은 제거됩니다.
- 무료 한도를 넘으면 과금이 아니라 Spark 플랜 제한에 걸릴 수 있습니다.
- Firestore 보안 규칙은 `firestore.rules`에서 관리합니다.
