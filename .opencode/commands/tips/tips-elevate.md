---
description: evaluation-report.mdとarchive.mdから昇華判定を行い、Requirement Source stubを生成する
agent: sisyphus
load_skills:
  - tips-capture
  - tips-pipeline-orchestration
---

# 学びの昇華判定と Requirement Source stub 生成

`docs/tips/evaluation-report.md` の問題クラスを主入力とし、`docs/tips/archive.md` の過去エントリを参照して廃棄判定を行う。ユーザー承認後に `docs/tips/elevation-staging/` に Requirement Source 形式の stub を生成し、処理済みエントリを archive.md から pruning する。

**重要**: `.opencode/` への直接配置・直接反映は行わない。生成した stub は `issue-req` の明示入力ファイルとして扱い、`issue-req → issue-save-req → issue-create → issue-work` のルートで実装に移行する。

## Input

- `docs/tips/evaluation-report.md`（必須）— tips-refactor が生成した評価レポート
- `docs/tips/archive.md`（任意）— 過去エントリ参照用

## Output

- `docs/tips/elevation-staging/{category}-{name}.md` — Requirement Source 形式の stub

## Steps

1. **evaluation-report.mdの存在確認**:
   - `docs/tips/evaluation-report.md` を確認
   - 存在しない → エラー終了。「先に `/tips-refactor` を実行して分析レポートを生成してください」

2. **データ読込**:
   - evaluation-report.md を読込（クラスタ一覧・テーマ概要・重み・エントリ数を把握）
   - archive.md を読込（該当クラスタの過去エントリの日付・タイトル・内容を確認）

3. **廃棄判定**（11カテゴリ + duplicate）:
   - **主入力**: evaluation-report.md の問題クラスラスタ（raw tips の再分類は禁止）
   - 廃棄カテゴリ一覧、反映先マッピングは `tips-pipeline-orchestration` skill の「処分区分」を参照
   - 各クラスタに対し最適な廃棄先を判定

4. **既存対策確認**:
   - 各クラスタの内容に対し、既存の command/skill/template/docs に類似対策が存在するか確認
   - 確認対象とギャップ分類は `tips-pipeline-orchestration` skill の「処分区分 → 既存対策照合」を参照
   - 「新規X化」より「既存Xへ反映」を優先

5. **ユーザーへの判定結果提示**:

   ```
   ## 昇華判定結果

   | クラスタ | テーマ | 廃棄判定 | 既存対策 | 理由 |
   |---------|--------|---------|---------|------|
   | 1 | Windows環境エスケープ問題 | 既存 command へ反映 | issue-work に部分的に対策あり（fix gap） | ガードレールが不十分、3回出現 |
   | 2 | Supabase RLS落とし穴 | 新規 skill 化 | なし | 汎用的パターン、独立した判断手順あり |
   | 3 | コミットメッセージ形式 | duplicate | conventional-commits skill で十分カバー | 既存skillで対応済み |
   | 4 | 環境変数管理の注意点 | deferred | なし | 情報が断片的、出現1回のみ |
   ```

   統計サマリ:
   - 昇華対象: N件（staged）
   - 保留: N件（deferred）
   - 却下・重複: N件（rejected/duplicate）

6. **ユーザー承認**:
   - ユーザーが各クラスタの廃棄判定を確認・修正
   - 判定の変更指示があれば Step 3〜4 を再実行
   - 承認したクラスタのみ処理
   - 承認しない → 「昇華をキャンセルしました」と報告して終了

7. **Requirement Source stub 生成**（staging領域のみ）:
   - 出力先: `docs/tips/elevation-staging/`
   - ファイル名: `{disposal-category}-{name}.md`
   - **`.opencode/` への直接書込は禁止**
   - **`issue-work` への直接受け渡しは禁止**（`issue-req` を経由すること）
   - stub フォーマットは `tips-pipeline-orchestration` skill の「Requirement Source Staging Stub Schema」に従う
   - カテゴリ別の反映先パス例は `tips-pipeline-orchestration` skill を参照

8. **昇華時 prune**（archive.md からの除去）:
   - **prune 対象**: staged（stub 生成済み）/ rejected / duplicate のエントリのみ
   - **prune 非対象**: deferred / 未処理のエントリは archive.md に残す
   - **証拠保存**: staged エントリを除去する際、stub の「元tips / 根拠」セクションに保存してから除去
   - 詳細は `tips-pipeline-orchestration` skill の「Prune 方針 → elevate 時 prune」を参照
   - **実行手順**:
      1. prune 対象エントリの特定（staged/rejected/duplicate のクラスタに属するエントリ）
      2. ユーザーに prune 計画を提示
      3. ユーザーが prune を承認した場合のみ実行
      4. archive.md から該当エントリを除去（deferred・未処理は保持）

9. **完了報告**:
   - 生成した stub ファイル一覧（パス・カテゴリ・内容要約）
   - prune 結果（除去したエントリ数・残存エントリ数）
   - **次ステップの案内**:
      - 「生成した stub は `issue-req` の明示入力ファイルとして要件化してください」
      - 「`/issue/issue-req` に対象の stub ファイルパスを指定して開始できます」
      - 例: `/issue/issue-req docs/tips/elevation-staging/existing-command-windows-escape.md`
   - **注意事項**:
      - `.opencode/` への直接配置・直接反映は行わないこと
      - stub は必ず `issue-req` を経由すること（`issue-work` に直接渡さないこと）

## Guardrails

- **`.opencode/` 直接反映禁止**: stub は `docs/tips/elevation-staging/` のみに生成。`.opencode/commands/` や `.opencode/skills/` への直接書込は禁止
- **`issue-work` への直接受け渡し禁止**: stub は `issue-req` の明示入力ファイルとして扱う
- **evaluation-report.md は読込専用**: 変更・削除は禁止
- **主入力は evaluation-report.md**: raw tips の再分類は禁止
- **既存対策を優先**: 「新規X化」より「既存Xへ反映」を優先
- **ユーザー承認必須**: 判定・prune ともに承認なしに実行しない
- **elevation-ledger.md は生成しない**: 管理用ファイルは作成しない

## ユーザー確認ポイント

1. **Step 5-6**: 廃棄判定結果の確認・修正・承認
2. **Step 8**: prune 計画の承認

## Error Handling

| エラー | 対処 |
|--------|------|
| evaluation-report.mdが存在しない | エラー終了。「先に `/tips-refactor` を実行して分析レポートを生成してください」 |
| クラスタが0件 | 「昇華対象のクラスタがありません」と報告して終了 |
| ユーザーが承認しない | 「昇華をキャンセルしました」と報告して終了 |
| staging領域の書込失敗 | エラー内容を報告 |
| archive.mdの prune 失敗 | stub 生成は保持。prune エラー内容を報告し、手動での prune を案内 |

## 注意事項

- **staging領域のみに生成**: `.opencode/` への直接配置は禁止
- **stub のみ生成**: 完全なSKILL.mdやコマンドファイルは生成しない
- **archive.md は living tips pool**: prune は staged/rejected/duplicate のみ。deferred・未処理は保持
- **反射ルート**: staging stub → `issue-req`（明示入力ファイル）→ `issue-save-req` → `issue-create` → `issue-work`
