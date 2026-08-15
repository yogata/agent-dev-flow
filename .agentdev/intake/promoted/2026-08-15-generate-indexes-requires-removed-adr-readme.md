# generate_indexes.ts が移行済み docs/adr/README.md を必須参照し dry-run 実行不能

## 観測内容

generate_indexes.ts が AG-008 用に docs/adr/README.md の AUTOGEN block 更新を必須処理としているが、docs/adr/ は DEC モデルへ移行済みであり baseline・main のいずれにも存在しないため、dry-run が実行不能になっている。

## 影響

- case-close の project extension check が dry-run 実行不能
- docs 変更を伴う以降の Wave で同 check が使えないままになる
- AUTOGEN 再生成（別 item 群）の前提障害になる

## 課題

ADR README 更新処理を docs/decisions/README.md へ更新するか、対象ファイル不存在時はスキップする構成へ変更する。

## 既存要件・成果物との関連

- 対象: repo-agentdev-integrity scripts/generate_indexes.ts
- 関連: AG-008、DEC-009（ADR→Decision 移行）、AUTOGEN 陳腐化系 promoted items（本項が前提障害）

## 出典

- 発生日: 2026-08-14
- 取得元: case-close project extension check 実行時の観測
- 元 item: intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md
