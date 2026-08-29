---
title: third-party Skill 管理 Design
status: draft
created: 2026-08-30
updated: 2026-08-30
---

# third-party Skill 管理 Design

## 目的

third-party Skill の宣言と取得機構の正規仕様。
REQ-002-042 から REQ-002-044、REQ-029-009、REQ-052-011 の Design が所有する詳細。

## 宣言ファイル（skills.yaml）

- 配置: src/third-party/skills.yaml。配布成果物種別ではない宣言ファイル
  （case-schema/ 先行例と同様の位置づけ）
- スキーマ: name（kebab-case、agentdev-・repo- 接頭辞拒否）と source。
  revision 項目なし、取得形式を表す type 項目なし。版固定は source URL で表現する
- source 形式判定: 末尾が SKILL.md の URL は単一ファイル型、
  GitHub リポジトリ内 Skill ディレクトリ URL はディレクトリ型

## 取得プロファイル

- 単一ファイル型: .opencode/skills/<name>/SKILL.md へ正規化
- ディレクトリ型: Skill ディレクトリ配下を再帰取得し相対構造を保持。
  Skill ディレクトリ外のファイルは取得しない

## 非破壊性と上書き保護

- 取得失敗時に開始前状態を維持する
- 機構管理外（repo-*、agentdev-、宣言に由来しない同名配置）の無断上書き禁止

## 個別特例統合

- agentdev-doc-writing が参照点である該当 Skill の skills.yaml 宣言と機構経由再取得
- gitignore 特例・doc-writing 以外の特例参照の除去（scripts、README、guide、docs 設計系）
- source URL は宣言データとして運用者が登録する

## release archive 検証

- skills.yaml の archive 収録要否を package-release-archive.ps1 の投影範囲で検証する
  （収録除外時は archive 提供 consumer 環境での取得手段を明記する）

## 参照点集約

- 各 third-party Skill の参照点を宣言運用として管理する（機械検査対象外、IR-058 は
  宣言済み判定までを担当）

## Design で確定する実装判断

- source URL 形式判定規則: GitHub blob/raw/tree URL 等の変種の扱いを確定する
- 取得トランスポート: git 依存の有無、REQ-009-048 の ZIP 展開環境を含む
  git-less 環境での動作を確定する
- 管理対象 Skill の判別方法: skills.yaml 宣言集合と予約接頭辞からの決定論的判定、
  provenance 履歴の要否を確定する
