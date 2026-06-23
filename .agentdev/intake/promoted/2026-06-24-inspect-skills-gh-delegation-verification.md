# inspect-skills 検出辞書の agentdev-gh-cli 委譲後検証

## 観測内容

PR #1098（squash f5454154, Issue #1094 REQ-0149 agentdev-gh-cli 手続き委譲基盤, Epic #1093 Wave 1, 2026-06-23 merge）は 12 ファイル（command 5 件 + skill 7 件/8 ファイル）から `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)` の直接記述を除去し、`agentdev-gh-cli` 手続き呼び出しへ委譲した。委譲後は `agentdev-gh-cli/references/standard-procedures.md` のみが REQ-0149-003 で許容される既定実装として gh コマンド直接実行を保持する。

`agentdev-inspect-skills`（REQ-0125）の検出辞書が委譲後の各 command/skill で gh 直接記述を 0 件として検出するか、未検証のまま放置されている。出典: `inbox/2026-06-23-epic1093-wave1-inspect-skills-gh-delegation-detection.md`。

PR #1098 の完了条件では「検出辞書で 12 ファイル中の gh 直接記述が 0 件であることを確認」がテスト戦略に挙がっていたが、個別検証として本 intake に切り出された。REQ-0149-001/006/007 の完了条件マッピングは PR 本文で 8 項目すべて ✇ 済み。

## 影響

- 検出辞書の健全性未確定: 委譲漏れがあっても inspect-skills が検出できなければ、REQ-0149 の委譲完了性を自動で担保する手段がない。
- false negative リスク: 検出辞書が `agentdev-gh-cli/references/standard-procedures.md` を除外しない場合、既定実装の許容ファイルが毎回 finding として報告され、ノイズになる。
- Wave 2 (#1095 ローカル版 agentdev-gh-cli) への波及: Wave 2 実装は本委譲前提に直接依存するため、検出辞書の健全性を先に確定しておかないと Wave 2 完了後の再委譲検証が二度手間になる。

影響範囲は inspect-skills の信頼性と、REQ-0149 完了性の自動保証。利用者は inspect-skills を実行するメンテナと、Wave 2 以降で委譲パターンを踏襲する実装者。

## 課題

`agentdev-inspect-skills` の検出辞書が、PR #1098 後のリポジトリに対して「command/skill 配下で gh 直接記述 0 件」「`agentdev-gh-cli/references/standard-procedures.md` は許容ファイルとして除外」の両方を正しく判定することを検証する。

## 既存要件との関連

- REQ-0149（agentdev-gh-cli 手続き委譲基盤）: 委譲の完否を検証する検出手段を要求。-001/006/007 は PR 本文で達成済み。
- REQ-0149-003: `standard-procedures.md` を既定実装の許容ファイルとして位置づける。検出辞書の除外設定と対応する。
- REQ-0125（inspect-skills / Command/Skill 参照妥当性検出）: 検出コマンドの要件。検出辞書の実体と運用ルールを定める。
- ADR-0130（agentdev-gh-cli を差し替え可能な I/O 境界として確立）: 委譲を正当化する判断根拠。
- SPEC `docs/specs/skills/agentdev-gh-cli.md`: status draft。委譲先契約を定義（FILE 3 で別途扱う）。

不足: 検出辞書の実体（どのパスをスキャン対象とし、どのパスを除外するか）を文書化した SPEC が確認できていない。検証作業とあわせて辞書の正典化が必要。

## 整形の方向性

種別は verification（検証作業）。RU というより検証タスクだが、backlog-review を通すなら 1 RU として扱う。

想定する RU 働き:

- 実行: `/agentdev/inspect-skills` を本リポジトリ（agent-dev-flow）に対して実行し、12 委譲ファイル + その他 command/skill 配下で gh 直接記述が 0 件であることを確認。
- 除外確認: 検出辞書が `agentdev-gh-cli/references/standard-procedures.md` を許容ファイルとして正しく除外しているかを確認。除外ロジックが無ければ本 RU で追加。
- 文書化: 検出辞書のスキャン対象・除外対象を inspect-skills の SPEC または agentdev-gh-cli SPEC へ明記。
- 受入基準候補:
  - inspect-skills 実行結果で command/skill 配下の gh 直接記述が 0 件。
  - `standard-procedures.md` は finding に上がらない。
  - 検出辞書の対象・除外ルールが SPEC に記載され、将来の委譲でも再利用可能。
- 優先度目安: 中〜高。Wave 2 完了済みで後続委譲が進むなか、検出辞書の健全性は早めに確定したい。
- バンドル: 単独処理。FILE 3（agentdev-gh-cli SPEC 昇格）と主題が近いが、検証と文書昇格は作業の性質が違うため分割。
