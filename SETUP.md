# セットアップガイド

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力して作成

## 2. Authentication の設定

1. Firebase Console → Authentication → 「始める」
2. 「Sign-in method」タブ → 「メール/パスワード」を有効化
3. 「ユーザー」タブ → 「ユーザーを追加」で管理者アカウントを作成

## 3. Firestore の設定

1. Firebase Console → Firestore Database → 「データベースの作成」
2. 「本番環境モード」で作成
3. ロケーションを選択（例: asia-northeast1）
4. 「ルール」タブで以下のルールを設定:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read: if true;
      allow write: if false;
    }
    match /votes/{voteId} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

5. Firestoreインデックスの設定（「インデックス」タブ）:
   - `votes` コレクション: `eventId` (昇順) + `voterToken` (昇順)
   - `events` コレクション: `isOpen` (昇順) + `createdAt` (降順)

   または `firebase deploy --only firestore:indexes` でデプロイ

## 4. 環境変数の設定

### Client SDK の設定値取得
Firebase Console → プロジェクトの設定 → 「アプリ」→ ウェブアプリを追加

### Admin SDK の設定値取得
Firebase Console → プロジェクトの設定 → 「サービスアカウント」→「新しい秘密鍵の生成」

### .env.local を更新

```bash
# クライアント側（Firebase Console → プロジェクトの設定 → アプリ）
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# サーバー側（ダウンロードしたJSONから）
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# セッション（32文字以上のランダムな文字列）
SESSION_SECRET=your_super_secret_key_at_least_32_characters_long_here
SESSION_COOKIE_NAME=admin_session
```

**注意**: `FIREBASE_PRIVATE_KEY` の改行は `\n` でエスケープしてください。

## 5. 開発サーバーの起動

```bash
npm run dev
```

## 6. アクセス方法

| URL | 説明 |
|-----|------|
| `http://localhost:3000/` | 公開トップ（開催中の投票一覧） |
| `http://localhost:3000/admin/login` | 管理者ログイン |
| `http://localhost:3000/admin/dashboard` | 管理ダッシュボード |
| `http://localhost:3000/vote/[id]` | 投票ページ（共有用） |
| `http://localhost:3000/results/[id]` | 結果ページ（公開） |
