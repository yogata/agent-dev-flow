# agentdev-traceability 実行の引数・走査対象の暗黙前提の解消

## 背景

agentdev-traceability の check / coverage 実行時の引数仕様と走査対象の前提を確認せずに実行し、誤計上・手戻りを生ぐ事象が 3 観測されている。case-close のトレーサビリティ独立再検査（QG-4）で毎回利用する経路であり、再発頻度が高い。

## 問題

- check.ts の --req に範囲構文（REQ-011-022..030 形式）を渡すと、範囲文字列全体がリテラル reqId として報告される（`..` 形式を範囲展開しない）。個別カンマ指定では正しく解決される
- worktree で scripts ディレクトリを cwd に起動した場合、--root の `.` が cwd 相対で解決され、ADF-COVERS 宣言 corpus が走査対象から外れる
- corpus の走査対象は .md と .ts のみで .agentdev/ は除外ディレクトリであり、それ以外の拡張子・除外パスへの宣言配置は計上されない

## 望ましい変更

- agentdev-traceability の check 呼出手順に、以下の実行前提を集約する: --req は個別カンマ指定で渡す（範囲形式は使わない）、worktree 環境では --root に worktree root を明示指定する、対応宣言は scan 対象拡張子（.md / .ts）かつ非除外パスへ配置する
- --req の範囲展開対応は agentdev-traceability 実装側の改善候補として記録する

## 対象範囲

### 対象

- agentdev-traceability Capability Skill の check / coverage 呼出手順
- case-close・case-run から check を実行する手順参照

### 対象外

- agentdev-traceability の実装改修そのもの（改善候補の記録まで。実施は個別判断）
- traceability Design の対応宣言表記仕様

## 反映先候補

learning-promote は実現先を確定しない。以下は req-define の変更影響分析・実現方法決定に参照される情報候補である。

| 種別 | パス | 変更内容 |
|------|------|----------|
| 配布skill | .opencode/skills/agentdev-traceability/SKILL.md または references（check 呼出手順節） | 個別カンマ指定・--root 明示・宣言配置先の実行前提注記 |
| Design | agentdev-traceability の Design（scripts README・実行例節） | worktree 環境での --root 明示指定の運用注記 |
| 配布skill | agentdev-workflow-case-close / agentdev-workflow-case-run（traceability 独立再検査手順） | --req 個別指定の明記 |

## 既存対策確認

- **確認結果**: 既存対策なし
- **該当ファイル**: なし（scripts README に基本実行例のみで、上記前提の注記なし）
- **ギャップ分類**: fix gap
- **ギャップ詳細**: 引数仕様・cwd・走査対象の前提がスキル手順・README のいずれにも明記されていない

## 制約

- 実装改善（--req 範囲展開）を採用するかは req-define 以降の判断であり、本成果物は手順注記の情報候補を提供する

## 受け入れ条件

- [ ] check 呼出手順に --req 個別カンマ指定（範囲形式不使用）が明記される
- [ ] worktree 環境での --root 明示指定が実行例に追記される
- [ ] 宣言配置可能な拡張子・パスの前提が手順に明記される

## 元learning item / 根拠

- **要約**: agentdev-traceability 実行時の引数・cwd・走査対象の暗黙前提による誤実行・誤計上 3 観測
- **根拠**: PR #2691（--req 範囲構文のリテラル報告）ほか deferred 2件（worktree --root・scan 対象拡張子）
- **再発条件**: case-close 独立再検査・coverage 実行で引数・cwd・対象を暗黙仮定する場合
- **横展開可能性**: agentdev-traceability を利用する全 workflow

## 推奨Issue分類

- **分類**: docs_chore（スキル手順への注記集約。実装修正を含む場合は maintenance）
- **推奨ラベル**: documentation
- **関連Issue**: なし
