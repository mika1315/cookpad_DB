# cookpad_DB
cookpad 風の Web アプリです。
授業の課題で制作しました。

## 使い方
- Node.js をインストール https://nodejs.org/ja/
- リポジトリをクローンする
- package.json が入っているディレクトリ下で必要なモジュールをインストール  
``` 
npm install
```
- Web サーバを立ち上げる  
``` 
node app.js
```
- ブラウザで http://localhost:3000 にアクセスしてみる

## どこに何が書かれているの？
- app.js
  - URLが指定された時に何を動かして何を返せばいいかが書かれている
  
- /views/index.pug
  - http://localhost:3000 にアクセスした時に表示されるHTML
  - ユーザーの個人ページを表示する。
  
- /views/search.pug
  - http://localhost:3000/search にアクセスした時に表示されるHTML
  - 検索画面を表示する。食材名で検索ができる。
  
- /views/insearch.pug
  - http://localhost:3000/insearch にアクセスした時に表示されるHTML
  - 検索結果画面を表示する。検索画面で検索ボタンをクリックするとここに遷移。
  
- /views/recipe.pug
  - http://localhost:3000/recipe にアクセスした時に表示されるHTML
  - レシピを表示する。


