import { useState, useRef, useEffect } from "react";

// ============================================================
// DATA
// ============================================================
const SKILLS = [
  { id:"writing", icon:"✍️", label:"文章・ライティング" },
  { id:"design", icon:"🎨", label:"デザイン・イラスト" },
  { id:"video", icon:"🎬", label:"動画編集" },
  { id:"sns", icon:"📱", label:"SNS運用" },
  { id:"programming", icon:"💻", label:"プログラミング" },
  { id:"teaching", icon:"📚", label:"教える・コーチング" },
  { id:"sales", icon:"💬", label:"営業・コミュ力" },
  { id:"nothing", icon:"🤔", label:"特にない" },
];

const ROADMAPS = {
  writing: {
    title:"SNSライター", emoji:"✍️", income:"月3〜15万円", period:"3ヶ月",
    weeks: [
      { week:1, theme:"準備週", tasks:["Xアカウントを開設する","自分の得意ジャンルを1つ決める","競合アカウントを10個フォローして研究する"] },
      { week:2, theme:"発信開始", tasks:["毎日1投稿をする（ジャンル固定）","クラウドワークスに登録する","ライター案件を5件チェックする"] },
      { week:3, theme:"初案件獲得", tasks:["文字単価0.5円の案件に3件応募する","noteアカウントを開設する","フォロワー50人を目指す"] },
      { week:4, theme:"収益化", tasks:["noteで有料記事(300円)を1本書く","初収入を報告する🎉","来月の目標を設定する"] },
    ],
  },
  design: {
    title:"フリーランスデザイナー", emoji:"🎨", income:"月5〜20万円", period:"2ヶ月",
    weeks: [
      { week:1, theme:"ポートフォリオ作成", tasks:["Canvaでロゴサンプルを3点作る","Instagramにデザイン投稿を始める","ココナラに登録する"] },
      { week:2, theme:"出品・集客", tasks:["ココナラにロゴ制作を出品する","料金設定：3,000〜5,000円","DM営業を5件送る"] },
      { week:3, theme:"初案件", tasks:["初案件を受注する","丁寧な対応でレビュー5★を狙う","実績をSNSで発信する"] },
      { week:4, theme:"単価UP", tasks:["料金を8,000円に改定する","法人向けプランを追加する","月3件ペースを確立する"] },
    ],
  },
  video: {
    title:"動画編集者", emoji:"🎬", income:"月5〜30万円", period:"2ヶ月",
    weeks: [
      { week:1, theme:"スキル確認", tasks:["CapCutをインストールして練習する","YouTube Shortsを5本作って投稿する","クラウドワークスで動画案件を調査する"] },
      { week:2, theme:"営業開始", tasks:["ポートフォリオ動画を2本作る","クラウドワークスに登録・応募10件","単価3,000円の案件を狙う"] },
      { week:3, theme:"初収入", tasks:["初案件を完成させる","TikTokでbefore/after動画を投稿","次の案件の単価を5,000円に設定"] },
      { week:4, theme:"スケールアップ", tasks:["月5件ペースを確立する","YouTubeチャンネル開設を検討する","単価10,000円案件に挑戦する"] },
    ],
  },
  nothing: {
    title:"Webライター入門", emoji:"💡", income:"月1〜8万円", period:"2ヶ月",
    weeks: [
      { week:1, theme:"まず動く", tasks:["クラウドワークスに登録する","データ入力案件を1件受注する","Googleドキュメントの使い方を覚える"] },
      { week:2, theme:"ライターへ", tasks:["文字単価0.3円の案件に応募する","1日1000文字書く練習をする","得意なジャンルを探す"] },
      { week:3, theme:"単価UP", tasks:["文字単価0.5円を達成する","専門ジャンルの記事を書く","クライアントにリピートしてもらう"] },
      { week:4, theme:"収益化", tasks:["文字単価1円を目指す","月5,000円を達成する🎉","来月の目標を3万円に設定する"] },
    ],
  },
};

const DEFAULT_ROADMAP = ROADMAPS.nothing;

