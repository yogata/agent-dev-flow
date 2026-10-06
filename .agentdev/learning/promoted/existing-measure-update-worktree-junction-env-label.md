# worktree 実行の checker・gate に環境ラベルと src/common パス規律を明示する

## 背景

worktree の `.opencode` は junction 伝播が不完全で（repo-agentdev-integrity のみ等）、checker・テストの走査対象集合と実行可能 script 集合が main root と異なる。Case 3494 では bun test plugins 分割が worktree 293 pass / main 相当 643 pass に乖離し、check_extensions の project-local skill 参照 warning 7 件が worktree 実行でだけ検出された（main root 対照実行で環境差と分類）。Case 3500 では prepare_definition_pr 入力 JSON の gate コマンドに `.opencode/skills/agentdev-traceability/scripts/src/check.ts` を指定して worktree 内で Module not found となった（src/common 同等パス + `--root` 指定で解消）。

## 問題

worktree 実行時の checker 実行記録に走査 root・junction 伝播状態の環境ラベルが必須でなく、件数乖離時に main root 対照実行で「環境差か本変更起因か」を分類する手順が checker 実行契約に規定されていない。また worktree で実行する機械工程の gate コマンドについて、script 本体パスは `.opencode` 投影に依存しない git 管理対象（src/common 同等）パスを指定し、`--root` 等で検査対象 root を分離する規律が入力 JSON 組立手順に明示されていない。

## 望ましい変更

checker 実行契約 Design へ (1) 実行記録への環境ラベル（走査 root・junction 伝播状態）必須化と件数乖離時の main root 対照実行分類、(2) bun test 分割ごとの実行 root 明示を規定する。case-open の機械工程手順へ (3) gate コマンドのパス規律（script 本体は src/common 同等パス・検査対象 root は `--root` 指定）を前置する。

## 対象範囲

### 対象

- `docs/designs/integrity/checker-execution-contracts.md`（link profile 実効実行要件節の拡張）
- `src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md`（機械工程の script 呼び出し手順）
- `src/common/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md`（checker 実行記録の環境ラベル）

### 対象外

- junction・link profile の構造設計（agentdev-git-worktree-test-fallback Design が所有、現行どおり）
- 各 checker の検出基準

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| Design | docs/designs/integrity/checker-execution-contracts.md | 環境ラベル必須化・対照実行分類・実行 root 明示の規定 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-open/references/definition-pr-and-idempotency.md | gate パス規律（src/common 同等パス + --root 分離）の前置 |
| 配布skill reference | src/common/skills/agentdev-workflow-case-close/references/docs-and-design-promotion.md | checker 実行記録への環境ラベル記載 |

## 既存対策確認

- **確認結果**: 既存対策あり（部分）
- **該当ファイル**: checker 実行契約 Design（link profile 実行条件: main root 実行・環境ラベル）、scripts README の fallback 手順
- **ギャップ分類**: fix gap
- **ギャップ詳細**: link profile の実行条件規約が他 checker・bun test 分割・gate パスへ拡張されていない。fallback 手順が入力 JSON 組立時の確認事項になっていない

## 制約

- worktree junction 構造の変更は対象外（既知 Design のとおり）
- repo-agentdev-integrity scripts は worktree 投影でも動作するため、規律は skill 種別によらないパス分離原則として定める

## 受け入れ条件

- [ ] checker 実行契約 Design に環境ラベル必須化と対照実行分類が規定される
- [ ] case-open 機械工程手順に gate パス規律が明記される

## 元learning item / 根拠

- **要約**: worktree junction 部分伝播による checker 走査集合・gate script パスの実行環境差を、環境ラベル・対照実行・src/common パス指定で管理する（2件）
- **根拠**: Case 3494・PR 3496（bun test 293→643 件数乖離、check_extensions warning 7件の環境差分類）、Case 3500・PR 3502（traceability gate の Module not found→src/common パスで解消）
- **再発条件**: worktree root で .opencode 配下を走査する checker・テスト実行、worktree 投影外 skill の scripts を gate 指定する機械工程（case-run/case-close の常態）
- **横展開可能性**: git worktree を利用するプロジェクト一般で発生し得る

## 推奨Issue分類

- **分類**: docs
- **推奨ラベル**: documentation
- **関連Issue**: なし
