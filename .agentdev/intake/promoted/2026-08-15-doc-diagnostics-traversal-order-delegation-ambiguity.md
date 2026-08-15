# agentdev-doc-diagnostics「探索順」委譲先表記と再定義の不一致

## 観測内容

agentdev-doc-diagnostics の SKILL.md 本文（L10/L47/L85）には削除済み agentdev-doc-map への委譲先表記が残る一方、L60 は README 群が探索順序の詳細を担うと再定義しており、委譲先表記との間に残余曖昧さがある。

## 影響

- 読む agent が存在しないスキル（agentdev-doc-map）へ誘導される可能性がある
- 探索順の正規情報源が文書内で二重に定義された状態になっている

## 課題

L60 の再定義（README 群が探索順序を担う）に整合するよう、L10/L47/L85 の委譲先表記を統一する。

## 既存要件・成果物との関連

- 対象: agentdev-doc-diagnostics SKILL.md（L10/L47/L85、L60）
- 関連: agentdev-doc-map 削除（REQ-013 段階4a）

## 出典

- 発生日: 2026-08-15
- 取得元: inspect 系診断・観測
- 元 item: intake-2026-08-15-doc-diagnostics-traversal-order-delegation-ambiguity.md
