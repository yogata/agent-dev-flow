# SPEC確定候補: resolver 状態機械の二層実装構成の正規化

## 観測内容

runtime と決定的検証で Extension 読込状態機械を共有実装する二層構成が実現済みだが、「runtime は LLM 手続き、機械検証は checker」という責務分離としての正規化が SPEC 上に明文化されていない。二層構成の意図が SPEC にないため、将来の再実装・分割時に単一実装の共有構成が暗黙前提として失われる恐れがある。

## 影響

- 将来の再実装時に共有実装構成が暗黙前提から失われ得る
- 責務分離の設計意図が文書化されず伝達されない

## 課題

二層実装構成を project-extensions 関連 SPEC へ正規化する。SPEC 内容追加を伴うため case-close スコープ外と見送り記録済み。選定は backlog-review で判断する。

## 既存要件・成果物との関連

- 対象: agentdev-project-extensions SKILL.md、check_extensions.ts、project-extensions 関連 SPEC
- 関連: SPEC 確定候補群、Epic #2099

## 出典

- 発生日: 2026-08-15
- 取得元: case-close 見送り記録（SPEC確定候補）
- 元 item: intake-2026-08-15-spec-candidate-resolver-state-machine-two-layer.md
- 注記: intake-promote 経路C review で採用。現状の文書化状態は backlog-review 分析時に再確認すること
