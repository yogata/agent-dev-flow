# Epic Wave実行における検証中心Issue/実装中心Issueの明示的区別

## 背景

Epic #990（文書体系再構築、10 OUs / 5 Waves）の実行を通じて、「前工程（req-save/spec-save）で実施済み」を前提とする検証中心 Issue と、実装を伴う Issue の区別が平坦でなかった。Wave 4 #998 で acceptance criteria 順位検証により8件の残余 violation を発見し補完実装したが、draft 段階では「検証のみ」か「補完あり得る」かが事後的にしか分からなかった。この区別が sub-agent のスコープ違反（二重実装）リスクを招く。

## 問題

- draft 段階で各 OU に「前工程完了度」の3段階分類（完全完了/検証のみ/補完あり）が付与されていない
- case-open で子 Issue 本文に当該属性が埋め込まれていない
- sub-agent 起動プロンプトで当該属性に応じた振る舞い（検証のみの場合でも acceptance criteria 順位検証は必須等）が明示されていない

## 望ましい変更

1. draft 段階で各 OU に「前工程完了度: 完全完了 / 検証のみ / 補完あり」属性を付与
2. case-open で子 Issue 本文に当該属性を埋め込む
3. sub-agent 起動プロンプトで当該属性に応じた振る舞いを明示

## 対象範囲

### 対象
- `docs/specs/workflows/epic-wave-model.md`（OU 属性分類の定義）
- `src/opencode/commands/agentdev/case-open.md`（子 Issue 本文への属性埋め込み）
- `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md`（sub-agent 起動プロンプトテンプレート）

### 対象外
- 既存の Issue 状態 enum（pending/ready/running/completed/blocked/failed）の変更
- case-run の実行フロー自体の変更
- req-define の draft 生成フローの変更（属性付与は case-open で処理）

## 反映先候補

| 種別 | パス | 変更内容 |
|------|------|----------|
| spec | `docs/specs/workflows/epic-wave-model.md` | OU 属性「前工程完了度: 完全完了/検証のみ/補完あり」の3段階分類を定義 |
| command | `src/opencode/commands/agentdev/case-open.md` | 子 Issue 本文に「前工程完了度」属性を埋め込む手順を追加 |
| skill | `src/opencode/skills/agentdev-workflow-orchestration/references/subagent-protocol.md` | sub-agent 起動プロンプトで「前工程完了度」に応じた振る舞い（検証のみの場合でも acceptance criteria 順位検証は必須等）を明示 |

## 既存対策確認

- **確認結果**: あり（間接的）
- **該当ファイル**: `docs/specs/workflows/epic-wave-model.md`（Issue 状態 enum L47-61: pending/ready/running/completed/blocked/failed）
- **ギャップ分類**: guardrail insufficiency
- **ギャップ詳細**: Issue 状態 enum で実行状態（running/completed）は区別済みだが、「検証中心 Issue」vs「実装中心 Issue」vs「補完実装を許容する検証中心 Issue」の明示的区別は未定義。draft 段階での「前工程完了度」属性も未整備。

## 制約

- 既存の Issue 状態 enum は維持（新属性は直交する分類として追加）
- case-open の既存フロー（draft→Issue 本文生成）は維持し、属性埋め込みを追加
- sub-agent のスコープ制御ルール（MUST NOT DO 等）は維持

## 受け入れ条件

- [ ] epic-wave-model.md に「前工程完了度: 完全完了/検証のみ/補完あり」の3段階分類が定義されている
- [ ] case-open で子 Issue 本文に当該属性が埋め込まれる手順が追加されている
- [ ] subagent-protocol.md に当該属性に応じた振る舞い指針が明示されている

## 元learning item / 根拠

- **要約**: Epic #990 実行で「前工程完了済み」OU と「未処理」OU の区別が平坦で、sub-agent の二重実装・スコープ違反リスクを招いた
- **根拠**: Epic #990 の10 OUs 中6 OUs が検証中心 Issue だった。Wave 4 #998 で残余 violation 8件を発見し補完したが、draft 段階では「検証のみ」か「補完あり」かが事後的にしか分からなかった。
- **再発条件**: (1) req-save/spec-save 前工程を持つ大規模 Epic を case-auto で実行 (2)「前工程完了済み」OU と「未処理」OU が混在 (3) sub-agent が「完了済み」を過信して acceptance criteria 順位検証を省略
- **横展開可能性**: 高。大規模 Epic（req-save/spec-save 前工程あり）を組む際に毎回潜在する

## 推奨Issue分類

- **分類**: feature
- **推奨ラベル**: enhancement, documentation
- **関連Issue**: Epic #990 全 OUs（#991〜#1000）, Wave 1〜5 実行, PR #1009 (Wave 4 #998 残余 violation 発見時)