const MIKA_REPLIES = (msg, stats) => {
  const m = msg;
  const { weeksDone, tasksDone, totalTasks, income } = stats;
  if (m.includes("できた") || m.includes("達成") || m.includes("完了")) return `素晴らしい！🎉 本当によく頑張りました！継続こそが最大の武器です。このまま続けていきましょう💪 小さな積み重ねが必ず大きな結果につながりますよ✨`;
  if (m.includes("難し") || m.includes("できない") || m.includes("無理")) return `大丈夫です😊 副業を始めた人の90%が最初の1ヶ月で同じ壁にぶつかります。でも続けた人だけが稼げるようになるんです。まず一番小さいタスクだけやってみましょう。それだけでOKです🌱`;
  if (m.includes("収入") || m.includes("いくら") || m.includes("稼げ")) return `今の進捗ペースだと、来月末には初収入が見えてきそうです💰 タスク完了率が上がれば上がるほど、収益化も早くなりますよ。今週のタスクを全部終わらせることが最優先です！`;
  if (m.includes("次") || m.includes("何をすれば") || m.includes("何から")) return `今週のタスクを確認してみましょう📋 まだ完了していないタスクがあれば、そこから始めるのが正解です。「完璧にやろう」より「とりあえずやる」を優先してください😊`;
  if (m.includes("SNS") || m.includes("発信") || m.includes("投稿")) return `SNS発信は副業の最強の集客ツールです📱 「副業を頑張っている自分」をそのまま発信するのが一番バズりやすいですよ。完璧な投稿じゃなくていい。リアルな進捗を見せることが大事です✨`;
  if (m.includes("モチベ") || m.includes("やる気") || m.includes("しんどい")) return `正直に話してくれてありがとうございます🙏 モチベーションは波があって当然です。やる気がなくてもできる「最小タスク」を1つだけやってみてください。動き始めると不思議とやる気が出てきますよ💪`;
  if (weeksDone === 0) return `はじめましょう！🔥 まず今週のタスクを1つだけ完了させることを目標にしてください。完璧じゃなくていいです。動き始めることが全てです😊`;
  return `${weeksDone}週目まで頑張っていますね！タスク完了率は${Math.round((tasksDone/Math.max(totalTasks,1))*100)}%です。${tasksDone < totalTasks ? "残りのタスクも少しずつ進めていきましょう💪" : "今週のタスクを全部終わらせましたね！素晴らしい🌟"}`;
};

