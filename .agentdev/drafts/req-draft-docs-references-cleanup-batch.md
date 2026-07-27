---
draft_type: req_draft
topic_slug: docs-references-cleanup-batch
status: saved
spec_actions_consumed: true
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0001
  - RU-0002
  - RU-0003
  - RU-0004
  - RU-0010
agentdev_handoff: true
---

<!-- 譛ｬ繝峨Λ繝輔ヨ縺ｯ AgentDevFlow 譛ｬ菴薙・荳榊・蜷医・謾ｹ蝟・せ繧呈桶縺・燕蟾･遞句ｼ輔″邯吶℃繝峨Λ繝輔ヨ縺ｧ縺ゅｋ・・gentdev_handoff: true・峨・-->
<!-- 5 RU・・U-0001: deep-review SPEC 螳御ｺ・擅莉ｶ/閾ｪ蠕句ｯｩ隴ｰ邯咏ｶ壹ヽU-0002: REQ-006 逶ｸ莠貞盾辣ｧ縲ヽU-0003: document-model.md L27/L139 dangling 蜿ら・縲・     RU-0004: document-model.md L153/L580 逶ｸ莠貞盾辣ｧ縲ヽU-0010: runtime-package-boundary.md inspect-extensions stale 蜿ら・・峨ｒ蜷ｫ繧縲・     蜷・RU 縺ｯ迢ｬ遶矩未蠢・□縺後梧里蟄・SPEC/REQ 譁・嶌縺ｮ蜿ら・荳肴紛蜷医・谺關ｽ縺ｮ隗｣豸医阪→縺・≧蜈ｱ騾壽ｧ縺ｧ繧ｰ繝ｫ繝ｼ繝輸縺ｨ縺励※1繝峨Λ繝輔ヨ縺ｫ縺ｾ縺ｨ繧√◆縲・-->

# draft-data

