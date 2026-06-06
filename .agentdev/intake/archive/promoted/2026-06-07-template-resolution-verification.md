# case-auto/case-close テンプレート参照解決不備の完了条件未チェック

case-auto / case-close のテンプレート参照解決不備（runtime path 誤参照・テンプレート種別誤探索）の修正 Issue で、完了条件6項目・テスト戦略1項目が未チェックのままクローズされている。テンプレート参照の runtime path 修正、artifact-contracts.md の明文化、src/opencode 固定参照の残存確認、integrity-check での検出条件定義等の完了確認が記録されていない。

- case-close.md Step 4 の Issueコメントテンプレート runtime path 明示
- case-auto.md への runtime path ルール追加（`.opencode/...` 使用、`src/opencode/...` 読み替え禁止）
- artifact-contracts.md のテンプレート種別別参照先と runtime/source path 使い分けの明文化
- commands / skills の実行時 Read / Glob 手順に `src/opencode/...` 固定参照が残らないこと
- 同種の誤探索を検出できる検証条件の定義
- case-close 実行時のテンプレート参照が正しい runtime path に解決されることの回帰テスト

## 根拠

- Issue #625: fix: case-auto/case-close のテンプレート参照解決不備（runtime path 誤参照・テンプレート種別誤探索）
  - 完了条件5項目・テスト戦略1項目が未チェックでクローズされている
  - 現状は後続探索で救済されているが、テンプレート追加・変更時に再発のリスクがある
