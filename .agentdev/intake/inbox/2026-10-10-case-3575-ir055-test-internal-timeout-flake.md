# check_integrity.test.ts の test 内部 timeout（60 秒）ハードコードが環境性能依存の flake を生む

## 内容

check_integrity.test.ts の一部 test（IR-055 配布物全走査等）が test 内部 timeout（60 秒）をハードコードし、配布物走査に 60〜80 秒を要す環境では suite 実行が環境性能依存の flake となる。Epic #3575 Wave-1 の検証で PR #3582 の bun test suite ① が 2740 pass・1 fail（IR-055 配布物全走査 test の test 内部 timeout 60s 打ち切り）を記録し、--timeout 300000 再実行で 189 pass・0 fail を確認した。main root 実体でも別 test で同種 timeout が発生（184 pass・5 fail）。PR #3583 でも同種の初回 timeout（2741 pass / 1 fail）を記録し、対象ファイル退避比較・時間序列再計測で環境起因（AV deep scan 相当）と切り分け後に再実行 2742 pass・0 fail を確認した。

## 影響

bun test suite ①（integrity scripts）の実行が環境性能依存で flake 化し、PR 検証で fail が不当に検出される。検証工程ごとに fail の由来分類（環境依存 vs 変更起因）の切り分け判断（退避比較・再計測・再実行）が発生し、証跡記録の労力と誤判定リスクが残る。

## 提案

test 内部 timeout の環境許容範囲の見直し。案1: test 内部 timeout 値の引き上げ（60s → 環境許容値）。案2: test 内部 timeout の廃止と suite 実行時 --timeout 指定への統一。案3: 配布物全走査系 test の timeout に実行環境の余裕を持たせた専用値を設定。機構変更は本 Case の実行単位では行っておらず、後続の変更候補として記録する。

## 根拠

PR #3582（Issue #3578）・PR #3583（Issue #3579）の検証差分セクション（IR-055 timeout flake の由来分類: 環境依存・当該変更起因 0、--timeout 300000 再実行 pass 実測、main root 実体でも同種 timeout 再現）。

https://github.com/yogata/agent-dev-flow/pull/3582
