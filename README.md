# 説明

https://github.com/iwannatto/batoroza
のReactにしてコードをだいぶ綺麗にした版

# ルール（元リポジトリのを転記だが、保留してた実装をいくつかやっている）

大まかなルールとしては、

- 1~15の数字・赤青緑黄橙の色　が各1つづつ書かれた相違なるカード75枚がある。
- n人に初期手札m枚を配布する。n=3-5, m=5-7くらいが普通。残りは山札。
- 基本は大富豪。プレイヤー間に固定の順番があり、順番ごとにターンが回っていく。
- 自分のターンで、フィールドになにもないとき、カードを1枚出すことができる。
- 自分のターンで、フィールドになにかあるとき、(山札からカードを1枚引く|引かない)を行ったのち、  
  フィールドより数字が大きくかつ同色でないものを1枚出すことができる。パスもできる。
- パスが連続して、元のカードを出した人までターンが回ってきたら、フィールドのカードは流れる。
- 早く手札をなくしたほうが勝ち。（この実装では1人が勝つと終了となるが、そうでなくてもよい）

となります。また、細かい点として、

- 8切りが存在する。8に対してはカードを出せず、引くこともできない。
- 8切り返しが存在する。8に対して8だけは出すことができる。出したら即座にフィールドが流れ、出した人のターン。
- 革命が存在する。同数字のカード3枚を同時に出す。これは8以外の全てのカードに対して行える。  
  革命をした場合、即座に次の人にターンが移行する。
- 8上がりと革命上がりは禁止されている。
- 攻撃が存在する。フィールドに対し、赤←→青もしくは黄←→緑の関係にあるカードを出した場合、  
  floor(diff/3)枚のカードをフィールドのカードの元持ち主に強制的に引かせる。
- 攻撃による上がり阻止ができる。つまり、ラストのカードを出しても攻撃されたら上がりはなかったことになる。（実装していなかったが実装した）
- 山札切れになった場合、その時点での手札の枚数で順位がつく（実装していなかったが実装した）

があります。

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
