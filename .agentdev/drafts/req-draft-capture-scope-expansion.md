---
draft_type: req_draft
topic_slug: capture-scope-expansion
status: saved
spec_actions_consumed: true
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0009
agentdev_handoff: true
---

<!-- 譛ｬ繝峨Λ繝輔ヨ縺ｯ AgentDevFlow 譛ｬ菴薙・荳榊・蜷医・謾ｹ蝟・せ繧呈桶縺・燕蟾･遞句ｼ輔″邯吶℃繝峨Λ繝輔ヨ縺ｧ縺ゅｋ・・gentdev_handoff: true・峨・-->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  蟾･遞区ｨｪ譁ｭ縺ｮ capture 蠅・阜繧呈僑蠑ｵ縺励〉eq-save/spec-save/case-open/case-close 縺ｮ蜷・ｮ御ｺ・ｱ蜻翫↓蜷ｫ縺ｾ繧後ｋ
  deviation 縺・intake/learning pipeline 縺ｸ豬∝・縺吶ｋ邨瑚ｷｯ繧呈ｭ｣隕丞喧縺吶ｋ縲ょ推蟾･遞句・謨｣蝙九ｒ謗｡逕ｨ縺励・  command 縺ｯ Command竊担kill 萓晏ｭ俶婿蜷代ｒ驕ｵ螳医＠縺ｦ agentdev-learning-capture skill 縺ｾ縺溘・
  agentdev-intake-pipeline・郁・蜍苗apture蜷代￠ item 逕滓・謫堺ｽ懊ｒ霑ｽ蜉・峨∈蟋碑ｭｲ縲“it 豌ｸ邯壼喧縺ｯ蜻ｼ蜃ｺ蜈・command 諡・ｽ薙・  case-run/case-close 迴ｾ陦・PR Findings 邨檎罰縺ｯ邯ｭ謖√…ase-auto 縺ｯ蜷・ｷ･遞九・菫晏ｭ倡ｵ先棡蜿ら・縺ｮ縺ｿ髮・ｨ医・  capture-boundaries.md 蜊倡峡縺ｧ縺ｯ螳檎ｵ舌○縺壹ヽEQ-006 菫ｮ豁｣ + 蜷・command SPEC + 螳御ｺ・ｱ蜻雁･醍ｴ・・蜷梧悄譖ｴ譁ｰ縺悟ｿ・ｦ√・  譁ｰ隕・ADR 荳崎ｦ・ｼ・ommand 蜍穂ｽ應ｻ墓ｧ・workflow 螳夂ｾｩ縺ｯ ADR 菴懈・荳榊庄蟇ｾ雎｡・峨∥gentdev-architecture-advisory 蜉ｩ險螳滓命貂医∩縲・
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      蜷・ｷ･遞・command・・eq-save/spec-save/case-open/case-close・峨・縲∬・蟾･遞九〒螳溯ｦｳ貂ｬ縺励◆ deviation 繧・      capture-boundaries.md 縺悟ｮ壹ａ繧・Split Rule・・ntake/learning 蠅・阜・峨〒蛻・｡槭＠縲（ntake/learning 縺ｮ縺・★繧後°縺ｸ菫晏ｭ倥☆繧九・      蜷・ｷ･遞句・謨｣蝙具ｼ磯∈謚櫁いA・峨ｒ謗｡逕ｨ縺励…ase-auto 髮・ｴ・梛縺ｯ謗｡逕ｨ縺励↑縺・・      逅・罰: case-auto 繧帝壹ｉ縺ｪ縺・句挨螳溯｡鯉ｼ域焔蜍・case-run 遲会ｼ峨〒繧・capture 繧呈・遶九＆縺帙ｋ蠢・ｦ√′縺ゅｋ縺溘ａ縲・  - id: AG-002
    content: |
      Command竊担kill 萓晏ｭ俶婿蜷代ｒ驕ｵ螳医＠縲∝推 command 縺ｯ蛻･ command・・ntake-capture 遲会ｼ峨ｒ蜻ｼ縺ｰ縺ｪ縺・・      - learning 菫晏ｭ・ agentdev-learning-capture skill 縺ｸ蟋碑ｭｲ
      - intake 菫晏ｭ・ agentdev-intake-pipeline 縺ｸ閾ｪ蜍苗apture蜷代￠ item 逕滓・謫堺ｽ懊ｒ霑ｽ蜉縺励※蟋碑ｭｲ
      - git 豌ｸ邯壼喧: 蜻ｼ蜃ｺ蜈・command 縺瑚・霄ｫ縺ｮ譌｢蟄・commit/push 蜃ｦ逅・・縺ｧ螳滓命
      intake-capture 縺ｯ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ閾ｪ辟ｶ險隱槫・蜉帙ｒ蜿励￠繧区焔蜍穂ｿ晏ｭ倡畑 command 縺ｧ縺ゅｊ縲∬・蜍・deviation capture 縺ｮ蜀・Κ API 縺ｧ縺ｯ縺ｪ縺・・  - id: AG-003
    content: |
      蜷・command 縺ｮ螳御ｺ・ｱ蜻翫↓縺ｯ縲∽ｿ晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ繝ｻ蛻・｡橸ｼ・ntake/learning・峨・菫晏ｭ倡ｵ先棡縺ｮ縺ｿ繧貞性繧√ｋ縲・      capture 譛ｬ譁・・螳御ｺ・ｱ蜻翫∈蜷ｫ繧√↑縺・Ｄapture 譛ｬ譁・・蜷・pipeline 縺ｮ豌ｸ邯壼・・・ntake/inbox/, learning/inbox.md 遲会ｼ峨′豁｣隕乗園譛峨☆繧九・  - id: AG-004
    content: |
      case-run 縺ｯ迴ｾ陦後←縺翫ｊ PR Findings 繧堤ｵ檎罰縺励…ase-close 縺悟屓蜿弱☆繧具ｼ育樟陦悟･醍ｴ・ｶｭ謖・ｼ峨・      case-close 縺ｮ capture 蜈･蜉帶ｺ舌・ PR 譛ｬ譁・・縺ｿ・育樟陦檎ｶｭ謖・ｼ峨・  - id: AG-005
    content: |
      case-auto 縺ｯ capture 譛ｬ譁・ｒ蜀榊・鬘槭・蜀堺ｿ晏ｭ倥＠縺ｪ縺・ょ推蟾･遞九°繧芽ｿ斐＆繧後◆菫晏ｭ倡ｵ先棡縺ｮ蜿ら・縺ｨ莉ｶ謨ｰ縺ｮ縺ｿ繧帝寔險医☆繧九・      case-auto 縺ｯ蟾･遞句・驛ｨ縺ｮ隱ｿ譟ｻ驕守ｨ九ｒ闢・ｩ阪○縺壹∫ｵ先棡縺ｮ縺ｿ繧貞女縺大叙繧句･醍ｴ・ｼ育樟陦檎ｶｭ謖・ｼ峨・  - id: AG-006
    content: |
      Epic Issue 縺ｸ險倬鹸縺吶ｋ蝣ｴ蜷医・蜊倅ｸ譖ｸ縺肴焔蛻ｶ邏・↓蠕薙＞ case-close 邨檎罰縺ｧ陦後≧縲・      case-auto 閾ｪ霄ｫ縺ｯ Epic Issue 繧呈峩譁ｰ縺励↑縺・ｼ育樟陦檎ｶｭ謖√｝er-Epic 蜊倅ｸ譖ｸ縺肴焔 = case-close・峨・  - id: AG-007
    content: |
      螳御ｺ・ｱ蜻翫・謇譛画ｨｩ繧貞・蜑ｲ縺吶ｋ:
      - 蜈ｱ騾壽э蜻ｳ螂醍ｴ・ｼ・繝輔ぅ繝ｼ繝ｫ繝・+ `邨先棡` 縺ｮ諢丞袖縲√♀繧医・ `Capture邨先棡` 蟆冗ｯ縺ｮ諢丞袖隲厄ｼ峨・ artifact-contracts.md
      - 蜈ｷ菴鍋噪 `Capture邨先棡` 蟆冗ｯ縺ｮ陦ｨ遉ｺ讒矩縺ｯ蜷・command-local Template
      譁ｰ隕上ヨ繝・・繝ｬ繝吶Ν繝輔ぅ繝ｼ繝ｫ繝峨・霑ｽ蜉縺帙★縲～邨先棡` 蜀・↓莉ｻ諢上・ `Capture邨先棡` 蟆冗ｯ繧貞ｮ夂ｾｩ縺吶ｋ縲・  - id: AG-008
    content: |
      譁ｰ隕・ADR 縺ｯ荳崎ｦ√Ｄommand 蜍穂ｽ應ｻ墓ｧ・workflow 螳夂ｾｩ縺ｯ ADR 菴懈・荳榊庄蟇ｾ雎｡・・gentdev-adr-guidelines・峨・      縺溘□縺・agentdev-architecture-advisory 蜉ｩ險縺ｯ螳滓命貂医∩・・eep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ縺ｧ險ｭ險亥愛譁ｭ2縺ｨ縺励※遒ｺ螳夲ｼ峨・      諠ｳ螳夂ｵ先棡縺ｯ ADR unnecessary縲・
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      REQ-006 縺ｮ capture 雋ｬ蜍吝｢・阜繧貞､画峩縺吶ｋ:
      - case-open 縺ｯ intake/learning 蛟呵｣懊ｒ case-close 縺ｸ蟋碑ｭｲ縺吶ｋ迴ｾ陦悟･醍ｴ・°繧峨・        閾ｪ蟾･遞九〒螳溯ｦｳ貂ｬ縺励◆ deviation 繧・Split Rule 縺ｧ蛻・｡槭＠縺ｦ intake/learning 縺ｸ菫晏ｭ倥☆繧玖ｲｬ蜍吶∈螟画峩
      - case-close 縺ｯ PR 譛ｬ譁・°繧峨・蝗槫庶・育樟陦檎ｶｭ謖・ｼ峨↓蜉縺医∬・蟾･遞九〒螳溯ｦｳ貂ｬ縺励◆ deviation 縺ｮ capture 雋ｬ蜍吶ｒ霑ｽ蜉
      - req-save 縺ｯ REQ 蜀肴ｧ区・ intake 縺ｮ縺ｿ・育樟陦檎ｶｭ謖・ｼ峨↓蜉縺医∬・蟾･遞九〒螳溯ｦｳ貂ｬ縺励◆ deviation 縺ｮ capture 雋ｬ蜍吶ｒ霑ｽ蜉
      - spec-save 縺ｯ髱樣未荳趣ｼ育樟陦鯉ｼ峨°繧峨∬・蟾･遞九〒螳溯ｦｳ貂ｬ縺励◆ deviation 縺ｮ capture 雋ｬ蜍吶∈螟画峩
      - case-auto 縺ｯ蜷・ｷ･遞九・雋ｬ蜍吶ｒ邯呎価縺励▽縺､縲…apture 譛ｬ譁・・蜀榊・鬘槭・蜀堺ｿ晏ｭ倥・陦後ｏ縺壼推蟾･遞九・菫晏ｭ倡ｵ先棡蜿ら・縺ｮ縺ｿ髮・ｨ・      隧ｳ邏ｰ隕∽ｻｶ陦後・ req-save 螳溯｡梧凾縺ｫ REQ-006 縺ｮ譌｢蟄倩ｦ∽ｻｶ鄒､縺ｨ縺ｮ謨ｴ蜷医ｒ遒ｺ隱阪＠縺ｦ驟咲ｽｮ縺吶ｋ縲・  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: workflows
      slug: capture-boundaries
    target_area: "## 蟾･遞句挨 capture 雋ｬ蜍・
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    spec_logical_division: cross_cutting_contract
    canonical_owner: capture-boundaries
    content: |
      ## 蟾･遞句挨 capture 雋ｬ蜍・
      蜷・ｷ･遞・command 縺ｯ閾ｪ蟾･遞九〒螳溯ｦｳ貂ｬ縺励◆ deviation 繧・Split Rule 縺ｧ蛻・｡槭＠縲（ntake/learning 縺ｮ縺・★繧後°縺ｸ菫晏ｭ倥☆繧九・
      | Command | capture 雋ｬ蜍・| 菫晏ｭ伜・ | git 豌ｸ邯壼喧 |
      |---------|------------|--------|-----------|
      | req-save | REQ 蜀肴ｧ区・ intake・育樟陦檎ｶｭ謖・ｼ・ 閾ｪ蟾･遞・deviation 縺ｮ capture | intake/inbox/ 縺ｾ縺溘・ learning/inbox.md | req-save 閾ｪ霄ｫ |
      | spec-save | 閾ｪ蟾･遞・deviation 縺ｮ capture・育樟陦碁撼髢｢荳弱°繧牙､画峩・・| intake/inbox/ 縺ｾ縺溘・ learning/inbox.md | spec-save 閾ｪ霄ｫ |
      | case-open | 閾ｪ蟾･遞・deviation 縺ｮ capture・育樟陦碁撼髢｢荳弱°繧牙､画峩・峨Ｄase-close 縺ｸ縺ｮ蟋碑ｭｲ縺ｯ蟒・ｭ｢ | intake/inbox/ 縺ｾ縺溘・ learning/inbox.md | case-open 閾ｪ霄ｫ |
      | case-run | PR Findings 邨檎罰・育樟陦檎ｶｭ謖・ｼ・| PR 譛ｬ譁・| case-run 閾ｪ霄ｫ |
      | case-close | PR 譛ｬ譁・°繧峨・蝗槫庶・育樟陦檎ｶｭ謖・ｼ・ 閾ｪ蟾･遞・deviation 縺ｮ capture | intake/inbox/ 縺ｾ縺溘・ learning/inbox.md | case-close 閾ｪ霄ｫ |
      | case-auto | 蜷・ｷ･遞九・菫晏ｭ倡ｵ先棡蜿ら・縺ｨ莉ｶ謨ｰ縺ｮ縺ｿ髮・ｨ医Ｄapture 譛ｬ譁・・蜀榊・鬘槭・蜀堺ｿ晏ｭ倥・陦後ｏ縺ｪ縺・| ・磯寔險医・縺ｿ・・| ・磯寔險医・縺ｿ・・|

      ### 蟋碑ｭｲ螂醍ｴ・
      - learning 菫晏ｭ・ agentdev-learning-capture skill 縺ｸ蟋碑ｭｲ
      - intake 菫晏ｭ・ agentdev-intake-pipeline 縺ｸ閾ｪ蜍苗apture蜷代￠ item 逕滓・謫堺ｽ懊ｒ霑ｽ蜉縺励※蟋碑ｭｲ
      - command 縺九ｉ蛻･ command・・ntake-capture 遲会ｼ峨・蜻ｼ縺ｰ縺ｪ縺・ｼ・ommand竊担kill 萓晏ｭ俶婿蜷托ｼ・
      ### Epic Issue 蜊倅ｸ譖ｸ縺肴焔蛻ｶ邏・
      Epic Issue 縺ｸ縺ｮ險倬鹸縺ｯ case-close 邨檎罰縲Ｄase-auto 閾ｪ霄ｫ縺ｯ Epic Issue 繧呈峩譁ｰ縺励↑縺・ｼ・er-Epic 蜊倅ｸ譖ｸ縺肴焔 = case-close・峨・
      ### 螳御ｺ・ｱ蜻・
      蜷・command 縺ｮ螳御ｺ・ｱ蜻翫↓縺ｯ菫晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡縺ｮ縺ｿ繧貞性繧√ｋ縲Ｄapture 譛ｬ譁・・蜷ｫ繧√↑縺・・  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: req-save
    target_area: "## 蜑ｯ菴懃畑"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: behavior
    canonical_owner: req-save
    content: |
      ## 蜑ｯ菴懃畑

      ・育樟陦後・蜑ｯ菴懃畑縺ｫ蜉縺医※莉･荳九ｒ霑ｽ險假ｼ・
      - deviation capture: req-save 螳溯｡御ｸｭ縺ｫ螳溯ｦｳ貂ｬ縺励◆ deviation 繧・agentdev-learning-capture skill 縺ｾ縺溘・
        agentdev-intake-pipeline・郁・蜍苗apture蜷代￠ item 逕滓・謫堺ｽ懶ｼ峨∈蟋碑ｭｲ縺励※菫晏ｭ倥・        菫晏ｭ伜・縺ｯ capture-boundaries.md 縺ｮ Split Rule 縺ｫ蠕薙≧縲・      - git 豌ｸ邯壼喧: capture 謌先棡迚ｩ繧・req-save 閾ｪ霄ｫ縺ｮ譌｢蟄・commit/push 蜃ｦ逅・・縺ｧ豌ｸ邯壼喧縲・      - 螳御ｺ・ｱ蜻・ 菫晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡繧・`Capture邨先棡` 蟆冗ｯ・・邨先棡` 蜀・ｼ峨↓蜷ｫ繧√ｋ縲・  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: spec-save
    target_area: "## 蜑ｯ菴懃畑"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: behavior
    canonical_owner: spec-save
    content: |
      ## 蜑ｯ菴懃畑

      ・育樟陦後・蜑ｯ菴懃畑縺ｫ蜉縺医※莉･荳九ｒ霑ｽ險假ｼ・
      - deviation capture: spec-save 螳溯｡御ｸｭ縺ｫ螳溯ｦｳ貂ｬ縺励◆ deviation 繧・agentdev-learning-capture skill 縺ｾ縺溘・
        agentdev-intake-pipeline・郁・蜍苗apture蜷代￠ item 逕滓・謫堺ｽ懶ｼ峨∈蟋碑ｭｲ縺励※菫晏ｭ倥・        菫晏ｭ伜・縺ｯ capture-boundaries.md 縺ｮ Split Rule 縺ｫ蠕薙≧縲・      - git 豌ｸ邯壼喧: capture 謌先棡迚ｩ繧・spec-save 閾ｪ霄ｫ縺ｮ譌｢蟄・commit/push 蜃ｦ逅・・縺ｧ豌ｸ邯壼喧縲・      - 螳御ｺ・ｱ蜻・ 菫晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡繧・`Capture邨先棡` 蟆冗ｯ・・邨先棡` 蜀・ｼ峨↓蜷ｫ繧√ｋ縲・  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 蜑ｯ菴懃畑"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: behavior
    canonical_owner: case-open
    content: |
      ## 蜑ｯ菴懃畑

      ・育樟陦後・蜑ｯ菴懃畑縺ｫ蜉縺医※莉･荳九ｒ霑ｽ險倥…ase-close 縺ｸ縺ｮ蟋碑ｭｲ縺ｯ蟒・ｭ｢・・
      - deviation capture: case-open 螳溯｡御ｸｭ縺ｫ螳溯ｦｳ貂ｬ縺励◆ deviation 繧・agentdev-learning-capture skill 縺ｾ縺溘・
        agentdev-intake-pipeline・郁・蜍苗apture蜷代￠ item 逕滓・謫堺ｽ懶ｼ峨∈蟋碑ｭｲ縺励※菫晏ｭ倥・        菫晏ｭ伜・縺ｯ capture-boundaries.md 縺ｮ Split Rule 縺ｫ蠕薙≧縲・      - git 豌ｸ邯壼喧: capture 謌先棡迚ｩ繧・case-open 閾ｪ霄ｫ縺ｮ譌｢蟄・commit/push 蜃ｦ逅・・縺ｧ豌ｸ邯壼喧縲・      - 螳御ｺ・ｱ蜻・ 菫晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡繧・`Capture邨先棡` 蟆冗ｯ・・邨先棡` 蜀・ｼ峨↓蜷ｫ繧√ｋ縲・  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    target_area: "## 蜑ｯ菴懃畑"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    spec_logical_division: behavior
    canonical_owner: case-close
    content: |
      ## 蜑ｯ菴懃畑

      ・育樟陦後・蜑ｯ菴懃畑縺ｫ蜉縺医※莉･荳九ｒ霑ｽ險假ｼ・
      - PR 譛ｬ譁・°繧峨・蝗槫庶・育樟陦檎ｶｭ謖・ｼ峨↓蜉縺医…ase-close 螳溯｡御ｸｭ縺ｫ螳溯ｦｳ貂ｬ縺励◆ deviation 繧・agentdev-learning-capture skill 縺ｾ縺溘・
        agentdev-intake-pipeline・郁・蜍苗apture蜷代￠ item 逕滓・謫堺ｽ懶ｼ峨∈蟋碑ｭｲ縺励※菫晏ｭ倥・        菫晏ｭ伜・縺ｯ capture-boundaries.md 縺ｮ Split Rule 縺ｫ蠕薙≧縲・      - git 豌ｸ邯壼喧: capture 謌先棡迚ｩ繧・case-close 閾ｪ霄ｫ縺ｮ譌｢蟄・commit/push 蜃ｦ逅・・縺ｧ豌ｸ邯壼喧縲・      - 螳御ｺ・ｱ蜻・ 菫晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡繧・`Capture邨先棡` 蟆冗ｯ・・邨先棡` 蜀・ｼ峨↓蜷ｫ繧√ｋ縲・      - Epic Issue 蜊倅ｸ譖ｸ縺肴焔: case-close 縺ｯ Epic Issue 縺ｸ縺ｮ險倬鹸繧剃ｸ謇九↓諡・≧・・er-Epic 蜊倅ｸ譖ｸ縺肴焔蛻ｶ邏・ｼ峨・  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: "## 螳御ｺ・ｱ蜻雁･醍ｴ・
    source_items: [AG-007]
    spec_logical_division: cross_cutting_contract
    canonical_owner: artifact-contracts
    content: |
      ## 螳御ｺ・ｱ蜻雁･醍ｴ・
      ・育樟陦・繝輔ぅ繝ｼ繝ｫ繝・+ `邨先棡` 縺ｮ諢丞袖縺ｫ蜉縺医※莉･荳九ｒ霑ｽ險假ｼ・
      `邨先棡` 蜀・↓莉ｻ諢上・ `Capture邨先棡` 蟆冗ｯ繧貞ｮ夂ｾｩ縺吶ｋ・域眠隕上ヨ繝・・繝ｬ繝吶Ν繝輔ぅ繝ｼ繝ｫ繝峨・霑ｽ蜉縺励↑縺・ｼ峨・      `Capture邨先棡` 蟆冗ｯ縺ｮ蜈ｱ騾壽э蜻ｳ螂醍ｴ・ｒ譛ｬ SPEC 縺ｧ螳夂ｾｩ縺吶ｋ縲・
      ### Capture邨先棡 蟆冗ｯ・亥・騾壽э蜻ｳ螂醍ｴ・ｼ・
      - 菫晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ・・ntake/inbox/*.md 縺ｾ縺溘・ learning/inbox.md 縺ｸ縺ｮ逶ｸ蟇ｾ繝代せ・・      - 蛻・｡橸ｼ・ntake/learning・・      - 菫晏ｭ倡ｵ先棡・域・蜉・螟ｱ謨励∝､ｱ謨玲凾縺ｯ逅・罰・・
      蜈ｷ菴鍋噪縺ｪ `Capture邨先棡` 蟆冗ｯ縺ｮ陦ｨ遉ｺ讒矩縺ｯ蜷・command-local Template 縺梧ｭ｣隕乗園譛峨☆繧九・  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-learning-capture
    target_area: "## 蜻ｼ蜃ｺ蜈・command 螂醍ｴ・
    source_items: [AG-002]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-learning-capture
    content: |
      ## 蜻ｼ蜃ｺ蜈・command 螂醍ｴ・
      ・育樟陦悟･醍ｴ・↓蜉縺医※莉･荳九ｒ霑ｽ險假ｼ・
      閾ｪ蜍・capture 蜷代￠蜻ｼ蜃ｺ: 蜷・ｷ･遞・command・・eq-save/spec-save/case-open/case-close・峨・縲・      閾ｪ蟾･遞九〒螳溯ｦｳ貂ｬ縺励◆ deviation 縺ｮ縺・■ learning 隧ｲ蠖灘・繧・agentdev-learning-capture skill 縺ｸ蟋碑ｭｲ縺吶ｋ縲・      譛ｬ skill 縺ｯ inbox.md 縺ｸ縺ｮ霑ｽ險倥→ extraction 繧呈球縺・“it 豌ｸ邯壼喧縺ｯ蜻ｼ蜃ｺ蜈・command 縺梧球蠖薙☆繧具ｼ育樟陦悟･醍ｴ・ｶｭ謖・ｼ峨・  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-intake-pipeline
    target_area: "## 謫堺ｽ應ｸ隕ｧ"
    source_items: [AG-002]
    spec_logical_division: behavior
    canonical_owner: agentdev-intake-pipeline
    content: |
      ## 謫堺ｽ應ｸ隕ｧ

      ・育樟陦梧桃菴懊↓蜉縺医※莉･荳九ｒ霑ｽ蜉・・
      ### 閾ｪ蜍・capture 蜷代￠ item 逕滓・謫堺ｽ・
      蜷・ｷ･遞・command・・eq-save/spec-save/case-open/case-close・峨°繧峨・閾ｪ蜍・deviation capture 隕∵ｱゅｒ蜿励￠繧・item 逕滓・謫堺ｽ懊・      譛ｬ謫堺ｽ懊・ intake/inbox/*.md 縺ｸ縺ｮ item 菫晏ｭ倥ｒ諡・＞縲“it 豌ｸ邯壼喧縺ｯ蜻ｼ蜃ｺ蜈・command 縺梧球蠖薙☆繧九・      intake-capture command・医Θ繝ｼ繧ｶ繝ｼ謇句虚蜈･蜉帷畑・峨→縺ｯ蛻･謫堺ｽ懊〒縺ゅｊ縲∝・蜉帛ｽ｢蠑上ｂ逡ｰ縺ｪ繧九・
conflict_resolutions:
  - id: CR-001
    conflict: 蜷・ｷ･遞句・謨｣蝙・vs case-auto 髮・ｴ・梛
    resolution: |
      蜷・ｷ･遞句・謨｣蝙具ｼ磯∈謚櫁いA・峨ｒ謗｡逕ｨ縲Ｄase-auto 髮・ｴ・梛縺ｯ case-auto 繧帝壹ｉ縺ｪ縺・句挨螳溯｡後〒 capture 貍上ｌ縺檎函縺倥ｋ縺溘ａ荳肴治逕ｨ縲・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ1 逶ｮ逧・・蛻ｶ邏・ｼ峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-002
    conflict: command 縺九ｉ intake-capture command 繧貞他縺ｶ讒矩 vs Command竊担kill 萓晏ｭ俶婿蜷・    resolution: |
      Command竊担kill 萓晏ｭ俶婿蜷代ｒ驕ｵ螳医Ｄommand 縺九ｉ蛻･ command・・ntake-capture・峨・蜻ｼ縺ｰ縺ｪ縺・・      learning 菫晏ｭ倥・ agentdev-learning-capture skill縲（ntake 菫晏ｭ倥・ agentdev-intake-pipeline 縺ｸ縺ｮ謫堺ｽ懆ｿｽ蜉縺ｧ蟇ｾ蠢懊・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ2 險ｭ險医・雋ｬ蜍吝｢・阜 DB-01・峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-003
    conflict: 螳御ｺ・ｱ蜻翫・ Capture邨先棡 蟆冗ｯ縺ｮ豁｣隕乗園譛牙・・・rtifact-contracts.md vs 蜷・command SPEC・・    resolution: |
      蜈ｱ騾壽э蜻ｳ螂醍ｴ・ｼ医ヱ繧ｹ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡縺ｮ諢丞袖隲厄ｼ峨・ artifact-contracts.md縲・      蜈ｷ菴鍋噪陦ｨ遉ｺ讒矩縺ｯ蜷・command-local Template 縺ｧ謇譛画ｨｩ繧貞・蜑ｲ縲・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ2 險ｭ險医・雋ｬ蜍吝｢・阜 DB-04・峨〒遒ｺ隱肴ｸ医∩縲・  - id: CR-004
    conflict: ADR 隕∝凄
    resolution: |
      譁ｰ隕・ADR 荳崎ｦ√Ｄommand 蜍穂ｽ應ｻ墓ｧ・workflow 螳夂ｾｩ縺ｯ ADR 菴懈・荳榊庄蟇ｾ雎｡縲・      agentdev-architecture-advisory 蜉ｩ險縺ｯ螳滓命貂医∩・域Φ螳夂ｵ先棡: ADR unnecessary・峨・      deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ・医Ξ繝ｼ繝ｳ3 邨ｱ蛻ｶ繝ｻ繧ｬ繝舌リ繝ｳ繧ｹ CG-06/07・峨〒遒ｺ隱肴ｸ医∩縲・
operation_units:
  - ou_id: OU-001
    source_ru: RU-0009
    target_req: REQ-006
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0009
    target_spec: docs/specs/workflows/capture-boundaries.md
    operation: spec-update
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0009
    target_spec: docs/specs/commands/req-save.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0009
    target_spec: docs/specs/commands/spec-save.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0009
    target_spec: docs/specs/commands/case-open.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0009
    target_spec: docs/specs/commands/case-close.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-0009
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-0009
    target_spec: docs/specs/skills/agentdev-learning-capture.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-009
    source_ru: RU-0009
    target_spec: docs/specs/skills/agentdev-intake-pipeline.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 9
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-006 縺ｮ capture 雋ｬ蜍吝｢・阜縺悟推蟾･遞句・謨｣蝙九∈螟画峩縺輔ｌ縺溘％縺ｨ繧堤｢ｺ隱阪☆繧九・      docs/requirements/REQ-006.md 縺ｫ縺ｦ case-open 縺瑚・蟾･遞・capture 繧呈球蠖薙＠ case-close 縺ｸ縺ｮ蟋碑ｭｲ繧貞ｻ・ｭ｢縲・      req-save/spec-save/case-close 縺瑚・蟾･遞・capture 繧呈球蠖薙☆繧区葎縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・      capture-boundaries.md 縺ｮ蟾･遞句挨 capture 雋ｬ蜍呵｡ｨ縺御ｸ願ｨ倥↓謨ｴ蜷医☆繧九％縺ｨ縲・    pass_criteria: |
      REQ-006 縺ｮ隕∽ｻｶ鄒､縺ｨ capture-boundaries.md 縺ｮ雋ｬ蜍呵｡ｨ縺後∝推蟾･遞句・謨｣蝙具ｼ磯∈謚櫁いA・峨・6鬆・岼遒ｺ螳壽｡医→螳悟・荳閾ｴ縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨りｦ∽ｻｶ螳夂ｾｩ縺・SPEC 縺ｮ險倩ｼ峨ｒ菫ｮ豁｣縺励※蜀肴､懆ｨｼ縲・  - id: TS-002
    target_item: AG-002
    verification: |
      Command竊担kill 萓晏ｭ俶婿蜷代′驕ｵ螳医＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      蜷・command SPEC・・eq-save/spec-save/case-open/case-close・峨・譛ｬ譁・↓ intake-capture command 縺ｸ縺ｮ蜻ｼ蜃ｺ縺励′縺ｪ縺上・      agentdev-learning-capture skill 縺ｾ縺溘・ agentdev-intake-pipeline 縺ｸ縺ｮ蟋碑ｭｲ縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・      artifact-contracts.md 縺ｮ萓晏ｭ俶婿蜷托ｼ・ommand竊担kill 荳譁ｹ蜷托ｼ峨→謨ｴ蜷医☆繧九％縺ｨ縲・    pass_criteria: |
      蜈ｨ4 command SPEC 縺ｫ縺翫＞縺ｦ intake-capture command 蜻ｼ蜃ｺ縺励′蟄伜惠縺帙★縲ヾkill 蟋碑ｭｲ縺ｮ縺ｿ縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨ょｽ楢ｩｲ command SPEC 縺ｮ蜻ｼ蜃ｺ縺怜・繧剃ｿｮ豁｣縺励※蜀肴､懆ｨｼ縲・  - id: TS-003
    target_item: AG-003
    verification: |
      蜷・command 縺ｮ螳御ｺ・ｱ蜻翫↓ capture 譛ｬ譁・′蜷ｫ縺ｾ繧後★縲∽ｿ晏ｭ倥＠縺・capture 謌先棡迚ｩ縺ｮ繝代せ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡縺ｮ縺ｿ縺悟性縺ｾ繧後ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      蜷・command-local Template 縺ｮ `Capture邨先棡` 蟆冗ｯ縺御ｸ願ｨ俶ｧ矩縺ｧ縺ゅｋ縺薙→縲・    pass_criteria: |
      蜈ｨ4 command 縺ｮ螳御ｺ・ｱ蜻翫ユ繝ｳ繝励Ξ繝ｼ繝医↓ capture 譛ｬ譁・ｒ蜷ｫ縺ｾ縺壹√ヱ繧ｹ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡縺ｮ縺ｿ繧貞性繧 `Capture邨先棡` 蟆冗ｯ縺悟ｭ伜惠縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨ゅユ繝ｳ繝励Ξ繝ｼ繝医・讒矩繧剃ｿｮ豁｣縺励※蜀肴､懆ｨｼ縲・  - id: TS-004
    target_item: AG-004
    verification: |
      case-run 縺・PR Findings 邨檎罰繧堤ｶｭ謖√＠縲…ase-close 縺ｮ蜈･蜉帶ｺ舌′ PR 譛ｬ譁・・縺ｿ縺ｧ縺ゅｋ縺薙→繧堤｢ｺ隱阪☆繧九・      REQ-006 縺翫ｈ縺ｳ capture-boundaries.md 縺ｧ case-run/case-close 縺ｮ迴ｾ陦悟･醍ｴ・′邯ｭ謖√＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      case-run 縺ｮ capture 蜈･蜉帙′ PR Findings 縺ｮ縺ｿ縲…ase-close 縺ｮ蜈･蜉帶ｺ舌′ PR 譛ｬ譁・・縺ｿ・・ 閾ｪ蟾･遞・deviation・峨→險倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-005
    target_item: AG-005
    verification: |
      case-auto 縺・capture 譛ｬ譁・ｒ蜀榊・鬘槭・蜀堺ｿ晏ｭ倥＠縺ｪ縺・％縺ｨ繧堤｢ｺ隱阪☆繧九・      REQ-006 縺ｧ case-auto 縺ｮ capture 髮・ｨ郁ｲｬ蜍吶′縲御ｿ晏ｭ倡ｵ先棡蜿ら・縺ｨ莉ｶ謨ｰ縺ｮ縺ｿ縲阪→險倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      case-auto 縺ｮ雋ｬ蜍呵ｨ倩ｿｰ縺ｫ capture 譛ｬ譁・・蜀榊・鬘槭・蜀堺ｿ晏ｭ倥′蜷ｫ縺ｾ繧後★縲∝推蟾･遞九・菫晏ｭ倡ｵ先棡蜿ら・縺ｨ莉ｶ謨ｰ髮・ｨ医・縺ｿ縺ｧ縺ゅｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-006
    target_item: AG-006
    verification: |
      Epic Issue 縺ｮ蜊倅ｸ譖ｸ縺肴焔蛻ｶ邏・′邯ｭ謖√＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      case-auto 閾ｪ霄ｫ縺ｯ Epic Issue 繧呈峩譁ｰ縺帙★縲…ase-close 邨檎罰縺ｧ縺ゅｋ縺薙→縺・REQ-006 縺ｨ epic-wave-model.md 縺ｧ險倩ｼ峨＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      case-auto 縺ｮ雋ｬ蜍呵ｨ倩ｿｰ縺ｫ Epic Issue 譖ｴ譁ｰ縺悟性縺ｾ繧後★縲…ase-close 縺・per-Epic 蜊倅ｸ譖ｸ縺肴焔縺ｨ縺励※邯ｭ謖√＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-007
    target_item: AG-007
    verification: |
      螳御ｺ・ｱ蜻翫・謇譛画ｨｩ蛻・牡縺悟渚譏縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      artifact-contracts.md 縺ｫ `Capture邨先棡` 蟆冗ｯ縺ｮ蜈ｱ騾壽э蜻ｳ螂醍ｴ・ｼ医ヱ繧ｹ繝ｻ蛻・｡槭・菫晏ｭ倡ｵ先棡・峨′險倩ｼ峨＆繧後・      蜷・command-local Template 縺ｫ蜈ｷ菴鍋噪陦ｨ遉ｺ讒矩縺瑚ｨ倩ｼ峨＆繧後※縺・ｋ縺薙→縲・      譁ｰ隕上ヨ繝・・繝ｬ繝吶Ν繝輔ぅ繝ｼ繝ｫ繝峨′霑ｽ蜉縺輔ｌ縺ｦ縺・↑縺・％縺ｨ縲・    pass_criteria: |
      artifact-contracts.md 縺ｮ `Capture邨先棡` 蜈ｱ騾壽э蜻ｳ螂醍ｴ・+ 蜷・command-local Template 縺ｮ陦ｨ遉ｺ讒矩縺悟ｭ伜惠縺励・      繝医ャ繝励Ξ繝ｳ繝峨ヵ繧｣繝ｼ繝ｫ繝峨′蠅励∴縺ｦ縺・↑縺・％縺ｨ縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-008
    target_item: AG-008
    verification: |
      譁ｰ隕・ADR 縺御ｽ懈・縺輔ｌ縺ｦ縺・↑縺・％縺ｨ繧堤｢ｺ隱阪☆繧九・      docs/adr/ 縺ｸ縺ｮ譁ｰ隕・ADR-NNN 繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺励↑縺・％縺ｨ縲・      agentdev-architecture-advisory 蜉ｩ險險倬鹸縺梧悽繝峨Λ繝輔ヨ縺ｮ conflict_resolutions・・R-004・峨↓谿九▲縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      譁ｰ隕・ADR 繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺帙★縲∥dvisory 蜉ｩ險螳滓命險倬鹸縺・draft 縺ｫ谿九▲縺ｦ縺・ｋ縺薙→縲・    on_failure: |
      record-in-findings・井ｸ・′荳 ADR 縺御ｽ懈・縺輔ｌ縺溷ｴ蜷医・險ｭ險亥愛譁ｭ螟画峩縺ｮ縺溘ａ縲：indings 縺ｸ out-of-scope 縺ｨ縺励※險倬鹸・峨・
review_dispositions:
  - id: RD-001
    source_ru: RU-0009
    source_item: RU-0009-Sources-capture-scope
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0009 縺ｮ Source Summary 縺梧欠鞫倥☆繧九悟ｷ･遞区ｨｪ譁ｭ capture 蠅・阜譛ｪ謨ｴ蛯吶阪・ AG-001縲廣G-008 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲・      蜷・ｷ･遞句・謨｣蝙九，ommand竊担kill 蟋碑ｭｲ縲∝ｮ御ｺ・ｱ蜻頑園譛画ｨｩ蛻・牡縲…ase-run/case-auto 迴ｾ陦檎ｶｭ謖√ｒ蜈ｨ縺ｦ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0009.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large・・EQ-006 菫ｮ豁｣ + 8 SPEC 蜷梧悄譖ｴ譁ｰ・峨・縺溘ａ Epic 讒区・繧呈耳螂ｨ縲・    Wave 讒区・譯・
    - Wave 1: OU-001・・EQ-006 update・・ OU-002・・apture-boundaries.md・・    - Wave 2: OU-003縲廾U-006・・ command SPEC 荳ｦ蛻暦ｼ・ OU-007・・rtifact-contracts.md・・ OU-008/OU-009・・ skill SPEC 荳ｦ蛻暦ｼ・    蜷・OU 縺ｯ蜊倅ｸ Issue 縺ｨ縺励※謇ｱ縺・％縺ｨ繧呈Φ螳夲ｼ・ssue_policy: single・峨・  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      rationale: REQ-006 縺ｨ capture-boundaries.md 縺悟燕謠千衍隴倥ｒ謠蝉ｾ帙☆繧九◆繧∝・鬆ｭ Wave縲・    - wave: 2
      units: [OU-003, OU-004, OU-005, OU-006, OU-007, OU-008, OU-009]
      rationale: Wave 1 螳御ｺ・ｾ後↓荳ｦ蛻怜ｮ溯｡悟庄閭ｽ縲・```

