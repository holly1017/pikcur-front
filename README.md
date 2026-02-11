# 🛒 PIKCUR

**PIKCUR**는 React/TypeScript를 기반으로 한 **아이템 경매 및 리셀 플랫폼**입니다.
단순한 이커머스를 넘어, 실시간 입찰 시스템과 안전한 결제 인프라, 효율적인 알림 시스템을 갖춘 프로젝트입니다.
(백엔드 리포지토리: [PIKCUR-Back](https://github.com/holly1017/pikcur-back))


## ✨ 주요 기능

- **경매 시스템**: 실시간 입찰, 입찰 내역 확인, 경매 종료 임박 상품 리스트 제공.
- **상품 관리**: 카테고리별 상품 탐색, 상품 상세 설명 및 리뷰 시스템.
- **검색 및 필터링**: 강력한 검색 기능과 브랜드/카테고리별 필터링 기능.
- **마이페이지**: 개인 거래 내역(구매/판매), 입찰 현황, 찜한 상품 관리.
- **실시간 알림 및 소통**: 소켓(SockJS/StompJS)을 이용한 실시간 업데이트.
- **사용자 인증**: JWT 기반 로그인, 아이디/비밀번호 찾기, 회원가입.

## 🛠 기술 스택

- **Core**: React 19, TypeScript
- **Styling**: Material UI (MUI), Emotion
- **State Management**: React Context API
- **Networking**: Axios, SockJS, StompJS (Websocket)
- **Routing**: React Router Dom v7
- **Fonts**: Noto Sans KR (Fontsource)

## 📁 폴더 구조

```
src/
├── assets/          # 이미지 및 아이콘 자산
├── common/          # API 설정 및 공용 유틸리티
├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── common/      # 범용 컴포넌트 (버튼, 카드 등)
│   └── layout/      # 레이아웃 관련 컴포넌트
├── context/         # Auth 등 전역 상태 관리를 위한 Context
├── pages/           # 라우트별 주요 페이지 구성
│   ├── Auth/        # 인증 관련 (로그인, 회원가입)
│   ├── Goods/       # 상품 및 경매 등록/상세
│   ├── Main/        # 메인 페이지 및 검색
│   ├── MyPage/      # 사용자 개인 대시보드
│   ├── Store/       # 스토어 상세 및 거래 내역
│   └── Contact/     # 고객센터 (FAQ, 1:1 문의)
├── App.tsx          # 라우팅 및 앱 엔트리 포인트
└── index.tsx        # 메인 렌더링 파일
```

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm start
```

### 3. 환경 변수 설정
`.env` 파일을 루트 디렉토리에 생성하고 필요한 API 엔드포인트 등을 설정
