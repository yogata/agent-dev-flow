# intake: TS-011 用語横断掃除と語彙レジストリ登録の未実施（Case #3316 Epic クローズ時の分離）

## 分類

採用（backlog-review へ引き渡す変更候補）

## 観測内容

1. **TS-011 用語横断掃除は子 Issue 完了条件範囲外として未実施**: Epic 完了条件の TS-011 文言は「旧パス参照 0件・参照行を除く」に限定されており、Epic コメント（issuecomment-5949254117）で確定した用語掃除スコープは含まれない。Epic QG-4 最終判定（E5-1・2026-10-02）で完了条件外と判定し、後続改善として分離した（Epic クローズは阻害しない）
2. **語彙レジストリへの複合語正規登録が未実施**: 「本質的争点」「本質的な指摘事項」の複合語（165箇所）は契約用語として語彙レジストリ（docs/designs/authoring/vocabulary-registry.md）へ登録する方針が user 合意済み（issuecomment-5949254117）。登録は掃除完了後、user 承認済み方針として実施する
3. **掃除スコープの確定値**: 「正本」→原本（glossary 定義語。308箇所/139ファイル実測）、低リスク31語（解像度・肌感・温度感・営み・装置 等、各1〜5箇所）→文脈確認のうえ中立的表現、「本質的」単独用法（48箇所）→文脈に応じ中立化。各 touched-file の yomiyasu lint 再実行で WARN 消滅を確認する（issuecomment-5949202581 対応方針）

## 影響・課題

- 語彙の陳腐化（旧判断モデル由来・比喩的表現）が corpus 全体に残存し、文書品質基盤（textlint・yomiyasu）の指摘が恒常化している
- 複合語の契約用語としての正規登録が未実施のまま

## 既存要件・成果物との関連

- docs/designs/authoring/vocabulary-registry.md（語彙レジストリ。REQ-002 語彙管理の3層分担）
- glossary.md（「原本」定義語）
- yomiyasu lint・textlint 共通基盤（WARN 消滅確認手段）
- adversarial-review Design（「本質的争点」等の判定カテゴリ名の所有者）

## 対応候補

- corpus 全体の用語横断掃除（上記確定スコープ。Wave 3 TS-011 横断掃除の枠組みを後続実行として引き継ぐ）
- vocabulary-registry.md への「本質的争点」「本質的な指摘事項」複合語の正規登録（user 承認済み方針の実行）

## 元 item

- 観測元: Epic #3316（REQ-099 マルチホスト併存 実現面実行）コメント issuecomment-5949254117（user 合意済み方針）と Wave 3 case-close 対応記録 issuecomment-5954815097「残課題の通知」
- 記録日: 2026-10-02
