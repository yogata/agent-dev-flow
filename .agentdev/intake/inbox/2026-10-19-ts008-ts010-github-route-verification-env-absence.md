# TS-008/TS-010 GitHub 版隔離検証環境の正規構築手段の不在の恒久化

- 出所: Epic #3803（PR #3811 Findings 第1項、PR #3812 intake〔再現・拡張〕）case-close Capture 回収（DEL-3803-CLOSE）
- 種別: 検証環境の育成候補（人間判断待ちを含む）
- 事実: gh-write guard（agentdev-gh-write-guard）は raw gh WRITE を cwd 非依存でコマンド文字列検査により fail-closed 拒否する（PR #3812 検証差分 #15 でプロジェクト内・外の両 cwd で拒否を再現）。agentdev_gh 操作カタログには repo create 操作が不在。既存の隔離検証リポジトリは不在（gh repo list 読取で一致 0 件）。正規手段での検証リポジトリ構築が不可のため、TS-008（AC8）と TS-010（AC10・AC1/AC3 移管分）の GitHub 版正規利用経路の実操作検証は実施不能となり、Epic #3803 の該当部分は blocked として記録された（Local 版部分は pass、代替の構造的等価性は「同等以上の証明能力を持つ代替」とは認めない〔RA-005 判断〕）
- 提案: GitHub 版検証リポジトリ構築を guard 対象外の正規手段として整備する候補（専用検証入口の追加、または管理者事前準備の隔離検証 repo の常備）。整備されるまで TS-008/TS-010 の GitHub 版部分は継続して blocked となる。人間が判断する
- 対象: agentdev_gh 操作カタログ、REQ-111（TS-008・AC8）、REQ-110（TS-010・AC10）
- 関連: 既存 intake item `2026-10-17-ts007-github-path-verification-environment.md`（Case #3779 由来・TS-007 の同一根本原因の先行例。重複統合候補。統合判断は intake-promote 側の責務）
