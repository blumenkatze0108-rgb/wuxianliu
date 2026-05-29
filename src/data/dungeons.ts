import { Dungeon } from "../types";

export const DUNGEONS_PRESETS: { [id: string]: Dungeon } = {
  hospital: {
    id: "hospital",
    name: "404号诡秘病院",
    subtitle: "「生命消止的重影与失联的病患」",
    lore: "一座自1998年就在地图上被抹去的传染病医院。终端监测到该区域持续向外广播极其微弱的脑电图电讯波。据传，进入此地的志愿者无一生还，仅在废弃服务器上留下几条语无伦次的报告。",
    difficulty: "MEDIUM",
    originalRules: [
      "规则1：不要相信任何身穿红色病号服的住院病患。",
      "规则2：午夜12点后，绝对不要凝视走廊尽头的3号监控画面，那里什么都没有。",
      "规则3：听到反向敲门声（如：手背敲击），请就地平躺并闭上眼睛，不要做出任何回答。",
      "规则4：整个医院没有任何苹果，如果你在护士台或病床上看到鲜红色的苹果，请立即转身逃离。"
    ],
    initialStageId: "lobby",
    stages: {
      lobby: {
        id: "lobby",
        title: "病院昏暗的大厅",
        description: "空气中弥漫着浓烈的福尔马林与潮湿霉味。大厅正中央停放着一架空锈的轮椅，正无声地前后微微晃动。护士台上的老式监视器亮着诡异的荧光，发出高频的电流滋滋声。",
        options: [
          {
            text: "走近护士台，查看正在闪烁的监控屏幕",
            nextStageId: "nurse_desk",
            mentalCost: 8,
            pollutionGain: 12,
            outcomeText: "监控画面里，3号病房的床头静静地放着一颗娇艳欲滴、还在滴血的红苹果。你想起规则，心脏猛地一缩。"
          },
          {
            text: "不看监控，向左侧寂静的病房走廊前进",
            nextStageId: "corridor_left",
            mentalCost: 12,
            pollutionGain: 6,
            outcomeText: "你强忍住不适绕开护士台。左侧走廊被厚重的雾气笼罩，安全通道的绿灯在浓雾中绿得近乎邪异。"
          },
          {
            text: "坐上那架稍微晃动的空轮椅休息片刻",
            nextStageId: "wheelchair_death",
            mentalCost: 35,
            pollutionGain: 40,
            outcomeText: "你脑海中隐约响起一句细语：‘轮椅上很安全……’ 你疲惫地坐了上去。可轮椅两旁的铁圈突然死死夹住你的双手，发出尖锐的大笑，将你猛得推向了黑暗的深渊……",
            isDeath: true
          }
        ]
      },
      nurse_desk: {
        id: "nurse_desk",
        title: "受污染的护士站",
        description: "在滴血的红苹果旁，放置着一把带血的手术剪刀与半张撕碎的档案。就在这时，大厅中央的轮椅突然‘嘎吱’一声停了下来。你身后，传来了极其细微、像是手背在骨质地板上叩击的‘叩…叩…’声。",
        options: [
          {
            text: "拿走手术剪刀，并立即按照规则在地上平躺闭眼",
            nextStageId: "floor_lay",
            mentalCost: 5,
            pollutionGain: 18,
            outcomeText: "你紧握剪刀顺势扑倒，双眼闭死。一阵冰冷刺骨的寒风从你后颈拂过，带着一股腐烂的水管味。叩叩声在你耳边盘旋了足足三分钟才散去。",
            gainItem: "带血的手术剪"
          },
          {
            text: "无视叩击，一把抓起红苹果塞进嘴里（污染选择）",
            nextStageId: "eat_apple",
            mentalCost: -20, // 减少精神压力，但疯狂吸收污染！
            pollutionGain: 35,
            outcomeText: "你疯了！原本应该逃离的你，却在极端的疯狂下拿起苹果狂啃。甜美的汁液灌入喉咙，竟然是温热的腥红色。你体内的污染正在急剧裂变！"
          },
          {
            text: "手握剪刀，回头寻找声音来源",
            nextStageId: "turn_back_death",
            isDeath: true,
            mentalCost: 50,
            pollutionGain: 50,
            outcomeText: "你猛地回头！然而，你背后没有半个身影，只有一具没有皮肤的血肉面具正贴在你的眼皮前。它咧开嘴大笑：‘你看到我了。’ 瞬间，你的视线被一片猩红淹没……"
          }
        ]
      },
      corridor_left: {
        id: "corridor_left",
        title: "停尸房与3号深渊",
        description: "走廊墙上挂着破碎的医生值班表。深处是一扇厚重的钛合金门，上面用粉笔涂鸦画着一个歪斜的倒十字架。右手边是半开的药房，一个浑身赤裸、正低头啃咬着自己手指的住院者，衣服隐约显出红黑斑驳色……",
        options: [
          {
            text: "拿出‘带血的手术剪’防御，缓步走入药房",
            requiredItem: "带血的手术剪",
            nextStageId: "pharmacy_safe",
            mentalCost: 5,
            pollutionGain: 10,
            outcomeText: "你手翻剪刀，那个病患听到金属摩擦音，惊恐地吐下手指，撞碎纱窗爬了出去。你在药房冰柜中找到一支淡蓝色的安定镇静剂！"
          },
          {
            text: "假装视而不见，越过病患，强行去推那闪着倒十字的停尸房重铁门",
            nextStageId: "corridor_death",
            isDeath: true,
            mentalCost: 40,
            pollutionGain: 40,
            outcomeText: "生红衣病患的人影瞬间变大，手如长藤般拽住你的后衣领。铁门瞬间从内敞开，无数只干枯的苍白手臂将你拖进刺骨的永冻冷舱中……"
          },
          {
            text: "撤回大厅，重新决定路线",
            nextStageId: "lobby",
            mentalCost: 10,
            pollutionGain: 2,
            outcomeText: "由于恐惧，你慌不择路地跑回了大厅。然而，大厅里那台监视器屏幕上的画面，此刻正幽幽地监视着你的后背……"
          }
        ]
      },
      floor_lay: {
        id: "floor_lay",
        title: "生存者的黎明边缘",
        description: "叩叩声远去了。你浑身瘫软地爬起来，空气中的迷雾散去了不少。前方一扇带铁窗的安全门缝隙中透出一丝微弱的白光，下方是一块带有系统退出的磁盘！",
        options: [
          {
            text: "收集磁盘，并推门突围！",
            nextStageId: "escaped",
            mentalCost: 5,
            pollutionGain: 5,
            outcomeText: "你顺利拿到LIMBO数据磁盘，推开生锈的沉重安全门。刺眼的白色强光将你彻底笼罩……",
            gainItem: "解密系统磁盘"
          }
        ]
      },
      eat_apple: {
        id: "eat_apple",
        title: "腐烂的圣餐",
        description: "你整张脸和衣领都被染成了深红。你的耳朵里充满尖锐的哭号，视网膜开始疯狂颤抖，原本黑色而规则的走廊上，竟开始生长出无数双布满毛发的人类眼睛。它们正盯着你，流出黄色的体液。",
        options: [
          {
            text: "对所有眼睛咆哮，并用头部去撞墙（释放疯狂）",
            nextStageId: "escaped_corrupted",
            mentalCost: 50,
            pollutionGain: 40,
            outcomeText: "你放声狂笑，身体已经感受不到疼痛。眼睛一颗颗在你的撞击下粉碎，你似乎抓到了出口的方向，浑浑噩噩地冲向了虚无的光明……"
          },
          {
            text: "安静下来，顺从它们，走入它们中间",
            nextStageId: "become_monster_death",
            isDeath: true,
            mentalCost: 100,
            pollutionGain: 100,
            outcomeText: "你闭上双眼，不再挣扎。眼睛在你的皮下生根发芽，你成了404病院下一个崭新的「红色囚犯」。下一名测试志愿者，很快会在监控里看到你啃咬着烂熟的苹果……"
          }
        ]
      },
      pharmacy_safe: {
        id: "pharmacy_safe",
        title: "白医研室的脱出点",
        description: "药房里弥漫着过期阿司匹林的味道。依靠淡蓝安定剂，你的视线稍微平静。你发现在药柜背后隐藏着一条垂直的杂物井，上方隐隐能闻到泥土与新鲜空气的芬芳！",
        options: [
          {
            text: "注射安定镇静剂，重整意志，攀爬杂物井",
            nextStageId: "escaped",
            mentalCost: -40, // 大幅度回复理智
            pollutionGain: -10,
            outcomeText: "澄澈的安定药效在血管里流淌，四周幻觉退却。你抓住生锈的爬梯，手脚并用，在一阵铁锈斑驳的摩擦声中，你钻出了地表！"
          }
        ]
      },
      escaped: {
        id: "escaped",
        title: "「生还 - 净化退出」",
        description: "你重新站在黑暗凉爽的深林边缘。身后的诡秘病院在夜色下犹如巨兽的一颗朽牙。手里的终端发出‘哔哔’的单音，宣告本轮测试结束，数据保存就绪。你活了下来，虽然灵魂深处似乎多了些别的东西……",
        options: []
      },
      escaped_corrupted: {
        id: "escaped_corrupted",
        title: "「生还 - 异变退出」",
        description: "你似乎回到了现实中那间熟悉的出租屋，但在镜子里，你看不清自己的脸，那是一团被黑红色数据流污染的噪点。终端颤抖着发出怪笑：‘欢迎回家，生还者。不，你还是你吗？’",
        options: []
      }
    }
  },
  subway: {
    id: "subway",
    name: "永夜地下铁：13号特快",
    subtitle: "「永远无法抵达下一站的折叠铁轨」",
    lore: "城市交通局档案中从未存在的第13号环线。据传，在午夜搭乘末班车的乘客有几率误入该列车。在车厢内，物理规则被极度扭曲，后退即是向前，镜影即是实体。千万，别在列车上睡着。",
    difficulty: "HARD",
    originalRules: [
      "规则1：本列车绝对只有6节车厢。当你看到通往第7节车厢的连接门时，立刻在座位上闭眼默念‘不存在’五遍。",
      "规则2：推销员胸前佩戴黄色徽章。如果你遇见粉红色或蓝色微章的乘务员，千万不要回答他们的任何提问。",
      "规则3：若车厢灯光闪烁并全部转变成暗红色，请立即抱头蹲于座椅之下，在灯光复明前，无论听到何种呼唤都不得探头。"
    ],
    initialStageId: "car_4",
    stages: {
      car_4: {
        id: "car_4",
        title: "4号车厢：摇晃的金属风箱",
        description: "车厢里空无一人，惨白的日光灯管发出‘滋滋’碎响，地面满是发黄的过期报纸。列车正以非比寻常的高速疯狂摇摆，轨道摩擦声犹如尖叫。抬头看去，左边车厢门赫然亮着金色：『5号车厢』；右边也是：『5号车厢』……",
        options: [
          {
            text: "遵守空间规则，向左侧推门进入",
            nextStageId: "car_5",
            mentalCost: 10,
            pollutionGain: 8,
            outcomeText: "连接风箱风声咆哮。当你摇摇晃晃推开门后，空气骤冷，车厢内墙上挂满斑驳黑迹，显然，你走得更深了。"
          },
          {
            text: "向右侧车厢门倒退行走（尝试反向突破）",
            nextStageId: "subway_glitch",
            mentalCost: 20,
            pollutionGain: 15,
            outcomeText: "你想反其道而行。你背靠车门，双手摸索，一步步向右退去。车门发出黏糊糊的摩擦音，将你和空气一同咬入……"
          }
        ]
      },
      car_5: {
        id: "car_5",
        title: "5号车厢：偶遇推销员",
        description: "车厢一角的座椅上，歪斜地坐着一个穿制服的人。它戴着一顶压得很低的乘务帽，下巴白乎乎的一片没有五官。他感觉到了你的存在，突然抬起手，将一枚粉红色的金属徽章举到你面前，喉咙里发出风箱般的声音：‘请问……需要买一张回家的票吗？’",
        options: [
          {
            text: "保持绝对沉默，在它侧面落座，闭口不言",
            nextStageId: "car_wait",
            mentalCost: 15,
            pollutionGain: 5,
            outcomeText: "你紧咬嘴唇，一言不发地走到距离他最远的单人座坐下。那个无脸推销员死死指向你的手颤抖了良久，最后缓缓垂下，像干枯的木头一样定死在原地。"
          },
          {
            text: "大声呵斥它：‘列车只有6节，我要下车！’",
            nextStageId: "conductor_death",
            isDeath: true,
            mentalCost: 50,
            pollutionGain: 50,
            outcomeText: "当你发声的瞬间，那个人的嘴角部位突然裂开一条直达耳根的黑缝，吐出尖细的笑声：‘好呀，我现在就送你下车！’ 他没有皮肤的手骨猛然扣住你的面部，强行将你塞入了列车车窗飞速摩擦的轨缝之中……"
          }
        ]
      },
      subway_glitch: {
        id: "subway_glitch",
        title: "受折叠的第7号禁区车厢",
        description: "连接过道打开了，映入你眼帘的，竟然是一节铺满红色软毯、头顶挂着巨大枝形水晶吊灯的超现实古典车厢！尽头金色的门牌卡竟然写着：『7号车厢』。极具诱惑的古典交响乐在空中回荡。你开始感到呼吸困难。",
        options: [
          {
            text: "迅速在座位上死死闭上眼，默念‘不存在’五遍",
            nextStageId: "car_wait",
            mentalCost: 12,
            pollutionGain: 10,
            outcomeText: "你猛地咬破舌尖，抗拒吊灯金光的诱惑，滚入座椅角落，紧闭眼睛默念。四周交响乐瞬间化为刺耳的惨叫，接着是一声猛烈的刹车摩擦声。"
          },
          {
            text: "被优美的音乐吸引，迈步走入这华丽的第7节车厢",
            nextStageId: "luxury_death",
            isDeath: true,
            mentalCost: 45,
            pollutionGain: 45,
            outcomeText: "你沉醉地走了进去。吊灯上的水晶一根根突然坠落，精准刺入你的四肢与关节，将你像蜡烛般钉在了红毯之上。无脸的乐手们围向你，在优雅的小提琴声中，愉悦地撕扯着你的肉体……"
          }
        ]
      },
      car_wait: {
        id: "car_wait",
        title: "寂静的红光停滞",
        description: "突然！列车的白炽灯全灭。周围陷入了死寂般的黑暗。下一秒，极其刺眼血红的灯光瞬间填满车顶！天花板传来抓挠钢板的‘咔咔’声，一个嘶哑的女声在广播内发出哭笑：‘下一站，极乐深渊。有乘客下车吗……？’",
        options: [
          {
            text: "快速钻入残破的座椅底下，学狗爬并抱住头部",
            nextStageId: "escaped_subway",
            mentalCost: 18,
            pollutionGain: 12,
            outcomeText: "你像败犬般狼狈地钻入座椅底。一个巨大的无皮黑影在红光中掠过，指甲划破钢板的火花刺痛了你的头皮，但它似乎没有低下身段检查阴影……"
          },
          {
            text: "在座位上站立不动，手握拳头准备迎战异常",
            nextStageId: "stand_death",
            isDeath: true,
            mentalCost: 60,
            pollutionGain: 60,
            outcomeText: "你傲然挺立。红光中，无数悬挂在车顶的长卷毛发如绞索般垂下，瞬间系上了你的后颈。在你无法做出反应前，你被吊挂起来，成为了列车扶手上的又一具干尸……"
          }
        ]
      },
      escaped_subway: {
        id: "escaped_subway",
        title: "「黎明站台的终鸣」",
        description: "突如其来的巨响！车体剧烈颤动，车门在气压呼啸声中猛自动打开。你发现列车停在了一个空无一人的露天旧站台上，头顶东方升起一抹惨淡的曙光。你跌爬着逃出车门，身后的轨道上，那列幽灵火车早已化作一串残破而虚无的代码段，消失得无影无踪……",
        options: []
      }
    }
  },
  forum: {
    id: "forum",
    name: "深夜生还者论坛",
    subtitle: "「用生命回帖的虚拟死亡讨论区」",
    lore: "唯有在极度绝望濒死之人的网络网关中，才会有概率自动跳转到的匿名暗网论坛。这里的版主、发帖人全部在现实中已被登记神秘失踪或脑死亡。千万，别随意回帖，因为论坛正通过网线吮吸你的灵魂。",
    difficulty: "MEDIUM",
    originalRules: [
      "规则1：严禁打开ID标签为‘Lost_Soul’或‘生还者1999’的私信，他们已被污染吞噬。",
      "规则2：论坛的‘联系客服’按钮其实是一个后门木马，绝对不要点击，LIMBO系统无人工客服。",
      "规则3：如果刷出任何发帖时间为‘未来’（如：2028年，或大后天）的帖子，请立刻关闭网页，静止不动22秒。"
    ],
    initialStageId: "home",
    stages: {
      home: {
        id: "home",
        title: "主页：置顶的血书求救帖",
        description: "网页底色是深沉粘稠的沥青黑，所有的字呈现一种发光的磷绿色。一个置顶帖正红字高亮：『救命！我在404医院，规则是反的！不！快回帖！』。发帖人ID显示：『生还者1999』。右下角有一个醒目的【系统联系客服】悬浮对话窗口。",
        options: [
          {
            text: "理智观察，在帖子里回复一句：‘别相信他，查看规则’",
            nextStageId: "reply_trap_death",
            isDeath: true,
            mentalCost: 30,
            pollutionGain: 35,
            outcomeText: "你敲下键盘回复。瞬间，你的电脑摄像头旁的红灯疯狂闪烁。论坛页面直接刷新为一张你此时此刻坐在屏幕前，十指流血敲键盘的现场诡异抓拍照！照片下的主贴发出无数嘲笑：‘谢谢你留下了你的位置。’ 随后，你身后的房门锁孔诡异地转动起来……"
          },
          {
            text: "无视该求救贴，向下浏览普通讨论板块",
            nextStageId: "posts_list",
            mentalCost: 8,
            pollutionGain: 5,
            outcomeText: "你清醒地向下滚动。避开了置顶帖的鱼钩，屏幕发出沙沙的闪烁，带你进入深网灌水区。"
          },
          {
            text: "出于绝望，点击【联系客服】寻求真正的管理员帮助",
            nextStageId: "support_glitch",
            mentalCost: 15,
            pollutionGain: 20,
            outcomeText: "屏幕顿时变白，一个硕大的血红色鬼脸简笔画占据了大半屏。一行扭曲的文件下载提示疯狂闪过：『正在连接：大脑映射木马……』"
          }
        ]
      },
      posts_list: {
        id: "posts_list",
        title: "灌水区：未来的预告贴",
        description: "一个发于 2028年5月31日（未来！）的帖子静静地挂在首页：『Limbo最终测试结果显示，玩家 [你的名字] 已于半年前注销生命……』，发帖人是：『Lost_Soul』。更诡异的是，私信箱图标开始呈现高频的红光闪动，你收到了一条来自该账号的离线信息！",
        options: [
          {
            text: "根据规则3，立刻关闭该标签页，原地闭眼静止不动22秒",
            nextStageId: "escaped_forum",
            mentalCost: 12,
            pollutionGain: 4,
            outcomeText: "你一惊，当机立断切断电源或闭上眼睛，强迫大脑不去思考那行帖子。耳边隐隐传来键盘自打的‘噼里啪啦’声和一声微弱不甘的叹息：‘就差一点……’"
          },
          {
            text: "好奇心作祟，点击点开那条来自‘Lost_Soul’的私信",
            nextStageId: "message_death",
            isDeath: true,
            mentalCost: 99,
            pollutionGain: 99,
            outcomeText: "私信被强行撑满主屏。那只有一句话：『抬头看你的天天花板。』 你不受控制地，僵硬地抬起脖颅，只见一团漆黑且没有五官、只有一口烂牙的女人长发，此时正悬挂在你的灯管上方，裂口对你喘着粗气……"
          }
        ]
      },
      support_glitch: {
        id: "support_glitch",
        title: "受劫持的客服对话框",
        description: "血色小人抖动起来。一个绿字对话流自动高频地输入：『既然你想找客服……那就是默认将灵肉控制权让渡给LIMBO。输入 【我自愿放弃】 以继续。』 页面下方所有的按钮都消失了，键盘只允许输入这五个字。",
        options: [
          {
            text: "【强制掐断网线/关闭终端电源】（终极自救）",
            nextStageId: "escaped_forum",
            mentalCost: 15,
            pollutionGain: 5,
            outcomeText: "你没有输入。而是怒砸电源按钮。在一声刺耳的尖叫中，屏幕闪烁熄灭。你救了你自己一命，冷汗浸透了后背。"
          },
          {
            text: "双手颤抖着在输入框打字：‘我自愿放弃’",
            nextStageId: "comply_death",
            isDeath: true,
            mentalCost: 100,
            pollutionGain: 100,
            outcomeText: "你敲下了回车。一瞬间，一种难以名状的心灵虚脱感抽离了你的前额叶，你的下颚歪斜流涎，目光失去了所有焦距。恭喜，你的身体此刻已被LIMBO完美的云接管，成为了暗网最深处的第1999号人偶僵尸……"
          }
        ]
      },
      escaped_forum: {
        id: "escaped_forum",
        title: "「重联网络 - 清朗生还」",
        description: "一阵刺耳的调制解调器杂音后，论坛页面由于404错误彻底崩塌。你捂住剧烈跳动的心脏倒在靠背椅上，四周寂静，除了你粗重的呼吸声，只剩桌下的主机散热扇发出安稳的低鸣。你又活过了一晚，在网线没有把你绞死之前……",
        options: []
      }
    }
  }
};
