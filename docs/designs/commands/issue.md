---
title: issue Design
status: accepted
created: 2026-08-23
updated: 2026-08-25
---
<!-- ADF-COVERS(implementation): REQ-049-004, REQ-049-005, REQ-049-009, REQ-049-010, REQ-049-011, REQ-049-015, REQ-049-016 -->

# issue Design

`/agentdev/issue` command Design。

- 公開入口としての責務: GitHub 追跡Issueの自然言語操作入口。起票、検索・参照、更新、コメント追加、保留、再評価、実行準備完了、解決、反映確認、クローズ、再オープンを、自然言語入力と会話文脈（対象追跡Issue、現在状態）から判断して実行する。
- ユーザーにサブコマンド、ラベル名、Issue Type、Field 名等の GitHub 実装詳細の把握を要求しない。内部実装で明示的な操作種別を持つことは禁止しない。
- Workflow Skill への委譲構造（Command / Workflow Skill / Capability Skill 責務分離に従う）。追跡Issueの論理スキーマは agentdev-issue-tracking Design が一元管理し、本 command は再定義しない。
- 編集スコープのガードレール: 追跡Issue操作は Tool 操作契約経由に限定する。GitHub 版ではリポジトリ内に課題ファイルを作成・commit しない。
- 課題化判定の実行位置: 現在の作業で解決できず将来に影響する未解決事項の候補判定、正規成果物確認による事前解決の試行、重複起票防止のための既存追跡Issue検索。ユーザー合意が必要な設計判断を課題管理側だけで確定しない。
- 実行許可の境界: 追跡Issueの存在自体を Agent の実行許可としない。実行が確定した場合は req-define 等の正規要件化・設計経路への引き継ぎを行い、Case Issue の生成は case-open へ委ねる。追跡Issueを実行票へ直接変質させない。
- 共通能力としての公開: 本 command の明示実行を利用必須とせず、他 workflow から追跡Issue操作能力を利用できる。各 workflow は追跡Issueスキーマや GitHub I/O を再実装しない。
