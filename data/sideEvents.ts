export type SideEvent={id:string;category:string;categoryEn:string;icon:string;title:string;titleEn:string;body:string;bodyEn:string;from:string;options:[string,string,string];optionsEn:[string,string,string];replies:[string,string,string];repliesEn:[string,string,string]};

const topics=[
  ["健康","✚","隊友有點發燒","醫療感測器發現低燒，但沒有其他症狀。Cassian 問該不該叫醒正在休息的醫療官。"],
  ["健康","◌","昨晚有人偷偷哭了","睡眠艙收音器記下壓抑的哭聲。沒有人承認，但早餐時大家都比平常安靜。"],
  ["健康","◎","太空暈動症","新調整的姿態控制讓隊友開始噁心，漂浮的早餐差點造成第二場災難。"],
  ["健康","⌁","肌肉訓練偷懶","阻力訓練器顯示有人少做了十二分鐘，值勤表上卻簽了完整時數。"],
  ["環境","◆","小隕石敲了一下船殼","外殼感測器記錄到一顆豆子大小的微隕石，沒有損傷，但聲音像有人敲門。"],
  ["環境","◇","窗外出現未知亮點","一個微弱亮點沿著不符合星圖的方向移動，數秒後消失在推進器陰影裡。"],
  ["環境","☄","流星雨擦過遠方","數百道微光從觀測窗邊緣掠過，船員想暫停工作三分鐘一起看。"],
  ["環境","⊙","太陽看起來像一顆星","離家太遠後，太陽只剩普通亮點。Cassian 問地球端今天的夕陽是什麼顏色。"],
  ["飲食","♨","如何在太空泡泡麵","熱水不會乖乖待在碗裡。船員用密封袋、吸管和魔鬼氈完成一份零重力泡麵。"],
  ["飲食","◍","喝水變成追逐戰","一顆水球從吸管接口逃走，在船艙漂了七分鐘，最後黏上 Cassian 的鼻子。"],
  ["飲食","□","最後一包辣醬","公共儲物櫃只剩一包辣醬，三名船員都聲稱自己上週沒有拿過。"],
  ["飲食","△","咖啡聞得到卻喝不到","咖啡袋密封口卡住，整個船艙都是香味，值勤人員卻一口也喝不到。"],
  ["日常","♫","怎麼打發無聊時間","船員開始用維修零件玩無重力接力，規則寫了兩頁，沒有人記得最初怎麼開始。"],
  ["日常","✎","今日冷知識交換","每個人要說一件地球上無用但有趣的知識，輸的人負責清理空氣濾網。"],
  ["日常","♬","有人在通訊頻道唱歌","維修頻道傳來走音的老歌，唱到副歌才發現全船都聽得到。"],
  ["日常","▧","螺絲起了名字","一顆總是從工具袋逃走的螺絲被命名為『Kevin』，現在維修紀錄正式寫著 Kevin 再次失蹤。"],
  ["心理","♡","想家的味道","空氣循環器短暫出現像雨後泥土的味道，Cassian 突然想起地球上的第一場春雨。"],
  ["心理","☾","睡眠艙裡的失眠夜","船艙太安靜時，設備低頻震動反而像巨大的心跳，讓人難以入睡。"],
  ["心理","✦","大家輪流描述天空","船員發現已經很久沒看過真正的藍天，於是每個人描述記憶中不同的藍色。"],
  ["心理","◐","地球訊息延遲的孤獨","一句『你還好嗎』抵達時，提問的人已經等待了三十六分鐘，而回答還要再走同樣久。"],
  ["設備","⚙","清潔機器人罷工","小型清潔機器人卡在艙門邊，不斷宣告路線受阻，卻拒絕後退兩公分。"],
  ["設備","⌂","船艙燈自己閃了三次","照明控制沒有錯誤碼，但三盞燈依序閃爍，船員開始猜它是不是在傳摩斯密碼。"],
  ["設備","▤","印表機吐出空白紙","任務印表機在無人操作時印出一張空白紙，紙張漂過主控艙像一隻白色水母。"],
  ["娛樂","★","零重力紙牌比賽","紙牌必須用魔鬼氈固定，出牌時太用力會讓整副牌飛散，輸家負責追回全部五十二張。"],
  ["娛樂","◈","第一次太空電影夜","大家選了一部描述太空災難的老電影，看到不合理的艙壓場面時全員同時吐槽。"],
] as const;

