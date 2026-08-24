---
title: "AUTOGEN ブロック鮮度検出 gate"
status: draft
created: "2026-08-09"
updated: "2026-08-18"
---

# AUTOGEN ブロック鮮度検出 gate

`/repo/docs-check` は repo-local コマンドであり配布対象外 Design を持たないため、AUTOGEN ブロック鮮度検出 gate を本新規 Design として配置する。
AUTOGEN ブロックを含む索引ファイル（design-health-metrics.md 等）の陳腐化を検出し、再生成を促す契約を定義する。
本 Design は gate の契約を定義し、検出ロジックの実装詳細はスクリプト側が担う（機械化境界、charter 原則）。

## 検出対象

- AUTOGEN ブロック（`<!-- AUTOGEN:BEGIN:id=xxx -->` 〜 `<!-- AUTOGEN:END -->`）を含む索引ファイル群
- 代表例: `docs/designs/quality/design-health-metrics.md`（Design 計測例 AUTOGEN ブロック）
- 対象一覧は SC-002（`docs/designs/integrity/index-auto-generation.md`）が定める自動生成対象ファイルと同一

### 廃止済み成果物を前提とする block ID の棚卸し規定

- 検査対象 block ID は、参照先索引ファイルが現行存在することを前提とする。廃止済み成果物（旧 ADR README、削除済み文書地図等）を前提とする block ID を検査対象に含めない
- block ID の棚卸しは、参照先実ファイルの存在確認をもって行い、不在を検出した場合は検査対象から除去するとともに、由来（廃止契約、REQ）を検査対象リストの記録に残す
- 検査対象の追加・削除は index-auto-generation Design の採用 block ID 一覧と整合させる

## 鮮度判定基準

- 対象ファイルのソース（Design / REQ / ADR / IR の frontmatter、ファイル名、status）の rename 発生時に AUTOGEN ブロックの再生成必要性を判定する
- 対象ファイルのソース status 変更（draft → accepted 等）時に AUTOGEN ブロックの再生成必要性を判定する
- SC-002（定期再生成）と整合する運用を維持する
- 計測日導出方式は index-auto-generation Design「計測日導出」節に従い対象ドキュメント群の最終コミット日付基準とする。実行時日付（`new Date()`）の採用によりコミット済み AUTOGEN ブロックが日次で鮮度を失い IR-061 が構造的に再検出する運用は解消する。本解消を本 gate の契約として明記する

鮮度種別は検出結果に応じて次の3種に分類する。
分類は「鮮度違反の優先的付与」であり絶対的分類ではない（例: rename と status 変更が同時に起きた場合、行数増減を伴えば rename、同行値変化のみなら status_change と分類）。

| 種別 | 判定規則 |
|------|----------|
| `rename` | AUTOGEN block の行数が期待値と異なる（ソースファイル追加・削除・rename を起因とする行増減） |
| `status_change` | 同一 id の行で status 列のみ変化（Design / Decision の status frontmatter 変更に起因） |
| `content_change` | 上記以外の不一致（行数値、タイトル、キャプション、リンク等の変化） |

## 不合格時の処置

- 鮮度判定不合格時は再生成を要求し、合格まで検出を継続する
- 自動修復は行わず、再生成対象を報告に留める
- 再生成コマンド: `bun run .opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`

## 実装契約

本 Design が定める gate を実装する検査スクリプトとその呼出し契約。

- **検査スクリプト**: `.opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts`
- **実行ランナー**: Bun（`bun run`）。TypeScript 直接実行と `require()` / `import` 混在構文を前提とするため、Bun 以外のランナーでは ESM 解釈エラーが発生する
- **docs-check からの呼出し**: `/repo/docs-check` Step 1 が `bun run` で実行する。check_autogen_freshness.ts の strict failure（stale blocks 検出）は docs-check 全体を fail とする
- **生成スクリプトとの論理同一性**: 検査スクリプトは生成スクリプト（`generate_indexes.ts`）の exported 関数を再利用し、検査と生成で同一の再生成ロジックを共有する。これにより検査と生成の間の論理的同一性を保証する（AG-002 docs-check の検査対象不変原則の維持）
- **IR-061 との関係**: IR-061（`check_integrity.ts` `checkIndexGenerationConsistency`）は同一の不整合を「内容不一致」として検出する。本 gate は鮮度種別（rename / status_change / content_change）を分類して報告する点が異なる。両検査は独立して実施し、いずれか単独の実施要否にも他方の結果は影響しない（独立実施原則）

### CLI 契約

```
bun run .opencode/skills/repo-agentdev-integrity/scripts/check_autogen_freshness.ts [--help] [--json] [--dry-run] [--root <path>]
```

| オプション | 動作 |
|------------|------|
| `--help` | ヘルプを表示して exit 0 |
| `--json` | 結果を JSON 形式で出力 |
| `--dry-run` | 検査対象のみ列挙して検査を実施せず exit 0 |
| `--root <path>` | 明示的リポジトリルート（worktree / CI サポート） |

終了コード: 0（鮮度維持）、1（陳腐化検出、再生成要求）、2（入力エラー）。

## 関連

- REQ-010-059（AUTOGEN ブロック鮮度検出 gate 要件行）
- SC-002（定期再生成、`docs/designs/integrity/index-auto-generation.md`、REQ-010 関連）
- IR-061（索引類自動生成整合性、`docs/designs/integrity/rules/IR-061-index-generation-consistency.md`）
- `/repo/docs-check`（repo-local、配布対象外）