```yaml
work_type: maintenance

scale: large

summary: |
  RU-0001/0002/0003/0004/0010 繧貞・逅・☆繧九・莉ｶ縺ｮ迢ｬ遶九＠縺・SPEC/REQ 譁・嶌蜿ら・荳肴紛蜷医・谺關ｽ繧定ｧ｣豸医☆繧九・  RU-0001: agentdev-deep-review SPEC 縺ｸ閾ｪ蠕句ｯｩ隴ｰ邯咏ｶ夲ｼ・G-009・峨→螳御ｺ・擅莉ｶ・・G-013・峨・蜿肴丐
  RU-0002: REQ-006 縺ｸ REQ-011-017/018 蟆守ｷ壹→髱櫁､・｣ｽ譏手ｨ倥・霑ｽ險・  RU-0003: document-model.md L27/L139 dangling 蜿ら・縺ｮ豁｣隕剰ｦ∽ｻｶ遒ｺ隱阪→菫ｮ豁｣
  RU-0004: document-model.md L153/L580 縺ｮ6蜃ｦ鄂ｮ繝｢繝・Ν逶ｸ莠貞盾辣ｧ霑ｽ蜉
  RU-0010: runtime-package-boundary.md L306 縺九ｉ inspect-extensions 蜑企勁縲・ command 縺ｸ邵ｮ邏・  譁ｰ隕・ADR 荳崎ｦ√∵眠隕・REQ 菴懈・縺ｪ縺励３EQ-006 update 縺ｨ4 SPEC 縺ｸ縺ｮ spec-update 繧貞ｮ滓命縲・
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      RU-0001: docs/specs/skills/agentdev-deep-review.md 縺ｸ縲瑚・蠕句ｯｩ隴ｰ邯咏ｶ壹阪そ繧ｯ繧ｷ繝ｧ繝ｳ繧定ｿｽ蜉縺吶ｋ縲・      RU-20260726-01 AG-009 縺ｧ蜷域э縺励◆縲碁未騾｣繧ｳ繝ｳ繝・く繧ｹ繝医°繧牙愛譁ｭ蜿ｯ閭ｽ縺ｪ髯舌ｊ閾ｪ蠕句ｯｩ隴ｰ繧堤ｶ咏ｶ壹☆繧九阪→縺・≧閧ｯ螳夊｡ｨ迴ｾ縺ｨ縲・      邯咏ｶ壽凾縺ｫ隧ｦ陦後☆繧・謇狗ｶ壹″・亥燕謠千｢ｺ隱阪∵ｹ諡遒ｺ隱阪∬ｪ､隗｣隗｣豸医・←逕ｨ遽・峇縺ｮ髯仙ｮ壹・Κ蛻・粋諢上・謗｢邏｢縲∽ｻ｣譖ｿ譯医・豈碑ｼ・・      霑ｽ蜉險ｼ諡縺ｫ繧医ｋ蜀崎ｩ穂ｾ｡縲∵音蛻､蜀・ｮｹ縺ｮ蜀肴ｧ区・・峨ｒ蛻玲嫌縺吶ｋ縲・      迴ｾ迥ｶ SPEC 縺ｯ譛ｪ隗｣豎ｺ莠臥せ繧偵Θ繝ｼ繧ｶ繝ｼ縺ｸ霑斐☆譚｡莉ｶ・郁ｫ也炊逧・↑蟇ｾ・峨・縺ｿ繧定ｨ倩ｼ峨＠縲ゝS-005 縺瑚ｦ∵ｱゅ☆繧玖け螳夊｡ｨ迴ｾ縺ｨ謇狗ｶ壹″蛻玲嫌繧呈ｺ縺溘＠縺ｦ縺・↑縺・・  - id: AG-002
    content: |
      RU-0001: docs/specs/skills/agentdev-deep-review.md 縺ｸ縲悟ｮ御ｺ・擅莉ｶ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ繧定ｿｽ蜉縺吶ｋ縲・      RU-20260726-01 AG-013 縺ｧ蜷域э縺励◆蟇ｩ隴ｰ蜈ｨ菴薙・螳御ｺ・擅莉ｶ8鬆・岼・域悽雉ｪ逧・ｺ臥せ縺ｮ隗｣豸医∝ｦ･蠖薙↑謇ｹ蛻､縺ｮ蜿肴丐縲∵彫蝗樊ｸ医∩謇ｹ蛻､縺ｮ謗帝勁縲・      驛ｨ蛻・粋諢冗ｯ・峇縲√Θ繝ｼ繧ｶ繝ｼ蛻､譁ｭ莠矩・∝・讀懆ｨｼ縲∵眠隕丈ｺ臥せ縲∬ｭｰ隲也ｶ咏ｶ夊・菴薙・逶ｮ逧・喧・峨ｒ蛻玲嫌縺吶ｋ縲・      蠖｢蠑冗噪蜷御ｸ蛻､螳壹ｄ蝗ｺ螳夊ｦｳ轤ｹ蜈ｨ PASS 繧貞ｮ御ｺ・擅莉ｶ縺ｨ縺励↑縺・％縺ｨ繧呈・遉ｺ縺吶ｋ縲・      迴ｾ迥ｶ SPEC 縺ｮ縲悟粋諢乗擅莉ｶ縲阪・莠臥せ蜊倅ｽ阪・髢峨§譁ｹ繧貞ｮ夂ｾｩ縺吶ｋ縺ｫ縺ｨ縺ｩ縺ｾ繧翫∝ｯｩ隴ｰ蜈ｨ菴薙・邨ゆｺ・愛螳壹〒縺ｯ縺ｪ縺・５S-007 縺後％縺ｮ荳崎ｶｳ縺ｫ繧医ｊ FAIL 縺ｨ縺ｪ縺｣縺溘・  - id: AG-003
    content: |
      RU-0002: docs/requirements/REQ-006.md 縺ｮ逶ｮ逧・ｯ縺ｾ縺溘・蟇ｾ雎｡螟也ｯ縺ｸ縲ヽEQ-011-017・・xternal execution boundary 豁｣隕乗園譛会ｼ峨→
      REQ-011-018・・arness execution mechanism 豁｣隕乗園譛会ｼ峨∈縺ｮ蟆守ｷ壹ｒ霑ｽ險倥☆繧九・      雋ｬ蜍吝｢・阜 SPEC・・ocs/specs/responsibilities/responsibility-boundary-purification.md L66, L72-74・峨〒 REQ-006 縺ｨ REQ-011 縺ｮ髢｢菫ゅｒ遒ｺ遶九＠縺溘′縲・      REQ-006 蜊倅ｽ薙〒縺ｯ隱ｭ閠・′ external execution boundary 縺ｨ harness execution mechanism 縺ｮ豁｣隕乗園譛我ｽ咲ｽｮ繧定ｿｽ霍｡縺ｧ縺阪↑縺・撫鬘後ｒ隗｣豸医☆繧九・  - id: AG-004
    content: |
      RU-0002: docs/requirements/REQ-006.md 縺ｮ REQ-006-089 orchestration stage 螂醍ｴ・∈
      縲慶ase-run internal lifecycle 繧定､・｣ｽ縺励↑縺・％縺ｨ縲阪ｒ譏手ｨ倥☆繧九・      迴ｾ迥ｶ REQ-006-089 縺ｯ case-auto orchestration stage 繝｢繝・Ν繧貞ｮ壹ａ繧九′縲…ase-run internal lifecycle 繧定､・｣ｽ縺励↑縺・％縺ｨ繧呈・險倥＠縺ｦ縺・↑縺・・      髱櫁､・｣ｽ蜴溷援縺ｯ雋ｬ蜍吝｢・阜 SPEC L78-79 縺ｨ驟榊ｸ・command 縺ｫ蟄伜惠縺吶ｋ縺後∵ｭ｣隕・REQ 謇譛我ｽ咲ｽｮ縺・SPEC/驟榊ｸツommand 縺ｫ萓晏ｭ倥＠縺ｦ縺翫ｊ閾ｪ蟾ｱ螳檎ｵ舌＠縺ｦ縺・↑縺・・  - id: AG-005
    content: |
      RU-0003: docs/specs/foundations/document-model.md L27 蜻ｨ霎ｺ縺ｮ dangling 蜿ら・・・EQ-001-058・峨ｒ菫ｮ豁｣縺吶ｋ縲・      commit ed9ceb56 縺ｧ REQ-001-056 縲・REQ-001-060 縺悟挨縺ｮ諢丞袖繧呈戟縺､隕∽ｻｶ縺ｨ縺励※譁ｰ隕剰ｿｽ蜉縺輔ｌ縺溘◆繧√∵里蟄倥・ dangling 蜿ら・縺梧枚諢丈ｸ堺ｸ閾ｴ縺ｨ縺励※鬘募惠蛹悶＠縺溘・      L27 縺ｮ譁・・ REQ-001-058縲悟ｾ檎ｶ・ADR 繧貞ｿ・ｦ√→縺吶ｋ諢丞袖螟画峩6莉ｶ縲阪→荳閾ｴ縺励↑縺・・      菫ｮ豁｣譁ｹ驥・ L27 蜻ｨ霎ｺ・・EQ-001-001縲梧枚譖ｸ菴鍋ｳｻ縲榊捉霎ｺ繧貞呵｣懶ｼ峨・豁｣隕剰ｦ∽ｻｶ繧呈枚諢冗｢ｺ隱阪ｒ邨後※遒ｺ螳壹＠縲∝盾辣ｧ蜈医ｒ菫ｮ豁｣縺吶ｋ縲・      蛟呵｣懊・譛ｪ遒ｺ螳壹・縺溘ａ縲〉eq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪＠縺ｦ target_area 縺ｨ菫ｮ豁｣蠕・content 繧堤｢ｺ螳壹☆繧九・  - id: AG-006
    content: |
      RU-0003: docs/specs/foundations/document-model.md L139 蜻ｨ霎ｺ縺ｮ dangling 蜿ら・・・EQ-001-056・峨ｒ菫ｮ豁｣縺吶ｋ縲・      L139 縺ｮ retire 蛻､螳壼渕貅悶・ REQ-001-056縲径ccepted ADR 繧呈э蜻ｳ逧・↓荳榊､峨→縺励∵・遉ｺ謇ｿ隱肴ｸ医∩縺ｮ髱樊э蜻ｳ菫ｮ豁｣縺ｨ蠕檎ｶ・ADR 繧貞ｿ・ｦ√→縺吶ｋ諢丞袖螟画峩繧貞・髮｢縲・      縺ｨ荳閾ｴ縺励↑縺・・      菫ｮ豁｣譁ｹ驥・ L139 蜻ｨ霎ｺ・・EQ-001-053 蜻ｨ霎ｺ繧貞呵｣懶ｼ峨・豁｣隕剰ｦ∽ｻｶ繧呈枚諢冗｢ｺ隱阪ｒ邨後※遒ｺ螳壹＠縲∝盾辣ｧ蜈医ｒ菫ｮ豁｣縺吶ｋ縲・      蛟呵｣懊・譛ｪ遒ｺ螳壹・縺溘ａ縲〉eq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪＠縺ｦ target_area 縺ｨ菫ｮ豁｣蠕・content 繧堤｢ｺ螳壹☆繧九・  - id: AG-007
    content: |
      RU-0004: docs/specs/foundations/document-model.md L163縲梧里蟄俶・譫懃黄縺ｮ6蜃ｦ鄂ｮ縲阪°繧・L580 cleanup 螳溯｡悟･醍ｴ・∈縺ｮ逶ｸ莠貞盾辣ｧ繧定ｿｽ蜉縺吶ｋ縲・      L153・・163 蜻ｨ霎ｺ・峨・譏・ｼ蜑阪・驕ｩ譬ｼ諤ｧ蛻､螳壹´580 縺ｯ cleanup 螳溯｡後Δ繝・Ν縺ｧ縺ゅｊ縲・←逕ｨ繝輔ぉ繝ｼ繧ｺ縺ｨ蜿ら・縺吶ｋ豁｣隕乗園譛牙･醍ｴ・′逡ｰ縺ｪ繧九・      蜷後§蜃ｦ鄂ｮ蜷阪′髢｢菫ゅ・隱ｬ譏弱↑縺励↓迴ｾ繧後ｋ縺溘ａ縲∬ｪｭ閠・′驥崎､・ｮ夂ｾｩ縺ｾ縺溘・遶ｶ蜷医☆繧句･醍ｴ・→隱､隱阪☆繧句庄閭ｽ諤ｧ縺後≠繧九・      邨ｱ蜷医・陦後ｏ縺壹√◎繧後◇繧後・蠖ｹ蜑ｲ縺ｨ髢｢菫ゅｒ譏守､ｺ縺吶ｋ蜿ら・霑ｽ險倥↓逡吶ａ繧九・  - id: AG-008
    content: |
      RU-0004: docs/specs/foundations/document-model.md L607縲・蜃ｦ鄂ｮ繝｢繝・Ν縲阪°繧・L153 驕ｩ譬ｼ諤ｧ蛻､螳壹∈縺ｮ逶ｸ莠貞盾辣ｧ繧定ｿｽ蜉縺吶ｋ縲・      L580・・607 蜻ｨ霎ｺ・峨・ cleanup 螳溯｡悟･醍ｴ・〒縺ゅｊ縲´153 驕ｩ譬ｼ諤ｧ蛻､螳壹→縺ｮ髢｢菫ゅｒ譏守､ｺ縺吶ｋ縲・      邨ｱ蜷医・陦後ｏ縺壹√◎繧後◇繧後・蠖ｹ蜑ｲ縺ｨ髢｢菫ゅｒ譏守､ｺ縺吶ｋ蜿ら・霑ｽ險倥↓逡吶ａ繧九・  - id: AG-009
    content: |
      RU-0010: docs/specs/local/runtime-package-boundary.md L306 縺ｮ蛻玲嫌縺九ｉ inspect-extensions 繧貞炎髯､縺励・      3 command・・ocs-check, inspect-skills, inspect-promote・峨∈邵ｮ邏・☆繧九・      ADR-006 縺ｫ繧医ｊ inspect-extensions 縺ｯ迢ｬ遶句・髢・command 縺ｨ縺励※蟒・ｭ｢縺輔ｌ縲∝ｾ檎ｶ・command 縺ｸ譖ｴ譁ｰ貂医∩縺縺後・      local SPEC 縺ｫ縺ｯ inspect-extensions 縺梧ｮ句ｭ倥☆繧九・pic #1833 縺ｮ荳ｻ蟇ｾ雎｡螟悶□縺｣縺・local SPEC 縺ｫ stale reference 縺梧ｮ九▲縺ｦ縺・◆縲・  - id: AG-010
    content: |
      RU-0010: runtime-package-boundary.md L306 蜻ｨ霎ｺ縺ｮ髫｣謗･縺吶ｋ螳溯｡梧凾谺關ｽ險倩ｿｰ繧ょｿ・ｦ√↓蠢懊§縺ｦ譖ｴ譁ｰ縺吶ｋ縲・      docs-check 縺ｧ ADR-006 縺ｨ縺ｮ謨ｴ蜷域ｧ繧貞・讀懆ｨｼ縺吶ｋ縲・
artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-deep-review
    target_area: "## 閾ｪ蠕句ｯｩ隴ｰ邯咏ｶ・
    source_items: [AG-001, AG-002]
    spec_logical_division: behavior
    canonical_owner: agentdev-deep-review
    content: |
      ## 閾ｪ蠕句ｯｩ隴ｰ邯咏ｶ・
      ・域眠隕上そ繧ｯ繧ｷ繝ｧ繝ｳ縲３U-20260726-01 AG-009 縺ｧ蜷域э縺励◆閧ｯ螳夊｡ｨ迴ｾ縺ｨ8謇狗ｶ壹″繧貞・謖呻ｼ・
      髢｢騾｣繧ｳ繝ｳ繝・く繧ｹ繝医°繧牙愛譁ｭ蜿ｯ閭ｽ縺ｪ髯舌ｊ縲∬・蠕句ｯｩ隴ｰ繧堤ｶ咏ｶ壹☆繧九ゅΘ繝ｼ繧ｶ繝ｼ雉ｪ蝠上∈縺ｮ遘ｻ陦後・縲・未騾｣繧ｳ繝ｳ繝・く繧ｹ繝医°繧芽ｧ｣豎ｺ縺ｧ縺阪↑縺・ｴ蜷医↓髯仙ｮ壹☆繧九・
      邯咏ｶ壽凾縺ｫ隧ｦ陦後☆繧・謇狗ｶ壹″・磯・ｸ榊酔・・
      1. 蜑肴署遒ｺ隱・ 謇ｹ蛻､縺ｨ蜿崎ｫ悶・蜑肴署繧堤｢ｺ隱阪＠縲∝燕謠舌・逶ｸ驕輔ｒ迚ｹ螳壹☆繧・      2. 譬ｹ諡遒ｺ隱・ 謇ｹ蛻､縺ｨ蜿崎ｫ悶・譬ｹ諡繧貞・遒ｺ隱阪＠縲∵ｹ諡縺ｮ蠑ｷ蠎ｦ縺ｨ驕ｩ逕ｨ遽・峇繧呈ｯ碑ｼ・☆繧・      3. 隱､隗｣隗｣豸・ 隱､隗｣縲∬ｧ｣驥医・逶ｸ驕輔∵ュ蝣ｱ縺ｮ谺關ｽ縺後≠繧後・譏守､ｺ逧・↓隗｣豸医☆繧・      4. 驕ｩ逕ｨ遽・峇縺ｮ髯仙ｮ・ 謇ｹ蛻､縺ｮ驕ｩ逕ｨ遽・峇縲∝ｯｾ雎｡譯医・驕ｩ逕ｨ遽・峇繧帝剞螳壹＠縲∫粟菴吶・遽・峇縺ｧ蜷域э蜿ｯ閭ｽ縺狗｢ｺ隱阪☆繧・      5. 驛ｨ蛻・粋諢上・謗｢邏｢: 謇ｹ蛻､縺ｨ蜿崎ｫ悶・縺・■蜷域э蜿ｯ閭ｽ縺ｪ驛ｨ蛻・ｒ蛻・ｊ蜃ｺ縺励∝粋諢乗ｸ医∩遽・峇繧堤｢ｺ螳壹☆繧・      6. 莉｣譖ｿ譯医・豈碑ｼ・ 蟇ｾ遶九☆繧矩∈謚櫁い縺ｮ莉｣譯医ｒ豈碑ｼ・＠縲∝・騾壹・逶ｮ逧・ｒ貅縺溘☆莉｣譖ｿ縺後≠繧九°遒ｺ隱阪☆繧・      7. 霑ｽ蜉險ｼ諡縺ｫ繧医ｋ蜀崎ｩ穂ｾ｡: 蛻ｩ逕ｨ蜿ｯ閭ｽ縺ｪ髢｢騾｣繧ｳ繝ｳ繝・く繧ｹ繝医°繧芽ｿｽ蜉險ｼ諡繧貞叙蠕励＠縲∽ｺ臥せ繧貞・隧穂ｾ｡縺吶ｋ
      8. 謇ｹ蛻､蜀・ｮｹ縺ｮ蜀肴ｧ区・: 謇ｹ蛻､縺ｨ蜿崎ｫ悶ｒ謨ｴ逅・＠逶ｴ縺励∫悄縺ｮ蟇ｾ遶狗せ繧呈歓蜃ｺ縺吶ｋ

      ## 螳御ｺ・擅莉ｶ

      ・域眠隕上そ繧ｯ繧ｷ繝ｧ繝ｳ縲３U-20260726-01 AG-013 縺ｧ蜷域э縺励◆蟇ｩ隴ｰ蜈ｨ菴薙・螳御ｺ・擅莉ｶ8鬆・岼・・
      蟇ｩ隴ｰ蜈ｨ菴薙・螳御ｺ・・縲∝ｽ｢蠑冗噪蜈ｨ莨壻ｸ閾ｴ繧・崋螳夊ｦｳ轤ｹ蜈ｨ PASS 縺ｧ縺ｯ縺ｪ縺上∵ｬ｡縺ｮ8鬆・岼縺ｮ譛ｬ雉ｪ逧・粋諢乗擅莉ｶ縺ｧ蛻､譁ｭ縺吶ｋ縲・      蠖｢蠑冗噪蜷御ｸ蛻､螳壹ｄ蝗ｺ螳夊ｦｳ轤ｹ蜈ｨ PASS 繧貞ｮ御ｺ・擅莉ｶ縺ｨ縺励↑縺・・
      1. 譛ｬ雉ｪ逧・ｺ臥せ縺後☆縺ｹ縺ｦ髢峨§縺ｦ縺・ｋ縺薙→
      2. 螯･蠖薙→蜷域э縺励◆謇ｹ蛻､縺悟ｯｾ雎｡譯医∈蜿肴丐縺輔ｌ縺ｦ縺・ｋ縺薙→
      3. 謦､蝗・譽・唆縺輔ｌ縺滓音蛻､縺悟ｯｾ雎｡譯医∈豺ｷ蜈･縺励※縺・↑縺・％縺ｨ
      4. 驛ｨ蛻・粋諢上・謗｡逕ｨ遽・峇縺ｨ髱樊治逕ｨ遽・峇縺梧・遒ｺ縺ｧ縺ゅｋ縺薙→
      5. 繝ｦ繝ｼ繧ｶ繝ｼ蛻､譁ｭ莠矩・′谿九▲縺ｦ縺・↑縺・％縺ｨ
      6. 菫ｮ豁｣迚医∈縺ｮ蜀肴､懆ｨｼ縺悟ｮ御ｺ・＠縺ｦ縺・ｋ縺薙→
      7. 蜀肴､懆ｨｼ蠕後↓譁ｰ縺溘↑譛ｬ雉ｪ逧・ｺ臥せ縺梧ｮ九▲縺ｦ縺・↑縺・％縺ｨ
      8. 謇ｹ蛻､繧堤ｶ咏ｶ壹☆繧九％縺ｨ閾ｪ菴薙ｒ逶ｮ逧・→縺励◆隴ｰ隲悶□縺代′谿九▲縺ｦ縺・↑縺・％縺ｨ
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    source_items: [AG-003, AG-004]
    content: |
      docs/requirements/REQ-006.md 縺ｸ莉･荳九ｒ霑ｽ險倥☆繧・

      ### REQ-011 蟆守ｷ夲ｼ育岼逧・ｯ縺ｾ縺溘・蟇ｾ雎｡螟也ｯ縺ｸ霑ｽ險假ｼ・
      REQ-006 縺ｯ case 螳溯｡後が繝ｼ繧ｱ繧ｹ繝医Ξ繝ｼ繧ｷ繝ｧ繝ｳ繧呈ｭ｣隕乗園譛峨☆繧九′縲‘xternal execution boundary 縺ｨ harness execution mechanism 縺ｯ
      REQ-011 縺梧ｭ｣隕乗園譛峨☆繧九りｪｭ閠・′縺薙ｌ繧峨・豁｣隕乗園譛我ｽ咲ｽｮ繧定ｿｽ霍｡縺ｧ縺阪ｋ繧医≧縲∫岼逧・ｯ縺ｾ縺溘・蟇ｾ雎｡螟也ｯ縺ｸ莉･荳九・蟆守ｷ壹ｒ霑ｽ險・
      - REQ-011-017: external execution boundary 縺ｮ豁｣隕乗園譛・      - REQ-011-018: harness execution mechanism 縺ｮ豁｣隕乗園譛・      ・亥盾辣ｧ蜈・ docs/specs/responsibilities/responsibility-boundary-purification.md L66, L72-74・・
      ### REQ-006-089 髱櫁､・｣ｽ譏手ｨ・
      REQ-006-089 orchestration stage 螂醍ｴ・∈縲慶ase-auto 縺ｯ case-run internal lifecycle 繧定､・｣ｽ縺励↑縺・％縺ｨ縲阪ｒ譏手ｨ倥・      case-auto 縺ｯ orchestration 蛻ｶ蠕｡繧帝寔邏・☆繧九′縲…ase-run 縺ｮ internal lifecycle・・tate machine縲《elf-healing loop 遲会ｼ峨・
      case-run 蛛ｴ縺梧ｭ｣隕乗園譛峨☆繧九る撼隍・｣ｽ蜴溷援縺ｯ雋ｬ蜍吝｢・阜 SPEC L78-79 縺ｨ驟榊ｸ・command 縺ｫ繧ょｭ伜惠縺吶ｋ縺後ヽEQ-006 閾ｪ蟾ｱ螳檎ｵ先ｧ繧堤｢ｺ菫昴☆繧九◆繧∵・險倥☆繧九・      隧ｳ邏ｰ隕∽ｻｶ陦後・ req-save 螳溯｡梧凾縺ｫ REQ-006 縺ｮ譌｢蟄倩ｦ∽ｻｶ鄒､縺ｨ縺ｮ謨ｴ蜷医ｒ遒ｺ隱阪＠縺ｦ驟咲ｽｮ縺吶ｋ縲・  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "・・27 蜻ｨ霎ｺ縺ｮ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺励〉eq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪＠縺ｦ遒ｺ螳夲ｼ・
    source_items: [AG-005]
    spec_logical_division: behavior
    canonical_owner: document-model
    content: |
      ・・27 蜻ｨ霎ｺ縺ｮ dangling 蜿ら・・・EQ-001-058・峨ｒ菫ｮ豁｣縲Ｓeq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪＠縺ｦ豁｣隕丞盾辣ｧ蜈医ｒ遒ｺ螳夲ｼ・
      菫ｮ豁｣譁ｹ驥・ commit ed9ceb56 縺ｧ REQ-001-056縲・60 縺悟挨縺ｮ諢丞袖繧呈戟縺､隕∽ｻｶ縺ｨ縺励※譁ｰ隕剰ｿｽ蜉縺輔ｌ縺溘◆繧√´27 縺ｮ dangling 蜿ら・縺梧枚諢丈ｸ堺ｸ閾ｴ縲・      蛟呵｣・ REQ-001-001・域枚譖ｸ菴鍋ｳｻ・牙捉霎ｺ縲Ｓeq-save 螳溯｡梧凾縺ｫ譁・э荳閾ｴ繧堤｢ｺ隱阪＠縺ｦ target_area 縺ｨ菫ｮ豁｣蠕・content 繧堤｢ｺ螳壹☆繧九・  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "・・139 蜻ｨ霎ｺ縺ｮ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺励〉eq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪＠縺ｦ遒ｺ螳夲ｼ・
    source_items: [AG-006]
    spec_logical_division: behavior
    canonical_owner: document-model
    content: |
      ・・139 蜻ｨ霎ｺ縺ｮ dangling 蜿ら・・・EQ-001-056・峨ｒ菫ｮ豁｣縲Ｓeq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪＠縺ｦ豁｣隕丞盾辣ｧ蜈医ｒ遒ｺ螳夲ｼ・
      菫ｮ豁｣譁ｹ驥・ L139 縺ｮ retire 蛻､螳壼渕貅悶・ REQ-001-056縲径ccepted ADR 繧呈э蜻ｳ逧・↓荳榊､峨阪・螂醍ｴ・→荳閾ｴ縺励↑縺・・      蛟呵｣・ REQ-001-053 蜻ｨ霎ｺ縲Ｓeq-save 螳溯｡梧凾縺ｫ譁・э荳閾ｴ繧堤｢ｺ隱阪＠縺ｦ target_area 縺ｨ菫ｮ豁｣蠕・content 繧堤｢ｺ螳壹☆繧九・  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "・・163 蜻ｨ霎ｺ縲梧里蟄俶・譫懃黄縺ｮ6蜃ｦ鄂ｮ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺暦ｼ・
    source_items: [AG-007]
    spec_logical_division: cross_cutting_contract
    canonical_owner: document-model
    content: |
      ・・163縲梧里蟄俶・譫懃黄縺ｮ6蜃ｦ鄂ｮ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ縲´580 cleanup 螳溯｡悟･醍ｴ・∈縺ｮ逶ｸ莠貞盾辣ｧ繧定ｿｽ險假ｼ・
      譛ｬ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ・・153 蜻ｨ霎ｺ・峨・譏・ｼ蜑阪・驕ｩ譬ｼ諤ｧ蛻､螳壹・6蜃ｦ鄂ｮ・・EEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE・峨ｒ螳夂ｾｩ縺吶ｋ縲・      cleanup 螳溯｡後Δ繝・Ν・・580 蜻ｨ霎ｺ・峨・6蜃ｦ鄂ｮ縺ｯ蛻･繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｧ螳夂ｾｩ縺輔ｌ縲・←逕ｨ繝輔ぉ繝ｼ繧ｺ縺ｨ蜿ら・縺吶ｋ豁｣隕乗園譛牙･醍ｴ・′逡ｰ縺ｪ繧九・      荳｡閠・・迢ｬ遶九＠縺滓ｭ｣隕乗園譛牙･醍ｴ・〒縺ゅｋ縲ら嶌莠貞盾辣ｧ縺ｫ繧医ｊ髢｢菫ゅｒ譏守､ｺ縺吶ｋ縲・  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: "・・607 蜻ｨ霎ｺ縲・蜃ｦ鄂ｮ繝｢繝・Ν縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ隕句・縺暦ｼ・
    source_items: [AG-008]
    spec_logical_division: cross_cutting_contract
    canonical_owner: document-model
    content: |
      ・・607縲・蜃ｦ鄂ｮ繝｢繝・Ν縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺ｸ縲´153 驕ｩ譬ｼ諤ｧ蛻､螳壹∈縺ｮ逶ｸ莠貞盾辣ｧ繧定ｿｽ險假ｼ・
      譛ｬ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ・・580 蜻ｨ霎ｺ・峨・ cleanup 螳溯｡後Δ繝・Ν縺ｮ6蜃ｦ鄂ｮ・・EEP/MERGE/REFERENCE/MOVE/RETIRE/INFERENCE・峨ｒ螳夂ｾｩ縺吶ｋ縲・      譏・ｼ蜑阪・驕ｩ譬ｼ諤ｧ蛻､螳夲ｼ・153 蜻ｨ霎ｺ・峨・6蜃ｦ鄂ｮ縺ｯ蛻･繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ縺ｧ螳夂ｾｩ縺輔ｌ繧九ゆｸ｡閠・・迢ｬ遶九＠縺滓ｭ｣隕乗園譛牙･醍ｴ・〒縺ゅｋ縲・      逶ｸ莠貞盾辣ｧ縺ｫ繧医ｊ髢｢菫ゅｒ譏守､ｺ縺吶ｋ縲らｵｱ蜷医・陦後ｏ縺ｪ縺・・  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: local
      slug: runtime-package-boundary
    target_area: "## 讀懆ｨｼ繧ｹ繧ｯ繝ｪ繝励ヨ蜻ｼ蜃ｺ command"
    source_items: [AG-009, AG-010]
    spec_logical_division: catalog
    canonical_owner: runtime-package-boundary
    content: |
      ## 讀懆ｨｼ繧ｹ繧ｯ繝ｪ繝励ヨ蜻ｼ蜃ｺ command

      ・・306 蜻ｨ霎ｺ縺ｮ蛻玲嫌縺九ｉ inspect-extensions 繧貞炎髯､縺励・ command 縺ｸ邵ｮ邏・ｼ・
      螟画峩蜑・ req-save, spec-save, case-close, inspect-extensions 縺梧､懆ｨｼ繧ｹ繧ｯ繝ｪ繝励ヨ繧貞他縺ｳ蜃ｺ縺・
      螟画峩蠕・ 讀懆ｨｼ繧ｹ繧ｯ繝ｪ繝励ヨ繧貞他縺ｳ蜃ｺ縺・command 縺ｯ莉･荳九・3縺､・・DR-006 縺ｫ繧医ｊ inspect-extensions 縺ｯ蟒・ｭ｢縲∝ｾ檎ｶ・ command 縺ｸ遘ｻ邂｡貂医∩・・
      - docs-check
      - inspect-skills
      - inspect-promote

      髫｣謗･縺吶ｋ螳溯｡梧凾谺關ｽ縺ｮ險倩ｿｰ繧・ADR-006 貅匁侠縺ｸ譖ｴ譁ｰ縺吶ｋ縲Ｅocs-check 縺ｧ ADR-006 縺ｨ縺ｮ謨ｴ蜷域ｧ繧貞・讀懆ｨｼ縺吶ｋ縲・
conflict_resolutions:
  - id: CR-001
    conflict: RU-0001 縺ｮ deep-review SPEC 螳御ｺ・擅莉ｶ/閾ｪ蠕句ｯｩ隴ｰ邯咏ｶ壹・蜿肴丐譁ｹ豕・    resolution: |
      agentdev-deep-review.md 縺ｸ譁ｰ隕上そ繧ｯ繧ｷ繝ｧ繝ｳ縲瑚・蠕句ｯｩ隴ｰ邯咏ｶ壹阪→縲悟ｮ御ｺ・擅莉ｶ縲阪ｒ霑ｽ蜉縺吶ｋ縲・      迴ｾ陦・SPEC 縺ｯ謖ｯ繧玖・縺・･醍ｴ・・豁｣蜈ｸ縺ｧ縺ゅｊ縲∝ｮ溯｣・ｩｳ邏ｰ蛛ｴ縺ｫ謇狗ｶ壹″縺悟ｭ伜惠縺励※繧・SPEC 縺ｨ驟榊ｸ・黄縺ｮ螂醍ｴ・′荳閾ｴ縺励↑縺・憾諷九〒縺ｯ
      讀懆ｨｼ譎ゑｼ・S-005, TS-007・峨↓ FAIL 縺ｨ縺ｪ繧九３U-20260726-01 AG-009/AG-013 繧貞渚譏縺励※ SPEC 繧定・蟾ｱ螳檎ｵ舌＆縺帙ｋ縲・  - id: CR-002
    conflict: document-model.md 縺ｸ縺ｮ4 action・・CT-SPEC-002/003/004/005・峨ｒ1 action 縺ｫ縺ｾ縺ｨ繧√ｋ縺・    resolution: |
      editing concern 蛻･縺ｮ縺溘ａ4 action 縺ｫ蛻・牡縲ゅ・ action = 1 artifact ﾃ・1 editing concern縲榊次蜑・↓蠕薙≧縲・      蜷御ｸ繝輔ぃ繧､繝ｫ蜀・〒縺ゅ▲縺ｦ繧ゅ‥angling 蜿ら・菫ｮ豁｣・・27/L139・峨→逶ｸ莠貞盾辣ｧ霑ｽ蜉・・163/L607・峨・蛻･髢｢蠢・・縺溘ａ蛻･ action縲・      spec-save 螳溯｡梧凾縺ｫ縺ｯ鬆・ｺ丈ｾ晏ｭ倥・縺溘ａ逶ｴ蛻励し繝悶そ繝・ヨ縺ｨ縺励※蜃ｦ逅・＆繧後ｋ・・EQ-008-091・峨・  - id: CR-003
    conflict: ADR 隕∝凄
    resolution: |
      譁ｰ隕・ADR 荳崎ｦ√よ里蟄・SPEC/REQ 譁・嶌縺ｮ蜿ら・荳肴紛蜷医・谺關ｽ縺ｮ隗｣豸医〒縺ゅｊ縲√い繝ｼ繧ｭ繝・け繝√Ε蛻､譁ｭ繧貞性縺ｾ縺ｪ縺・◆繧√・
operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_spec: docs/specs/skills/agentdev-deep-review.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    target_req: REQ-006
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0003
    target_spec: docs/specs/foundations/document-model.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0004
    target_spec: docs/specs/foundations/document-model.md
    operation: spec-update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0010
    target_spec: docs/specs/local/runtime-package-boundary.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/specs/skills/agentdev-deep-review.md 縺ｫ縲瑚・蠕句ｯｩ隴ｰ邯咏ｶ壹阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺悟ｭ伜惠縺吶ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ蜀・↓閧ｯ螳夊｡ｨ迴ｾ縲碁未騾｣繧ｳ繝ｳ繝・く繧ｹ繝医°繧牙愛譁ｭ蜿ｯ閭ｽ縺ｪ髯舌ｊ縲∬・蠕句ｯｩ隴ｰ繧堤ｶ咏ｶ壹☆繧九阪→8謇狗ｶ壹″縺悟・謖吶＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      縲瑚・蠕句ｯｩ隴ｰ邯咏ｶ壹阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺悟ｭ伜惠縺励∬け螳夊｡ｨ迴ｾ縺ｨ8謇狗ｶ壹″縺悟・謖吶＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/skills/agentdev-deep-review.md 縺ｫ縲悟ｮ御ｺ・擅莉ｶ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺悟ｭ伜惠縺吶ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ蜀・↓蟇ｩ隴ｰ蜈ｨ菴薙・螳御ｺ・擅莉ｶ8鬆・岼縺悟・謖吶＆繧後∝ｽ｢蠑冗噪蜷御ｸ蛻､螳壹ｄ蝗ｺ螳夊ｦｳ轤ｹ蜈ｨ PASS 繧貞ｮ御ｺ・擅莉ｶ縺ｨ縺励↑縺・％縺ｨ縺梧・遉ｺ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      縲悟ｮ御ｺ・擅莉ｶ縲阪そ繧ｯ繧ｷ繝ｧ繝ｳ縺悟ｭ伜惠縺励・鬆・岼縺ｨ蠖｢蠑丞愛螳壼凄螳壹′譏守､ｺ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-003
    target_item: AG-003
    verification: |
      docs/requirements/REQ-006.md 縺ｮ逶ｮ逧・ｯ縺ｾ縺溘・蟇ｾ雎｡螟也ｯ縺ｫ REQ-011-017 縺ｨ REQ-011-018 縺ｸ縺ｮ蟆守ｷ壹′蟄伜惠縺吶ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      隱ｭ閠・′ external execution boundary 縺ｨ harness execution mechanism 縺ｮ豁｣隕乗園譛我ｽ咲ｽｮ繧定ｿｽ霍｡縺ｧ縺阪ｋ縺薙→縲・    pass_criteria: |
      REQ-006.md 縺ｫ REQ-011-017/018 縺ｸ縺ｮ蟆守ｷ壹′蟄伜惠縺励∬ｲｬ蜍吝｢・阜 SPEC 縺ｨ縺ｮ謨ｴ蜷医′蜿悶ｌ縺ｦ縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-004
    target_item: AG-004
    verification: |
      docs/requirements/REQ-006.md 縺ｮ REQ-006-089 縺ｫ縲慶ase-run internal lifecycle 繧定､・｣ｽ縺励↑縺・％縺ｨ縲阪′譏手ｨ倥＆繧後※縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・    pass_criteria: |
      REQ-006-089 content 縺ｫ髱櫁､・｣ｽ譏手ｨ倥′蟄伜惠縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-005
    target_item: AG-005
    verification: |
      docs/specs/foundations/document-model.md L27 蜻ｨ霎ｺ縺ｮ dangling 蜿ら・・・EQ-001-058・峨′菫ｮ豁｣縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      菫ｮ豁｣蠕後・蜿ら・蜈医′譁・э荳閾ｴ縺吶ｋ縺薙→縲Ｓeq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪ｒ螳滓命縺励》arget_area 縺ｨ菫ｮ豁｣蠕・content 繧堤｢ｺ螳壹☆繧九・    pass_criteria: |
      L27 蜻ｨ霎ｺ縺ｮ蜿ら・蜈医′螳溷惠縺吶ｋ REQ-001-NNN 縺ｧ縺ゅｊ縲∵枚諢上′荳閾ｴ縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨よ枚諢冗｢ｺ隱咲ｵ先棡縺ｫ蝓ｺ縺･縺榊盾辣ｧ蜈医ｒ蜀堺ｿｮ豁｣縲・  - id: TS-006
    target_item: AG-006
    verification: |
      docs/specs/foundations/document-model.md L139 蜻ｨ霎ｺ縺ｮ dangling 蜿ら・・・EQ-001-056・峨′菫ｮ豁｣縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      菫ｮ豁｣蠕後・蜿ら・蜈医′譁・э荳閾ｴ縺吶ｋ縺薙→縲Ｓeq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪ｒ螳滓命縺励》arget_area 縺ｨ菫ｮ豁｣蠕・content 繧堤｢ｺ螳壹☆繧九・    pass_criteria: |
      L139 蜻ｨ霎ｺ縺ｮ蜿ら・蜈医′螳溷惠縺吶ｋ REQ-001-NNN 縺ｧ縺ゅｊ縲∵枚諢上′荳閾ｴ縺吶ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-007
    target_item: AG-007
    verification: |
      docs/specs/foundations/document-model.md L163 蜻ｨ霎ｺ縺ｫ L580 cleanup 螳溯｡悟･醍ｴ・∈縺ｮ逶ｸ莠貞盾辣ｧ縺瑚ｿｽ蜉縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      荳｡閠・′迢ｬ遶九＠縺滓ｭ｣隕乗園譛牙･醍ｴ・〒縺ゅｋ縺薙→縺梧・遉ｺ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    pass_criteria: |
      L163 蜻ｨ霎ｺ縺九ｉ L580 縺ｸ縺ｮ逶ｸ莠貞盾辣ｧ縺悟ｭ伜惠縺励∫峡遶句･醍ｴ・〒縺ゅｋ縺薙→縺梧・遉ｺ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-008
    target_item: AG-008
    verification: |
      docs/specs/foundations/document-model.md L607 蜻ｨ霎ｺ縺ｫ L153 驕ｩ譬ｼ諤ｧ蛻､螳壹∈縺ｮ逶ｸ莠貞盾辣ｧ縺瑚ｿｽ蜉縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      邨ｱ蜷医・陦後ｏ繧後★縲∫嶌莠貞盾辣ｧ縺ｮ縺ｿ縺ｧ縺ゅｋ縺薙→縲・    pass_criteria: |
      L607 蜻ｨ霎ｺ縺九ｉ L153 縺ｸ縺ｮ逶ｸ莠貞盾辣ｧ縺悟ｭ伜惠縺励∫ｵｱ蜷医〒縺ｪ縺・％縺ｨ縺梧・遉ｺ縺輔ｌ縺ｦ縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-009
    target_item: AG-009
    verification: |
      docs/specs/local/runtime-package-boundary.md L306 蜻ｨ霎ｺ縺ｮ蛻玲嫌縺九ｉ inspect-extensions 縺悟炎髯､縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      3 command・・ocs-check, inspect-skills, inspect-promote・峨∈邵ｮ邏・＆繧後※縺・ｋ縺薙→縲・    pass_criteria: |
      L306 蜻ｨ霎ｺ縺ｫ inspect-extensions 縺悟ｭ伜惠縺帙★縲・ command 縺悟・謖吶＆繧後※縺・ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・  - id: TS-010
    target_item: AG-010
    verification: |
      runtime-package-boundary.md 縺ｮ髫｣謗･縺吶ｋ螳溯｡梧凾谺關ｽ險倩ｿｰ縺・ADR-006 貅匁侠縺ｸ譖ｴ譁ｰ縺輔ｌ縺ｦ縺・ｋ縺薙→繧堤｢ｺ隱阪☆繧九・      docs-check 縺ｧ ADR-006 縺ｨ縺ｮ謨ｴ蜷域ｧ繧貞・讀懆ｨｼ縺吶ｋ縲・    pass_criteria: |
      髫｣謗･險倩ｿｰ縺・ADR-006 貅匁侠縺ｧ縺ゅｊ縲‥ocs-check 縺ｧ謨ｴ蜷域ｧ縺檎｢ｺ隱阪＆繧後ｋ縺薙→縲・    on_failure: |
      fix-and-reverify・亥ｮ溯｣・ｸ崎憶縺ｮ蝣ｴ蜷茨ｼ峨・
review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001-Sources-deep-review-spec
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0001 縺ｮ Source Summary 縺梧欠鞫倥☆繧九慧eep-review SPEC 縺ｮ螳御ｺ・擅莉ｶ繝ｻ閾ｪ蠕句ｯｩ隴ｰ邯咏ｶ壽ｬ關ｽ縲阪・
      AG-001/AG-002 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲ゆｸ｡繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ霑ｽ蜉繧貞渚譏縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0001.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-002
    source_ru: RU-0002
    source_item: RU-0002-Sources-req-006-cross-reference
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0002 縺ｮ Source Summary 縺梧欠鞫倥☆繧九軍EQ-006 縺ｮ閾ｪ蟾ｱ螳檎ｵ先ｧ谺螯ゅ阪・ AG-003/AG-004 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲・      REQ-011 蟆守ｷ壹→髱櫁､・｣ｽ譏手ｨ倥ｒ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0002.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-003
    source_ru: RU-0003
    source_item: RU-0003-Sources-document-model-dangling
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0003 縺ｮ Source Summary 縺梧欠鞫倥☆繧九慧ocument-model.md L27/L139 dangling 蜿ら・縲阪・
      AG-005/AG-006 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲Ｓeq-save 螳溯｡梧凾縺ｫ譁・э遒ｺ隱阪＠縺ｦ遒ｺ螳壹☆繧矩°逕ｨ繧貞渚譏縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0003.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-004
    source_ru: RU-0004
    source_item: RU-0004-Sources-document-model-cross-reference
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0004 縺ｮ Source Summary 縺梧欠鞫倥☆繧九慧ocument-model.md L153/L580 6蜃ｦ鄂ｮ繝｢繝・Ν逶ｸ莠貞盾辣ｧ谺關ｽ縲阪・
      AG-007/AG-008 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲らｵｱ蜷医○縺夂嶌莠貞盾辣ｧ霑ｽ險倥↓逡吶ａ繧区婿驥昴ｒ蜿肴丐縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0004.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []
  - id: RD-005
    source_ru: RU-0010
    source_item: RU-0010-Sources-runtime-package-stale
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0010 縺ｮ Source Summary 縺梧欠鞫倥☆繧九罫untime-package-boundary.md L306 inspect-extensions 谿句ｭ伜盾辣ｧ縲阪・
      AG-009/AG-010 縺ｧ螳悟・縺ｫ邨ｱ蜷医＆繧後◆縲・ command 邵ｮ邏・→ ADR-006 蜀肴､懆ｨｼ繧貞渚譏縲・    evidence:
      path: .agentdev/backlog/req-units/RU-0010.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large・・莉ｶ縺ｮ迢ｬ遶九＠縺滓枚譖ｸ菫ｮ豁｣縲‥ocument-model.md 縺ｸ縺ｯ4 action・峨・縺溘ａ Epic 讒区・繧呈耳螂ｨ縲・    Wave 讒区・譯・
    - Wave 1: OU-001・・eep-review.md・・ OU-002・・EQ-006・・ OU-005・・untime-package-boundary.md・我ｸｦ蛻・    - Wave 2: OU-003・・ocument-model.md dangling 蜿ら・菫ｮ豁｣・・    - Wave 3: OU-004・・ocument-model.md 逶ｸ莠貞盾辣ｧ霑ｽ蜉縲＾U-003 螳御ｺ・ｾ鯉ｼ・    窶ｻ document-model.md 縺ｸ縺ｮ4 action・・CT-SPEC-002/003/004/005・峨・鬆・ｺ丈ｾ晏ｭ倥・縺溘ａ逶ｴ蛻励し繝悶そ繝・ヨ縺ｨ縺励※蜃ｦ逅・・  wave_hints:
    - wave: 1
      units: [OU-001, OU-002, OU-005]
      rationale: 3 繝輔ぃ繧､繝ｫ縺ｯ迢ｬ遶九・縺溘ａ荳ｦ蛻怜ｮ溯｡悟庄閭ｽ縲・    - wave: 2
      units: [OU-003]
      rationale: document-model.md dangling 蜿ら・菫ｮ豁｣繧貞・縺ｫ螳滓命縲・    - wave: 3
      units: [OU-004]
      rationale: OU-003 螳御ｺ・ｾ後↓逶ｸ莠貞盾辣ｧ霑ｽ蜉繧貞ｮ滓命縲・```

