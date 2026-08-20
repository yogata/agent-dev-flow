# node:fs glob 移行の実装約束の checker-execution-contracts Design への補完（ドット名列挙上限・エラー伝播・辞書順 sort）

## 観測
PR 2357（node:fs glob 移行）の実装と審議で確定した実装約束。docs/designs/integrity/checker-execution-contracts.md「再帰ファイル探索と CLI 引数解析の標準API移行」節への追記候補。

- (a) ドット名ディレクトリ・ドットファイルの列挙範囲の明文化: node:fs glob（Bun 1.3.10 実装）のワイルドカードはドット始まりパス要素を列挙できない。本実装は「明示的な走査ルート（ドット名ルートの直指定を含む）とルート直下の隠しディレクトリの網羅」までを網羅範囲としており、それより深い位置のドット名要素は列挙不能という上限を持つ（本リポジトリの走査対象ツリーに該当は存在しない）
- (b) 列挙エラー伝播方針の明文化: ENOENT は空、それ以外の走査エラーは伝播（旧 repo-local 実装の挙動に一致。部分走査の黙り込み排除）
- (c) 列挙順の契約化: 正規化後パスの辞書順 sort を列挙契約として明記（NTFS の readdir 順は大文字小文字を区別しないたずれにより辞書順と異なり得る。本ケースでは全 checker 出力が移行前と完全一致することを確認済み）

## 今回扱わない理由
PR 2357 のスコープは実装移行と外部契約維持であり、Design 本文への契約追記は含まれていない。Wave 1 の PR 2356 類似候補（2026-08-20-bun-parseargs-design-complement.md）と同一の処理パターン (c) 見送り・後続委譲とする。実装・回帰テストは PR 2357 で固定済みで機能影響なし。Design 修正は design-save パイプライン（intake-promote、backlog-review を経た RU 化）経由が正規手順。

## 影響
約束が Design に正規記載されない限り、後続の node:fs glob 利用実装でドット名列挙上限・エラー伝播・sort 契約の踏み抜きが再発生する可能性がある。現行実装は globWalkRel / enumerateFilesRel 共通ヘルパーに集約済み。

## レビューで決めること
- checker-execution-contracts Design「再帰ファイル探索と CLI 引数解析の標準API移行」節へ (a)(b)(c) を実装約束として追記するか（bun-parseargs 補完候補と同一節のため、統合 RU 化も候補）

## 根拠
- PR 2357 本文「Design確定候補」1〜3（回収元: https://github.com/yogata/agent-dev-flow/pull/2357）
