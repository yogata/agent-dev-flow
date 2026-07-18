# agentdev-gh-cli 手続き拡張（PR 変更ファイル一覧 / mergeable 状態取得）

## 観測内容
- case-close.md の委譲表現化（OU-002）に伴い、以下2手続きが `agentdev-gh-cli` SKILL.md で未定義のまま
  - PR 変更ファイル一覧取得
  - PR mergeable 状態取得

## 影響
- REQ-0152-003 の要件「PR 状態取得処理は agentdev-gh-cli への委譲表現」が、委譲先手続き未定義により不完全な状態

## 課題
- `agentdev-gh-cli` SKILL.md に上記2手続きを追加する
- `references/contracts.md`, `references/standard-procedures.md` にも整合する形で追記する

## 既存要件との関連
- REQ-0152-003: PR 状態取得処理は agentdev-gh-cli への委譲表現
- REQ-0149

## 対応方針の方向性
- 各手続きの入力・出力・事後条件を定義
- standard-procedures.md に具体的手順を追記
- contracts.md に契約上の位置づけを追記
- 追記後に case-close.md からの委譲表現が手続きに到達できることを確認

## 出典
- 元 intake item: intake-2026-07-15-1517-gh-cli-procedures.md
