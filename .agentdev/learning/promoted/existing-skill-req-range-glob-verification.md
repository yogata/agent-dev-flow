# 要件定義・plan 作成時の active REQ 実ファイル一覧の glob 実証確認

## 背景

case-run で Momus review により REQ-0123 の見落としが指摘された。要件定義・plan 作成時に active REQ の実ファイル一覧を `glob docs/requirements/REQ-*.md` 等で実証確認していれば、REQ-0123 の存在を事前に把握できた。文書のレンジ表現（例: REQ-0101〜REQ-0123）を信頼し、実ファイルとの乖離を見逃していた。

req-define Step 3（既存REQ照合）は `agentdev-req-file-manager` の照合方法論に従うが、実ファイル一覧の glob/grep 実証確認は明示的に要求されていない。Step 4-1（関連ドキュメント更新候補抽出）は glob を探索に使うものの、番号レンジと実ファイルの一致検証は不在。

## 問題

- 要件定義・plan 作成時に文書の REQ 番号レンジを暗黙に信頼し、実ファイル一覧の glob 実証確認を怠る運用になっている
- req-define Step 3（既存REQ照合）に実ファイル一覧の確認ステップが明示的に存在しない
- case-run plan 作成手順（`agentdev-workflow-orchestration`）にも同様の確認ステップが不在
- ADR 番号レンジ等でも同種の問題が発生し得るが、その予防策も未整備

## 望ましい変更

要件定義・plan 作成ステップに「active REQ/ADR 実ファイル一覧の glob 実証確認」を必須ステップとして組み込む。文書の番号レンジ表現を信頼せず、`glob docs/requirements/REQ-*.md` および `glob docs/adr/ADR-*.md` で実ファイル一覧を取得し、文書記載のレンジと照合する。

## 対象範囲

### 対象

- `src/opencode/skills/agentdev-req-analysis/SKILL.md`（要件定義手順）
- `src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md`（分類ゲート詳細、必要に応じて）
- `src/opencode/commands/agentdev/req-define.md`（Step 3-4 の実証確認ステップ化）
- `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md`（case-run plan 作成手順、副次）

### 対象外

- `agentdev-req-file-manager`（REQ ファイルの読み書き方法論。実証確認の呼び出し側ではなく対象リソース）
- integrity スクリプト（REQ 番号レンジと実ファイルの乖離は運用上の確認事項であり、スクリプト検査対象ではない）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| skill | `src/opencode/skills/agentdev-req-analysis/SKILL.md` | 要件定義手順の冒頭または既存REQ照合ステップに「実ファイル一覧の glob 実証確認」を必須確認として追記 |
| skill | `src/opencode/skills/agentdev-req-analysis/references/req-define-detailed-gates.md` | 詳細ゲートに REQ/ADR 実ファイル一覧確認の具体的コマンド例（`glob docs/requirements/REQ-*.md`）を追記 |
| command | `src/opencode/commands/agentdev/req-define.md` | Step 3（既存REQ照合）に glob 実証確認サブステップを追加 |
| skill | `src/opencode/skills/agentdev-workflow-orchestration/SKILL.md` | （副次）case-run plan 作成手順に REQ 実ファイル一覧確認を前提条件として追記 |

## 既存対策確認

- **確認結果**: 既存対策なし（fix gap）
- **該当ファイル**: なし
- **ギャップ分類**: fix gap
- **ギャップ詳細**: `agentdev-req-analysis/SKILL.md`、`agentdev-workflow-orchestration/SKILL.md`、`req-define.md` Step 3-4 のいずれにも、実ファイル一覧の glob 実証確認ステップが明示的に存在しない。req-define Step 3 は `agentdev-req-file-manager` の照合方法論に従うが、実ファイル一覧取得は要求しない。Step 4-1 は glob を探索に使うが、番号レンジと実ファイルの一致検証は不在。

## 制約

- 既存の req-define Step 構成を大きく変えないこと（サブステップ追加レベル）
- glob パターンは `docs/requirements/REQ-*.md`（retired 含む）と `docs/requirements/REQ-*.md`（retired 除く）の使い分けに注意。AGENTS.md の優先順位（retired REQ は歴史目的）を尊重
- ADR 番号（`docs/adr/ADR-*.md`）でも同様の確認が有益であることを併記するが、REQ が主対象
- 自動化しやすいステップであるため、将来的な integrity スクリプトでの機械的検証も視野に入れる（ただし本 artifact の対象外）

## 受け入れ条件

- [ ] `agentdev-req-analysis` SKILL.md に REQ/ADR 実ファイル一覧の glob 実証確認ステップが追記されている
- [ ] req-define Step 3（または該当ステップ）に glob 確認サブステップが追加されている
- [ ] 番号レンジと実ファイルの乖離発見時の対応手順（文書修正または実ファイル確認）が明記されている
- [ ] （副次）`agentdev-workflow-orchestration` の case-run plan 作成手順に同様の確認が前提条件として記載されている

## 元learning item / 根拠

- **要約**: 文書の REQ 番号レンジを信頼し、実ファイル一覧の glob 実証確認を怠った結果、REQ-0123 を見落とし Momus review で指摘された。
- **根拠**: Issue #803, case-run Momus review で実証。AGENTS.md の「REQ-0101.md 〜 REQ-0133.md」というレンジ表現を信頼し、`glob docs/requirements/REQ-*.md` で実在ファイルを確認しなかったことが根本原因。
- **再発条件**: 文書のレンジ表現を信頼して実ファイル一覧を確認しない場合
- **横展開可能性**: 全ての要件定義・plan 作成で発生し得る。ADR 番号等でも同様

## 推奨Issue分類

- **分類**: enhancement
- **推奨ラベル**: enhancement, process, documentation
- **関連Issue**: Issue #803, case-run Momus review
