# nBPI Calculator Web App - デプロイ手順書

このアプリケーションは、GitHub Pagesの機能を使って**完全無料**で公開できます。
`docs` フォルダを使って公開する設定にしているので、以下の手順だけで完了します。

## 手順: GitHub Pagesの有効化

1.  GitHubリポジトリのページを開きます。
2.  上部のタブから **Settings** をクリックします。
3.  左側のサイドバーから **Pages** をクリックします。
4.  **Build and deployment** セクションの設定を以下のように変更します：
    *   **Source**: `Deploy from a branch`
    *   **Branch**: `main` (または `master`)
    *   **Folder**: **`/docs`** (ここが重要です！)
5.  **Save** ボタンを押します。

## 公開完了

**Save** を押して数分待つと、ページ上部に以下のようなURLが表示されます。

`Your site is live at https://<YOUR-USERNAME>.github.io/nbpi_streamlit/`

このURLにアクセスすれば、計算機が使えます！