// ============================================================
// COMPONENTS
// ============================================================
function ProgressRing({ pct, size=64, stroke=6, color="#6366f1" }) {
  const r = (size-stroke*2)/2;
  const circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState("onboard"); // onboard | home | tasks | chat | progress
  const [onboardStep, setOnboardStep] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [userName, setUserName] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [streak, setStreak] = useState(3);
  const [totalIncome, setTotalIncome] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);

  const finishOnboard = () => {
    const rm = ROADMAPS[selectedSkill] || DEFAULT_ROADMAP;
    setRoadmap(rm);
    setChatMessages([{ role:"assistant", text:`${userName}さん、はじめまして！AIコーチのミカです😊\n\n「${rm.title}」での副業チャレンジ、一緒に頑張りましょう！\n\nまず今週のタスクを確認してみてください。小さな一歩から始めることが大切ですよ✨` }]);
    setScreen("home");
  };

  const toggleTask = (weekIdx, taskIdx) => {
    const key = `${weekIdx}-${taskIdx}`;
    setCompletedTasks(prev => {
      const next = { ...prev, [key]: !prev[key] };
      const done = Object.values(next).filter(Boolean).length;
      setTotalIncome(Math.floor(done * 800));
      return next;
    });
  };

  const weekTasks = roadmap?.weeks[currentWeek]?.tasks || [];
  const weekCompleted = weekTasks.filter((_,i) => completedTasks[`${currentWeek}-${i}`]).length;
  const totalTasks = roadmap ? roadmap.weeks.reduce((s,w)=>s+w.tasks.length,0) : 0;
  const totalDone = Object.values(completedTasks).filter(Boolean).length;
  const overallPct = totalTasks ? Math.round((totalDone/totalTasks)*100) : 0;
  const weekPct = weekTasks.length ? Math.round((weekCompleted/weekTasks.length)*100) : 0;

  const sendChat = async () => {
    if (!chatInput.trim() || isTyping) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role:"user", text:msg }]);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random()*500));
    const stats = { weeksDone: currentWeek, tasksDone: totalDone, totalTasks, income: totalIncome };
    const reply = MIKA_REPLIES(msg, stats);
    setChatMessages(prev => [...prev, { role:"assistant", text:reply }]);
    setIsTyping(false);
  };

  // ---- ONBOARDING ----
  if (screen === "onboard") {
    return (
      <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif", padding:"0 16px" }}>
        <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none" }}>
          <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"60vw", height:"60vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.18),transparent 70%)" }} />
          <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:"50vw", height:"50vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.14),transparent 70%)" }} />
        </div>
        <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>

          {onboardStep === 0 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:56, marginBottom:20 }}>🚀</div>
              <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", marginBottom:12, lineHeight:1.3 }}>
                副業で稼ぐ<br />
                <span style={{ background:"linear-gradient(90deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AIコーチがいる</span>
              </h1>
              <p style={{ fontSize:14, color:"#6b7280", marginBottom:32, lineHeight:1.8 }}>診断→ロードマップ→週次タスク→チャットサポート。副業成功までAIが伴走します。</p>
              <button onClick={()=>setOnboardStep(1)} style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:16, fontSize:16, fontWeight:900, cursor:"pointer", boxShadow:"0 8px 32px rgba(99,102,241,0.5)", marginBottom:12 }}>
                無料で始める →
              </button>
              <div style={{ fontSize:12, color:"#4b5563" }}>7日間無料 · クレカ不要</div>
            </div>
          )}

          {onboardStep === 1 && (
            <div>
              <div style={{ fontSize:13, color:"#6366f1", fontWeight:700, marginBottom:8, textAlign:"center" }}>STEP 1 / 2</div>
              <h2 style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:6, textAlign:"center" }}>得意なことは？</h2>
              <p style={{ fontSize:12, color:"#6b7280", marginBottom:20, textAlign:"center" }}>なくても大丈夫。正直に選んでください</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {SKILLS.map(s => (
                  <button key={s.id} onClick={()=>setSelectedSkill(s.id)} style={{ padding:"14px 10px", borderRadius:14, border: selectedSkill===s.id ? "2px solid #6366f1" : "2px solid rgba(255,255,255,0.08)", background: selectedSkill===s.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                    <div style={{ fontSize:26, marginBottom:4 }}>{s.icon}</div>
                    <div style={{ fontSize:12, fontWeight:600, color: selectedSkill===s.id ? "#a5b4fc" : "#9ca3af" }}>{s.label}</div>
                  </button>
                ))}
              </div>
              <button onClick={()=>selectedSkill&&setOnboardStep(2)} style={{ width:"100%", padding:"14px", background: selectedSkill ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)", color: selectedSkill ? "#fff" : "#4b5563", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor: selectedSkill?"pointer":"default", boxShadow: selectedSkill?"0 4px 20px rgba(99,102,241,0.4)":"none" }}>
                次へ →
              </button>
            </div>
          )}

          {onboardStep === 2 && (
            <div>
              <div style={{ fontSize:13, color:"#6366f1", fontWeight:700, marginBottom:8, textAlign:"center" }}>STEP 2 / 2</div>
              <h2 style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:6, textAlign:"center" }}>ニックネームを教えて</h2>
              <p style={{ fontSize:12, color:"#6b7280", marginBottom:20, textAlign:"center" }}>AIコーチが名前で呼びかけます</p>
              <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="例：たろう" style={{ width:"100%", padding:"16px", borderRadius:14, border:"2px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", fontSize:18, fontWeight:700, color:"#fff", outline:"none", boxSizing:"border-box", marginBottom:16, textAlign:"center" }} />
              <button onClick={()=>userName.trim()&&finishOnboard()} style={{ width:"100%", padding:"14px", background: userName.trim() ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)", color: userName.trim() ? "#fff" : "#4b5563", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor: userName.trim()?"pointer":"default", boxShadow: userName.trim()?"0 4px 20px rgba(99,102,241,0.4)":"none" }}>
                コーチを呼ぶ 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- MAIN APP ----
  return (
    <div style={{ minHeight:"100vh", background:"#080810", fontFamily:"'Hiragino Sans','Yu Gothic',sans-serif", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"60vw", height:"60vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:"-10%", right:"-5%", width:"50vw", height:"50vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.1),transparent 70%)" }} />
      </div>

      <div style={{ width:"100%", maxWidth:430, minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>

        {/* TOP BAR */}
        <div style={{ padding:"16px 16px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:11, color:"#6b7280", fontWeight:600 }}>おかえり👋</div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff" }}>{userName}さん</div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.3)", borderRadius:99, padding:"4px 10px", fontSize:12, color:"#fbbf24", fontWeight:700 }}>
              🔥 {streak}日連続
            </div>
            <div style={{ background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:99, padding:"4px 10px", fontSize:12, color:"#34d399", fontWeight:700 }}>
              💰 ¥{totalIncome.toLocaleString()}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, padding:"16px 14px 90px", overflowY:"auto" }}>

          {/* ===== HOME ===== */}
          {screen === "home" && roadmap && (
            <div>
              {/* Hero card */}
              <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.25),rgba(168,85,247,0.2))", border:"1px solid rgba(99,102,241,0.3)", borderRadius:22, padding:"18px 18px 16px", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:11, color:"#a5b4fc", fontWeight:700, marginBottom:4 }}>現在挑戦中</div>
                    <div style={{ fontSize:20, fontWeight:900, color:"#fff" }}>{roadmap.emoji} {roadmap.title}</div>
                    <div style={{ fontSize:12, color:"#8b5cf6", marginTop:4 }}>目標: {roadmap.income}</div>
                  </div>
                  <div style={{ position:"relative", width:64, height:64 }}>
                    <ProgressRing pct={overallPct} />
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#fff" }}>{overallPct}%</div>
                  </div>
                </div>
                <div style={{ marginTop:14, display:"flex", gap:8 }}>
                  {roadmap.weeks.map((w,i) => (
                    <div key={i} onClick={()=>{ setCurrentWeek(i); setScreen("tasks"); }} style={{ flex:1, background: i===currentWeek ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.05)", borderRadius:10, padding:"8px 4px", textAlign:"center", cursor:"pointer", border: i===currentWeek ? "1px solid rgba(99,102,241,0.6)" : "1px solid transparent" }}>
                      <div style={{ fontSize:10, color: i===currentWeek ? "#a5b4fc" : "#4b5563", fontWeight:700 }}>W{i+1}</div>
                      <div style={{ fontSize:9, color: i===currentWeek ? "#c4b5fd" : "#374151", marginTop:2 }}>
                        {roadmap.weeks[i].tasks.filter((_,j)=>completedTasks[`${i}-${j}`]).length}/{roadmap.weeks[i].tasks.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's task */}
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:18, padding:"16px", marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>📋 今週のタスク</div>
                  <div style={{ fontSize:12, color: weekPct===100 ? "#34d399" : "#6366f1", fontWeight:700 }}>{weekCompleted}/{weekTasks.length} 完了</div>
                </div>
                {weekTasks.map((task, i) => {
                  const done = completedTasks[`${currentWeek}-${i}`];
                  return (
                    <div key={i} onClick={()=>toggleTask(currentWeek,i)} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom: i<weekTasks.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none", cursor:"pointer" }}>
                      <div style={{ width:22, height:22, borderRadius:6, border: done ? "2px solid #6366f1" : "2px solid rgba(255,255,255,0.15)", background: done ? "#6366f1" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all 0.2s" }}>
                        {done && <span style={{ fontSize:12, color:"#fff" }}>✓</span>}
                      </div>
                      <span style={{ fontSize:13, color: done ? "#4b5563" : "#d1d5db", lineHeight:1.6, textDecoration: done?"line-through":"none", transition:"all 0.2s" }}>{task}</span>
                    </div>
                  );
                })}
                {weekPct === 100 && (
                  <div style={{ marginTop:12, background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:10, padding:"10px 12px", textAlign:"center", fontSize:13, color:"#34d399", fontWeight:700 }}>
                    🎉 今週のタスク全部完了！素晴らしい！
                  </div>
                )}
              </div>

              {/* Mika quick chat */}
              <div onClick={()=>setScreen("chat")} style={{ background:"linear-gradient(135deg,rgba(236,72,153,0.15),rgba(168,85,247,0.15))", border:"1px solid rgba(236,72,153,0.25)", borderRadius:18, padding:"14px 16px", marginBottom:14, cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, background:"linear-gradient(135deg,#ec4899,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>👩‍💼</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:"#f9a8d4", fontWeight:700, marginBottom:2 }}>AIコーチ ミカ</div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>「何か詰まってることがあれば相談してください😊」</div>
                </div>
                <div style={{ fontSize:20, color:"#ec4899" }}>→</div>
              </div>

              {/* Progress stats */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
                {[
                  { label:"完了タスク", value:totalDone, unit:"件", color:"#6366f1" },
                  { label:"全体進捗", value:overallPct, unit:"%", color:"#8b5cf6" },
                  { label:"推定収益", value:`¥${(totalIncome/1000).toFixed(1)}k`, unit:"", color:"#10b981" },
                ].map(s => (
                  <div key={s.label} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"12px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.value}<span style={{ fontSize:11 }}>{s.unit}</span></div>
                    <div style={{ fontSize:10, color:"#6b7280", marginTop:2, fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Upgrade CTA */}
              <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.15))", border:"1px solid rgba(99,102,241,0.3)", borderRadius:18, padding:"16px", textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#fff", marginBottom:4 }}>💎 プレミアムにアップグレード</div>
                <div style={{ fontSize:11, color:"#9ca3af", marginBottom:12 }}>無制限チャット・詳細ロードマップ・収益シミュレーター</div>
                <button style={{ width:"100%", padding:"12px", background:"linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)", color:"#fff", border:"none", borderRadius:12, fontSize:13, fontWeight:900, cursor:"pointer", boxShadow:"0 4px 20px rgba(99,102,241,0.4)" }}>
                  月額980円で始める（7日間無料）
                </button>
              </div>
            </div>
          )}

          {/* ===== TASKS ===== */}
          {screen === "tasks" && roadmap && (
            <div>
              <button onClick={()=>setScreen("home")} style={{ background:"none", border:"none", color:"#6366f1", fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:16, padding:0 }}>← ホームに戻る</button>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff", marginBottom:4 }}>📋 全タスク一覧</div>
              <div style={{ fontSize:12, color:"#6b7280", marginBottom:16 }}>タップで完了・未完了を切り替え</div>
              {roadmap.weeks.map((week, wi) => {
                const wDone = week.tasks.filter((_,j)=>completedTasks[`${wi}-${j}`]).length;
                const wPct = Math.round((wDone/week.tasks.length)*100);
                return (
                  <div key={wi} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${wi===currentWeek?"rgba(99,102,241,0.4)":"rgba(255,255,255,0.07)"}`, borderRadius:18, padding:"14px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:11, color: wi===currentWeek ? "#6366f1" : "#6b7280", fontWeight:700 }}>Week {wi+1} {wi===currentWeek&&"← 今週"}</div>
                        <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{week.theme}</div>
                      </div>
                      <div style={{ position:"relative", width:44, height:44 }}>
                        <ProgressRing pct={wPct} size={44} stroke={4} color={ wPct===100 ? "#10b981" : "#6366f1" } />
                        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#fff" }}>{wPct}%</div>
                      </div>
                    </div>
                    {week.tasks.map((task,ti) => {
                      const done = completedTasks[`${wi}-${ti}`];
                      return (
                        <div key={ti} onClick={()=>toggleTask(wi,ti)} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom: ti<week.tasks.length-1?"1px solid rgba(255,255,255,0.05)":"none", cursor:"pointer" }}>
                          <div style={{ width:20, height:20, borderRadius:5, border: done?"2px solid #6366f1":"2px solid rgba(255,255,255,0.15)", background: done?"#6366f1":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all 0.2s" }}>
                            {done && <span style={{ fontSize:11, color:"#fff" }}>✓</span>}
                          </div>
                          <span style={{ fontSize:13, color: done?"#374151":"#d1d5db", textDecoration: done?"line-through":"none", lineHeight:1.6 }}>{task}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== CHAT ===== */}
          {screen === "chat" && (
            <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 200px)" }}>
              <div style={{ background:"linear-gradient(135deg,rgba(236,72,153,0.15),rgba(168,85,247,0.15))", border:"1px solid rgba(236,72,153,0.25)", borderRadius:16, padding:"10px 14px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, background:"linear-gradient(135deg,#ec4899,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>👩‍💼</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:"#f9a8d4" }}>AIコーチ ミカ</div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>あなたの副業データを把握しています</div>
                </div>
                <div style={{ marginLeft:"auto", width:8, height:8, background:"#10b981", borderRadius:"50%", boxShadow:"0 0 8px #10b981" }} />
              </div>

              <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
                {chatMessages.map((m,i) => (
                  <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:8 }}>
                    {m.role==="assistant" && <div style={{ width:28, height:28, background:"linear-gradient(135deg,#ec4899,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>👩‍💼</div>}
                    <div style={{ maxWidth:"78%", padding:"10px 14px", borderRadius: m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", background: m.role==="user" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)", color:"#e5e7eb", fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display:"flex", gap:8 }}>
                    <div style={{ width:28, height:28, background:"linear-gradient(135deg,#ec4899,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>👩‍💼</div>
                    <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:"18px 18px 18px 4px", padding:"10px 16px" }}>
                      <div style={{ display:"flex", gap:4 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, background:"#6366f1", borderRadius:"50%", animation:`bounce 1.2s ${i*0.2}s infinite` }} />)}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={{ display:"flex", gap:6, marginBottom:8, overflowX:"auto", paddingBottom:4 }}>
                {["今週のアドバイスは？","モチベが上がらない…","次に何をすれば？","稼げるか不安です"].map(q => (
                  <button key={q} onClick={()=>setChatInput(q)} style={{ whiteSpace:"nowrap", padding:"6px 12px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:99, fontSize:11, color:"#a5b4fc", fontWeight:700, cursor:"pointer", flexShrink:0 }}>{q}</button>
                ))}
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="ミカに相談する..." style={{ flex:1, padding:"12px 14px", borderRadius:14, border:"2px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", fontSize:13, outline:"none", color:"#fff" }} />
                <button onClick={sendChat} style={{ width:46, height:46, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:14, color:"#fff", fontSize:20, cursor:"pointer", boxShadow:"0 4px 12px rgba(99,102,241,0.4)" }}>➤</button>
              </div>
            </div>
          )}

          {/* ===== PROGRESS ===== */}
          {screen === "progress" && roadmap && (
            <div>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff", marginBottom:16 }}>📈 進捗レポート</div>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:18, padding:"18px", marginBottom:14, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ position:"relative", width:80, height:80 }}>
                  <ProgressRing pct={overallPct} size={80} stroke={8} color={ overallPct>70?"#10b981":overallPct>40?"#6366f1":"#f59e0b" } />
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"#fff" }}>{overallPct}%</div>
                </div>
                <div>
                  <div style={{ fontSize:18, fontWeight:900, color:"#fff" }}>{roadmap.title}</div>
                  <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>目標: {roadmap.income}</div>
                  <div style={{ fontSize:12, color:"#6366f1", marginTop:4, fontWeight:700 }}>{totalDone}/{totalTasks} タスク完了</div>
                </div>
              </div>

              {roadmap.weeks.map((week, wi) => {
                const wDone = week.tasks.filter((_,j)=>completedTasks[`${wi}-${j}`]).length;
                const wPct = Math.round((wDone/week.tasks.length)*100);
                return (
                  <div key={wi} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"14px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:"#fff" }}>Week {wi+1}: {week.theme}</span>
                      <span style={{ fontSize:12, fontWeight:700, color: wPct===100?"#10b981":"#6366f1" }}>{wDone}/{week.tasks.length}</span>
                    </div>
                    <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:99, height:8 }}>
                      <div style={{ width:`${wPct}%`, height:"100%", background: wPct===100 ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius:99, transition:"width 0.8s" }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.15),rgba(99,102,241,0.15))", border:"1px solid rgba(16,185,129,0.25)", borderRadius:18, padding:"16px", marginTop:4 }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#fff", marginBottom:8 }}>💰 推定収益シミュレーション</div>
                {[
                  { label:"現在の推定収益", value:`¥${totalIncome.toLocaleString()}`, color:"#34d399" },
                  { label:"全タスク完了後", value:`¥${(totalTasks*800).toLocaleString()}`, color:"#6366f1" },
                  { label:"3ヶ月後の目標", value:roadmap.income, color:"#fbbf24" },
                ].map(s => (
                  <div key={s.label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:12, color:"#9ca3af" }}>{s.label}</span>
                    <span style={{ fontSize:14, fontWeight:900, color:s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={{ position:"fixed", bottom:0, width:"100%", maxWidth:430, background:"rgba(8,8,16,0.95)", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", backdropFilter:"blur(20px)", zIndex:100 }}>
          {[
            { id:"home", icon:"🏠", label:"ホーム" },
            { id:"tasks", icon:"📋", label:"タスク" },
            { id:"chat", icon:"💬", label:"コーチ" },
            { id:"progress", icon:"📈", label:"進捗" },
          ].map(t => (
            <button key={t.id} onClick={()=>setScreen(t.id)} style={{ flex:1, padding:"10px 0 12px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:20 }}>{t.icon}</span>
              <span style={{ fontSize:9, fontWeight:700, color: screen===t.id?"#6366f1":"#4b5563" }}>{t.label}</span>
              {screen===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:"#6366f1", boxShadow:"0 0 6px #6366f1" }} />}
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}
