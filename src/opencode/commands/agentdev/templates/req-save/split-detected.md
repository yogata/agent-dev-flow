⚠️ req-save 完了

完了コマンド: /agentdev/req-save
対象: REQ-{NNNN}（{CREATE/APPEND/UPDATE}）{ADR作成がある場合: / ADR-{NNNN}}
結果:
  - REQ-{NNNN} を docs/requirements/ に保存
  - {ADR作成がある場合: ADR-{NNNN} を docs/adr/ に作成}
  - ⚠️ SPLIT候補: REQ-{NNNN} の要件が膨張・関心分離の基準に該当。別Issueでの review/follow-up を推奨。
  - Finding を作成しました: `.agentdev/drafts/requirements-review-finding-{topic-slug}.md`
  - {docmap_status}
検証結果: ⚠️ 注意
git 永続化: commit: {hash}, push: {成功/失敗}
次のコマンド: finding ファイルを入力として `/agentdev/req-define` を実行してください
