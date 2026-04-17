# 投票イベント管理アプリ (Contest App)

イベント（コンテスト）を作成し、ユーザーからの投票を受け付けることができるWebアプリケーションです。管理者はイベントの作成・編集および投票結果の集計ができ、一般ユーザーは開催中のイベントに対して投票を行うことが可能です。

## 🌟 主な機能

### 一般ユーザー向け
- **イベント一覧**: 現在開催中・投票受付中のイベントを一覧表示
- **投票機能**: イベントの選択肢から一つを選んで投票（ブラウザのFingerprintを利用した多重投票防止機能など）
- **結果閲覧**: 投票結果の確認（※イベントの設定による）

### 管理者向け
- **ダッシュボード**: イベントの一覧管理、ステータス（開催中・終了）の確認
- **イベント管理**: 新規イベント作成、選択肢の追加、イベントの編集と削除
- **結果集計**: リアルタイムでの投票データ集計
- **認証**: `iron-session`によるセキュアな管理者ログイン機能

---

## 🛠 技術スタック

### フロントエンド
- **フレームワーク**: [Next.js](https://nextjs.org/) (App Router対応)
- **UIライブラリ**: React
- **スタイリング**: Tailwind CSS

### バックエンド / インフラ
- **API・サーバー処理**: Next.js Server Actions / API Routes
- **データベース**: Firebase Cloud Firestore
- **サーバー制御**: Firebase Admin SDK

### その他ライブラリ
- **セッション管理**: `iron-session` (Cookieベースのセキュアなセッション管理)
- **一意アクセス判定**: `@fingerprintjs/fingerprintjs` (ブラウザ識別を利用した重複投票の防止)
- **ID生成**: `uuid`

---

## 📁 ディレクトリ構成

```plaintext
src/
├── app/
│   ├── admin/                # 管理者用機能
│   │   ├── (protected)/      # 要ログイン用のレイアウト（dashboard, eventsなど）
│   │   └── login/            # 管理者ログインページ
│   ├── api/                  # APIルート (admin機能や各種バックエンド通信)
│   ├── results/[id]/         # 投票結果ページ
│   ├── vote/[id]/            # 投票ページ
│   ├── layout.tsx            # 全体のベースレイアウト
│   └── page.tsx              # トップページ（開催中イベント一覧）
├── components/               # 汎用UIコンポーネント (オプション)
├── lib/                      # 各種設定やユーティリティ関数
│   ├── firebase/             # Firebaseの初期化、Admin設定
│   └── session/              # iron-sessionの設定
└── types/                    # TypeScriptの型定義ファイル
```

---

## 🚀 環境構築・起動方法

### 1. リポジトリのクローンとパッケージインストール

```bash
git clone <repository_url>
cd contest_app
npm install
```

### 2. 環境変数の設定

プロジェクト直下に `.env.local` ファイルを作成し、以下のような値を設定します（値はご自身のFirebaseプロジェクトにあわせて変更してください）。

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# iron-session
SESSION_SECRET=your_32_character_complex_secret_string
SESSION_COOKIE_NAME=admin_session
```

### 3. Firebase Firestoreの準備
Firebaseコンソールにアクセスし、Firestore Databaseを作成します。
さらに、アプリケーションのクエリ要件を満たすための**複合インデックス（Composite Index）**の作成が必要です。（ローカル起動時にエラーログが出た場合は、ログに記載のURLリンクから自動構築が可能です）

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスするとアプリが表示されます。管理画面は [http://localhost:3000/admin/login](http://localhost:3000/admin/login) から利用可能です。
