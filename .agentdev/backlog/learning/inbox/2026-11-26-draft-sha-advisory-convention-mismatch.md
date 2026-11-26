---
id: 2026-11-26-draft-sha-advisory-convention-mismatch
created_at: 2026-11-26T22:50:00+09:00
source: case-open (Root Case #4227 機械工程の sha advisory 交差確認)
status: unreviewed
---

# draft の sha advisory は計算基準が生成側と異なり、sha 非一致だけでは corpus drift 判定ができない

- **問題事象**: Root Case #4227 の case-open 機械工程で draft 付帯の sha advisory と適用後内容の交差確認を取ったところ、編集対象 33 件中 12 件のみ sha 一致、適用先ファイル 33 件中 0 件一致。sha 非一致を drift と解釈すれば corpus drift 疑いとなるが、実際は内容の欠損・破損はなかった
- **発生局面**: 実装（case-open 機械工程、2026-11-26）
- **検知方法**: draft の sha advisory と builder 適用結果（build-report.json）の sha 交差確認
- **根本原因**: draft 生成側（req-define producer）と適用側で sha の計算基準（対象文字列・正規化）が異なる。advisory は合致を保証しない参考値であり、検証根拠として設計されていない
- **自律対応内容**: sha 一致を検証根拠とせず、builder --verify（byte-exact 比対）18/18 合格により適用の正確性を確定した。corpus drift ではないと判定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（検証手段の選択に関する運用知見であり、正規成果物への変更なし）
- **横展開観点**: sha advisory を使う交差確認は参考に留め、適用の正否は byte-exact 突合（verbatim 包含）で判定する。draft 由来の sha 値を正とした差分報告を行わない
- **再発条件**: draft 付帯の sha advisory を検証根拠に使う場合に毎回
- **予防策候補**: case-open 機械工程の参照文書へ「sha advisory は参考値。適用検証は byte-exact 突合が正規」である旨の注記
- **想定反映先**: agentdev-workflow-case-open references（機械工程の検証手順記述）
- **関連**: .agentdev/drafts/req-draft-new-host-full-workflows-and-consumer-host-selection.md、Root Case #4227、PR #4228
- **タグ**: `#case-open` `#sha` `#verification`
