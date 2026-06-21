⚠️ case-update 完了

完了コマンド:/agentdev/case-update
対象: Issue #{N}
結果:
 - レビューNG報告を投稿（--review-ng）
 - 乖離タイプ: {spec-bug/ impl-bug/ scope-creep}
 - 影響REQ番号: {REQ番号のリスト}
 - 推奨アクション: {修正/ 承認/ 差し戻し}
検証結果: ⚠️ 注意
git 永続化: 該当なし
次のコマンド:
 - 修正の場合:/agentdev/case-run {N}
 - 差し戻しの場合:/agentdev/req-define


