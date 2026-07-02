# `.opencode/skills/` 配下の「参照されているが未トラック」スキル棚卸し

## 観測

PR #1332 で `japanese-tech-writing` スキルを新規トラック化した。当スキルは AGENTS.md から「執筆規範」として参照され、agentdev-doc-writing SPEC（REQ-0140-023）でも原本 SSoT として位置づけられていたが、`.gitignore` の `.opencode/skills/*` 除外パターンにより長期間未トラック状態（ローカル存在のみ）にあった。新規 clone 環境ではスキルが存在しない状態になり、配布・共有対象の執筆規範が再現性を持たなかった。

## 今回扱わなかった理由

PR #1332 のスコープは当該スキルのトラック化と USE FOR/DO NOT USE FOR 補完（AG-001/002）に限定し、他スキルの同種事象調査は実施していない。`.opencode/skills/` 配下全体の「参照されているが未トラック」スキル有無の棚卸しは別作業として分割が妥当。

## 根拠

PR #1332 Findings / Capture候補:

> **japanese-tech-writing が長期間 git 未トラックで存在していた事象**: 当スキルは AGENTS.md から「執筆規範」として参照され、agentdev-doc-writing SPEC（REQ-0140-023）でも原本として位置づけられていたが、`.gitignore` の `.opencode/skills/*` 除外パターンにより未トラック状態（ローカル存在のみ）が放置されていた。新規 clone ではスキルが存在しない状態になるため、本来配布・共有対象の執筆規範が再現性を持たなかった。本 PR で `.gitignore` を更新しトラック対象化した。同様の「参照されているが未トラック」スキルが他に無いか、`.opencode/skills/` 配下の棚卸しが推奨される。

AGENTS.md 参照:

> Skills provide specialized instructions... japanese-tech-writing: 日本語の技術文書・書籍原稿の文章規範...

## 候補作業

- `.opencode/skills/` 配下の全ディレクトリを走査し、git トラック状況（`git ls-files` との突合）と AGENTS.md/SPEC からの参照有無を突き合わせる
- 参照されているにもかかわらず未トラックのスキルがあれば、`.gitignore` のホワイトリスト追加または src 昇格を個別に判定する
- `repo-*` 系スキル（既存ホワイトリスト）と同様の pattern review も併施する