# summary

譛ｬ繝峨Λ繝輔ヨ縺ｯ RU-0001/0002/0003/0004/0010 繧貞・逅・☆繧玖ｦ∽ｻｶ螳夂ｾｩ縺ｧ縺ゅｋ縲・gentDevFlow 譛ｬ菴薙・謾ｹ蝟・ｼ・gentdev_handoff: true・峨・
5莉ｶ縺ｮ迢ｬ遶九＠縺・SPEC/REQ 譁・嶌蜿ら・荳肴紛蜷医・谺關ｽ繧定ｧ｣豸医☆繧九ょ推 RU 縺ｯ迢ｬ遶矩未蠢・□縺後梧里蟄俶枚譖ｸ縺ｮ蜿ら・荳肴紛蜷医・谺關ｽ縺ｮ隗｣豸医阪→縺・≧蜈ｱ騾壽ｧ縺ｧ繧ｰ繝ｫ繝ｼ繝輸縺ｨ縺励※1繝峨Λ繝輔ヨ縺ｫ縺ｾ縺ｨ繧√◆縲・
荳ｻ隕√↑螟画峩蟇ｾ雎｡縺ｯ5繝輔ぃ繧､繝ｫ:
- docs/specs/skills/agentdev-deep-review.md・郁・蠕句ｯｩ隴ｰ邯咏ｶ壹∝ｮ御ｺ・擅莉ｶ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ霑ｽ蜉・・- docs/requirements/REQ-006.md・・EQ-011 蟆守ｷ壹・撼隍・｣ｽ譏手ｨ假ｼ・- docs/specs/foundations/document-model.md・・angling 蜿ら・菫ｮ豁｣2莉ｶ縲∫嶌莠貞盾辣ｧ霑ｽ蜉2莉ｶ・・- docs/specs/local/runtime-package-boundary.md・・nspect-extensions 蜑企勁・・
scale: large縲・pic 讒区・繧呈耳螂ｨ縲・
蠕檎ｶ壹さ繝槭Φ繝峨・ req-save・・EQ-006 update縲∵眠隕・ADR 縺ｪ縺暦ｼ俄・ spec-save・・ SPEC 蜷梧悄譖ｴ譁ｰ縲‥ocument-model.md 縺ｯ逶ｴ蛻励し繝悶そ繝・ヨ・俄・ case-open・・pic 讒区・・峨ｒ諠ｳ螳壹・