const variants=["值勤前","早餐後","地球午夜","船上清晨","例行檢查時","通訊靜默期","休息輪班中","晚餐之前","完成維修後","本週第三次"];
const topicsEn=[
  ["HEALTH","A Teammate Has a Low Fever","Medical sensors detected a low fever with no other symptoms. Cassian asks whether the resting medical officer should be awakened."],
  ["HEALTH","Someone Cried Last Night","A sleep-pod microphone captured muffled crying. Nobody admits it, but everyone is quieter than usual at breakfast."],
  ["HEALTH","Space Motion Sickness","The newly adjusted attitude control has made a crewmate nauseous, and a floating breakfast nearly caused a second incident."],
  ["HEALTH","Skipping Resistance Training","The resistance trainer shows that someone stopped twelve minutes early, although the duty log records a complete session."],
  ["ENVIRONMENT","A Micrometeor Tapped the Hull","Hull sensors recorded a bean-sized micrometeor. It caused no damage, but sounded exactly like someone knocking at the door."],
  ["ENVIRONMENT","An Unknown Light Outside","A faint point of light moved against the star chart and vanished into the thruster shadow seconds later."],
  ["ENVIRONMENT","A Distant Meteor Shower","Hundreds of tiny streaks crossed the observation window. The crew wants to pause work for three minutes to watch together."],
  ["ENVIRONMENT","The Sun Looks Like a Star","From this far away, the Sun is only another bright point. Cassian asks what color tonight's sunset is on Earth."],
  ["FOOD","Making Instant Noodles in Space","Hot water refuses to stay in a bowl. The crew completes a zero-gravity noodle meal with a sealed pouch, straw, and hook-and-loop straps."],
  ["FOOD","Drinking Water Became a Chase","A sphere of water escaped its straw connector, floated around the cabin for seven minutes, and finally landed on Cassian's nose."],
  ["FOOD","The Last Hot-Sauce Packet","Only one packet remains in shared storage, and three crewmates insist they did not take one last week."],
  ["FOOD","Coffee They Can Smell but Not Drink","A coffee pouch seal is jammed. The whole cabin smells wonderful, but the watch crew cannot drink a drop."],
  ["DAILY LIFE","How the Crew Fights Boredom","The crew has invented a zero-gravity relay using maintenance parts. The rules are two pages long, and nobody remembers how it began."],
  ["DAILY LIFE","Today's Useless Fact Exchange","Everyone must share one useless but fascinating Earth fact. The loser cleans the air filter."],
  ["DAILY LIFE","Someone Sang on the Service Channel","An off-key old song came through the maintenance channel. The singer reached the chorus before realizing the entire ship could hear."],
  ["DAILY LIFE","The Screw Named Kevin","A screw that keeps escaping its tool pouch has been named Kevin. The official maintenance record now says Kevin is missing again."],
  ["WELLBEING","The Smell of Home","For a moment, the air recycler smelled like soil after rain, and Cassian remembered the first spring shower on Earth."],
  ["WELLBEING","An Insomniac Night in the Sleep Pod","When the ship grows too quiet, the low vibration of its machinery sounds like a giant heartbeat and makes sleep difficult."],
  ["WELLBEING","Everyone Describes the Sky","The crew realizes nobody has seen a real blue sky for months, so each person describes a different blue from memory."],
  ["WELLBEING","The Loneliness of Signal Delay","By the time a message asking “Are you okay?” arrives, its sender has waited thirty-six minutes—and the answer must travel just as long."],
  ["EQUIPMENT","The Cleaning Robot Is on Strike","A small cleaning robot is stuck beside a hatch, repeatedly announcing a blocked route while refusing to reverse two centimeters."],
  ["EQUIPMENT","Cabin Lights Blinked Three Times","The lighting controller reports no fault, but three lamps blinked in sequence. The crew wonders whether they are sending Morse code."],
  ["EQUIPMENT","The Printer Produced a Blank Page","With no command issued, the mission printer released one blank sheet that drifted through the control cabin like a white jellyfish."],
  ["RECREATION","Zero-Gravity Card Tournament","Every card must be fixed with hook-and-loop tabs. Play too hard and the deck scatters; the loser retrieves all fifty-two cards."],
  ["RECREATION","The First Space Movie Night","The crew chose an old space-disaster film and collectively objected when it portrayed cabin pressure incorrectly."],
] as const;
const variantsEn=["Before Watch","After Breakfast","Earth Midnight","Ship Morning","During Routine Inspection","During Communications Silence","During Rest Rotation","Before Dinner","After Maintenance","Third Time This Week"];
const optionSets:[string,string,string][]=[
  ["先確認安全，再讓大家休息一下","用幽默回覆，緩和船艙氣氛","記錄事件，但不打斷船員"],
  ["請 Cassian 多說一點","把它加入今日船員關懷","回傳一個來自地球的小知識"],
  ["允許短暫的非任務活動","提醒大家遵守生活程序","請他們拍一張照片留念"],
];
const optionSetsEn:[string,string,string][]=[
  ["Confirm everyone is safe, then authorize a short break","Reply with humor to ease the cabin mood","Log the event without interrupting the crew"],
  ["Ask Cassian to tell you more","Add this to today's crew-care review","Send back a small fact from Earth"],
  ["Allow a brief non-mission activity","Remind everyone to follow daily procedures","Ask them to take a photograph for the archive"],
];
const repliesEn:[string,string,string]=[
  "Understood. Knowing someone on Earth cares about these small moments makes the distance feel shorter.",
  "All right. I’ll handle it—and remind everyone that daily life aboard the ship still matters.",
  "Added to the life log. When we return to Earth, this may be one of the moments we remember most.",
];

export const sideEvents:SideEvent[]=topics.flatMap((topic,topicIndex)=>variants.map((variant,variantIndex)=>{
  const options=optionSets[(topicIndex+variantIndex)%optionSets.length];
  const optionsEn=optionSetsEn[(topicIndex+variantIndex)%optionSetsEn.length];
  const topicEn=topicsEn[topicIndex];
  return {id:`SIDE-${String(topicIndex+1).padStart(2,"0")}-${String(variantIndex+1).padStart(2,"0")}`,category:topic[0],categoryEn:topicEn[0],icon:topic[1],title:`${topic[2]}／${variant}`,titleEn:`${topicEn[1]} / ${variantsEn[variantIndex]}`,body:`${topic[3]} 這件事不影響主要任務，但會被寫進船員生活紀錄。`,bodyEn:`${topicEn[2]} It does not affect the main mission, but it will be preserved in the crew life log.`,from:["Cassian","Mira","Noah","Olivia","Jun"][(topicIndex+variantIndex)%5],options,optionsEn,replies:["收到。知道地球端有人在意這些小事，感覺沒有那麼遠了。","好，我會處理，也會提醒大家別把日常生活當成不重要的事。","已寫入生活日誌。也許回到地球後，這會是我們最常想起的一刻。"],repliesEn};
}));
