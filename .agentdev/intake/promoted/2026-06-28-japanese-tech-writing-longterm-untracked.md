# `.opencode/skills/` 配下の「参照されているが未トラック」スキル棚卸し

## 観測内容

PR #1332 で `japanese-tech-writing` スキルを新規トラック化した。当スキルは AGENTS.md から「執筆規範」として参照され、agentdev-doc-writing SPEC（REQ-0140-023）でも原本 SSoT として位置づけられていたが、`.gitignore` の `.opencode/skills/*` 除外パターンにより長期間未トラック状態（ローカル存在のみ）にあった。新規 clone 環境ではスキルが存在しない状態になり、配布・共有対象の執筆規範が再現性を持たなかった。

## 影響

- 新規 clone 環境でスキルが存在しなくなる
- 配布・共有対象の執筆規範が再現性を持たない

## 課題

- `.opencode/skills/` 配下の全ディレクトリを走査し、git トラック状況（`git ls-files` との突合）と AGENTS.md/SPEC からの参照有無を突き合わせる
- 参照されているにもかかわらず未トラックのスキルがあれば、`.gitignore` のホワイトリスト追加または src 昇格を個別に判定する
- `repo-*` 系スキル（既存ホワイトリスト）と同様の pattern review も併施する

## 既存要件との関連

- REQ-0140-023: agentdev-doc-writing SPEC が `japanese-tech-writing` を原本 SSoT として参照

## 観測元

- PR #1332
