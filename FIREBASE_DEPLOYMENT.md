# Firebase Hosting 배포 방안

이 앱은 Express API, 로그인 세션, 파일 저장, 이메일 발송이 필요합니다. Firebase Hosting만으로는 부족하므로 Firebase Hosting에서 Cloud Run 서비스로 모든 요청을 rewrite하는 구성을 사용합니다.

## 권장 구성

- Firebase Hosting: 공개 URL, SSL, CDN, 커스텀 도메인
- Cloud Run: 현재 Express 앱 실행
- Firestore: 회원/접수 데이터 저장
- SMTP 환경 변수: 관리자/접수자 이메일 발송

현재 코드의 `database.json` 저장은 로컬 개발에는 충분하지만 Cloud Run에서는 인스턴스 재시작이나 재배포 때 유지된다고 볼 수 없습니다. 공개 운영 전에는 Firestore 저장소로 교체하는 것이 안전합니다.

## 준비 사항

1. Firebase 프로젝트를 생성합니다.
2. Google Cloud 결제를 활성화합니다.
3. Firebase CLI에 로그인합니다.

```bash
firebase login
firebase use --add
```

4. Google Cloud CLI를 설치하고 로그인합니다.

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

## Cloud Run 배포

```bash
gcloud run deploy newspaper \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars ADMIN_EMAIL=imbanker@naver.com,ADMIN_NAME=관리자,ADMIN_PASSWORD=CHANGE_ME
```

SMTP를 실제로 사용하려면 Cloud Run 환경 변수에 아래 값을 추가합니다.

```text
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
SMTP_FROM
```

## Firebase Hosting 연결

`firebase.json`은 모든 요청을 `asia-northeast3` 리전의 `newspaper` Cloud Run 서비스로 rewrite하도록 설정되어 있습니다.

```bash
firebase deploy --only hosting
```

배포 후 아래 주소로 접속합니다.

```text
https://YOUR_PROJECT_ID.web.app
```

## 공개 운영 전 필수 작업

- `database.json` 저장을 Firestore로 교체
- `ADMIN_PASSWORD`를 강한 비밀번호로 설정
- SMTP 환경 변수 설정
- Cloud Run 최대 인스턴스 제한 설정
- Firebase/Google Cloud 비용 알림 설정
