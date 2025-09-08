export default {
  api: {
    // 1. 入力となるOpenAPI仕様書のパス
    input: '../docs/openapi.swagger.json',

    output: {
      // 2. 'tags-split'モードで、APIのタグごとにファイルを分割する
      mode: 'tags-split',
      // 3. 生成されるフックやAPIクライアントの出力先
      target: './app/shared/api/endpoints',
      // 4. TanStack Query v5 用のカスタムフックを生成
      client: 'react-query',
      // 5. Zodのバリデーションスキーマも生成する
      validation: true,
    },

    // 6. Zodスキーマの生成に関する詳細設定
    zod: {
      // Zodスキーマの出力先
      output: './app/shared/api/schemas',
    }
  },
};
