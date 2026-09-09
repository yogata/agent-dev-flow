// 採用規則パッケージの型宣言（CJS 提供で型定義を持たないもののみ）。
// 実行時の形状検証は lib/rules.ts（asPresetModule）と検査テストが担保する。

declare module "textlint-rule-preset-ja-technical-writing" {
  const preset: { rules: Record<string, unknown>; rulesConfig?: Record<string, unknown> };
  export default preset;
}

declare module "textlint-rule-prh" {
  const prh: { linter: unknown; fixer: unknown };
  export default prh;
}