# summary

譛ｬ繝峨Λ繝輔ヨ縺ｯ RU-0009・・apture 蠅・阜繧ｹ繧ｳ繝ｼ繝玲僑蠑ｵ・峨ｒ蜃ｦ逅・☆繧玖ｦ∽ｻｶ螳夂ｾｩ縺ｧ縺ゅｋ縲・gentDevFlow 譛ｬ菴薙・謾ｹ蝟・ｼ・gentdev_handoff: true・峨・
deep-review 5繝ｬ繝ｼ繝ｳ讀懆ｨｼ縺ｧ遒ｺ螳壹＠縺溯ｨｭ險亥愛譁ｭ2・亥推蟾･遞句・謨｣蝙九・Command竊担kill 蟋碑ｭｲ繝ｻ螳御ｺ・ｱ蜻頑園譛画ｨｩ蛻・牡繝ｻADR荳崎ｦ・advisory蠢・ｦ・ｼ峨ｒ蜈ｨ髱｢逧・↓蜿肴丐縲・
荳ｻ隕√↑螟画峩蟇ｾ雎｡縺ｯ REQ-006 縺ｨ8縺､縺ｮ SPEC・・apture-boundaries.md, req-save.md, spec-save.md, case-open.md, case-close.md, artifact-contracts.md, agentdev-learning-capture.md, agentdev-intake-pipeline.md・峨Ｔcale: large縲・pic 讒区・繧呈耳螂ｨ縲・
蠕檎ｶ壹さ繝槭Φ繝峨・ req-save・・EQ-006 update + ADR null・俄・ spec-save・・ SPEC 蜷梧悄譖ｴ譁ｰ・俄・ case-open・・pic 讒区・・峨ｒ諠ｳ螳壹・
