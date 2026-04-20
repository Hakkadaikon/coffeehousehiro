import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import { Mail, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDESHOW_IMAGES = [
  '/images/IMAGE_1.jpeg',
  '/images/IMAGE_2.jpeg',
  '/images/IMAGE_3.jpeg',
  '/images/IMAGE_4.jpeg',
  '/images/IMAGE_5.jpeg',
  '/images/IMAGE_6.jpeg',
  '/images/IMAGE_7.jpeg',
  '/images/IMAGE_8.jpeg',
  '/images/IMAGE_9.jpeg',
  '/images/IMAGE_10.jpeg',
];

function Slideshow() {
  const n = SLIDESHOW_IMAGES.length;
  // offset: 各スライドの現在位置 (単位: スライド幅)。0 = 画面内、正 = 右、負 = 左
  const [offsets, setOffsets] = useState<number[]>(() => SLIDESHOW_IMAGES.map((_, i) => i));

  const shift = useCallback((dir: 1 | -1) => {
    setOffsets(prev => prev.map(o => {
      const next = o - dir;
      // -n+1 〜 n-1 の範囲に巻き戻す（-n になったら +n、n になったら -n）
      if (next <= -n) return next + n;
      if (next >= n) return next - n;
      return next;
    }));
  }, [n]);


  // 現在画面に表示されているスライドのインデックス
  const current = offsets.indexOf(0);

  const goTo = useCallback((targetIdx: number) => {
    const steps = offsets[targetIdx];
    if (steps === 0) return;
    const dir = steps > 0 ? 1 : -1;
    const count = Math.abs(steps) <= n / 2 ? Math.abs(steps) : n - Math.abs(steps);
    const actualDir = Math.abs(steps) <= n / 2 ? dir : -dir as 1 | -1;
    // count回分まとめてシフト
    setOffsets(prev => prev.map(o => {
      let next = o - actualDir * count;
      if (next <= -n) next += n;
      if (next >= n) next -= n;
      return next;
    }));
  }, [offsets, n]);

  return (
    <div className="relative w-full select-none bg-espresso overflow-hidden" style={{ height: '60vw', maxHeight: '75vh' }}>
      {/* Slides */}
      {SLIDESHOW_IMAGES.map((src, idx) => (
        <div
          key={idx}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translateX(${offsets[idx] * 100}%)`,
            transition: 'transform 600ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        >
          <img
            src={src}
            alt={`Gallery ${idx + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={() => shift(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-espresso/60 hover:bg-espresso/90 text-paper p-2 transition-colors z-10"
        aria-label="前の画像"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => shift(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-espresso/60 hover:bg-espresso/90 text-paper p-2 transition-colors z-10"
        aria-label="次の画像"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDESHOW_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${idx === current ? 'bg-paper' : 'bg-paper/40'}`}
            aria-label={`画像 ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-paper text-espresso font-sans">
      
      {/* Navigation (Minimalist) */}
      <nav className="absolute top-0 w-full z-50 py-6 px-6 md:px-12 flex justify-between items-center mix-blend-difference text-paper">
        <div className="font-serif text-lg tracking-widest flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 opacity-90 invert brightness-0" onError={(e) => e.currentTarget.style.display = 'none'} />
          coffee house ヒロ
        </div>
        <div className="hidden md:flex gap-8 text-xs font-medium tracking-[0.2em] uppercase">
          <a href="#about" className="hover:text-caramel transition-colors">Concept</a>
          <a href="#menu" className="hover:text-caramel transition-colors">Menu</a>
          <a href="#order" className="hover:text-caramel transition-colors">Order</a>
          <a href="#access" className="hover:text-caramel transition-colors">Access</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden bg-espresso text-paper">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1920&auto=format&fit=crop" 
            alt="Coffee roasting" 
            className="w-full h-full object-cover opacity-40 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-transparent to-espresso/50"></div>
        </div>
        
        <div className="max-w-6xl w-full mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="w-full flex flex-col md:flex-row md:items-end gap-8">
            <div className="flex-1">
              <div className="mb-12">
                <img
                  src="/logo.png"
                  alt="coffee house ヒロ"
                  className="h-[500px] w-auto invert brightness-0 opacity-90"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h1 className="font-serif text-[clamp(20px,4vw,56px)] leading-[1.5] mb-8 tracking-wider">
                <span className="block mb-3 whitespace-nowrap">平日はサラリーマン、</span>
                <span className="block whitespace-nowrap text-paper-dim">週末はロースター。</span>
              </h1>
              <p className="text-paper-dim tracking-[0.2em] font-light text-sm md:text-base border-l border-caramel pl-4 py-1">
                スペシャルティコーヒーの舞台へ
              </p>
            </div>
            <div className="flex-shrink-0 md:self-end">
              <img src="/images/logo.jpg" alt="coffee house ヒロ" className="h-[500px] w-auto object-contain opacity-90" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Concept */}
      <section id="about" className="py-32 px-6 md:px-12 bg-paper relative">
        <div className="absolute top-0 left-12 w-px h-24 bg-espresso/10 hidden md:block"></div>
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
            <h2 className="font-serif text-3xl md:text-4xl mb-16 md:mb-24 text-center tracking-widest leading-loose">
              こだわりの一杯を、<br className="md:hidden" />手作りの赤い小屋から。
            </h2>
            
            <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
              <div className="relative aspect-[4/5] overflow-hidden group">
                <div className="absolute inset-0 bg-espresso/5 z-10 group-hover:bg-transparent transition-colors duration-700"></div>
                <img 
                  src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop" 
                  alt="Brewing coffee" 
                  className="w-full h-full object-cover filter grayscale-[40%] contrast-[1.1] scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-8 font-serif leading-loose text-roast tracking-wide">
                <p>
                  月曜日から金曜日は、ごく普通のサラリーマン。しかし土日・祝日になると、岡山県倉敷市の小さな赤い小屋で、情熱を持ったロースターへと姿を変えます。
                </p>
                <p>
                  ブラックコーヒーとアイスコーヒーを専門に扱っており、豆本来の個性を引き出す焙煎を丹念に行っています。
                </p>
                <div className="pt-8 border-t border-espresso/10">
                  <p className="text-[10px] tracking-widest uppercase mb-2 text-espresso/40 font-sans">Qualification</p>
                  <p className="font-serif text-sm tracking-widest">J.C.Q.A. 認定コーヒーインストラクター 2級</p>
                  <p className="font-sans text-xs mt-2 text-roast/60 tracking-wider">たしかな知識と技術で、最高の1杯をお届けします。</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Slideshow */}
      <section className="bg-paper">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn}>
          <Slideshow />
        </motion.div>
      </section>

      {/* Menu - Minimalist Classic Cafe Style */}
      <section id="menu" className="py-32 px-6 md:px-12 bg-[#EFECE5]">
        <div className="max-w-3xl mx-auto relative">
          <div className="text-center mb-24">
            <h2 className="font-serif text-4xl tracking-widest mb-4">商品一覧</h2>
            <p className="text-xs tracking-[0.2em] text-espresso/50 uppercase">Menu</p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-24">
            
            {/* Coffee */}
            <motion.div variants={fadeIn} className="relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-espresso/20 pb-6 mb-10 gap-4">
                <h3 className="font-serif text-2xl tracking-widest">スペシャルティコーヒー</h3>
                <span className="text-sm tracking-[0.1em] text-roast/60 font-serif">ブレンド / シングルオリジン</span>
              </div>
              
              <div className="space-y-6 font-serif text-lg text-roast lg:px-8">
                <div className="flex items-baseline justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="tracking-widest">100g</span>
                    <span className="text-[11px] text-roast/50 font-sans tracking-widest">（粉・豆）</span>
                  </div>
                  <div className="flex-grow border-b border-dotted border-espresso/20 mx-4 md:mx-8 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <span className="tracking-widest">¥450<span className="text-sm ml-1">〜</span></span>
                </div>
                <div className="flex items-baseline justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="tracking-widest">200g</span>
                    <span className="text-[11px] text-roast/50 font-sans tracking-widest">（粉・豆）</span>
                  </div>
                  <div className="flex-grow border-b border-dotted border-espresso/20 mx-4 md:mx-8 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <span className="tracking-widest">¥850<span className="text-sm ml-1">〜</span></span>
                </div>
              </div>
              <p className="text-[11px] text-roast/50 mt-8 lg:px-8 tracking-widest">※ 焙煎度：浅煎り・中煎り・中深煎り からお選びいただけます。</p>
            </motion.div>

            {/* Peanuts */}
            <motion.div variants={fadeIn} className="relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-espresso/20 pb-6 mb-10 gap-4">
                <h3 className="font-serif text-2xl tracking-widest">自家焙煎 素焼きピーナッツ</h3>
                <span className="text-sm tracking-[0.1em] text-roast/60 font-serif">コーヒーのお供に</span>
              </div>
              
              <div className="space-y-6 font-serif text-lg text-roast lg:px-8">
                <div className="flex items-baseline justify-between group">
                  <span className="tracking-widest">200g</span>
                  <div className="flex-grow border-b border-dotted border-espresso/20 mx-4 md:mx-8 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <span className="tracking-widest">¥100</span>
                </div>
              </div>
            </motion.div>

          </motion.div>

          <motion.div variants={fadeIn} className="mt-24 pt-12 border-t border-espresso/10 text-center">
             <p className="text-[13px] font-sans tracking-widest text-roast/80">
               送料：2袋ごとに <span className="font-serif text-lg mx-1 text-espresso">¥200</span> 頂戴いたします。
             </p>
          </motion.div>
        </div>
      </section>

      {/* How to Order */}
      <section id="order" className="py-32 px-6 md:px-12 bg-espresso text-paper">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-serif text-4xl tracking-widest mb-4">ご注文方法</h2>
            <p className="text-xs tracking-[0.2em] text-paper/40 uppercase">How to order</p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-8 mb-24 font-serif relative">
            <div className="hidden md:block absolute top-[1.5rem] left-0 w-full h-px bg-paper/10"></div>
            {[
              { num: 'I', title: 'メールにて承ります', desc: 'ご希望の商品名・数量（コーヒーの場合は状態や焙煎度）をお知らせください。' },
              { num: 'II', title: 'お支払いのご案内', desc: '折り返し、商品代金と送料の合計、およびお支払い先情報（PayPay・楽天Pay・銀行振込）をご連絡します。' },
              { num: 'III', title: '焙煎と発送', desc: 'ご入金確認後の週末に、丁寧に焙煎を行い新鮮な状態でご指定先へ発送いたします。' }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 md:px-4">
                <div className="w-12 h-12 bg-[#201814] border border-paper/10 flex items-center justify-center text-paper/60 font-serif text-lg mb-8 mx-auto md:mx-0">
                  {step.num}
                </div>
                <h3 className="text-[17px] tracking-widest mb-4 text-center md:text-left">{step.title}</h3>
                <p className="text-[13px] text-paper/50 leading-loose text-center md:text-left tracking-wide opacity-90">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#241A16] p-10 md:p-20 text-center relative overflow-hidden">
            <div className="absolute -inset-1 border-[0.5px] border-paper/5 m-4 pointer-events-none"></div>
            
            <Mail className="w-6 h-6 text-paper/30 mx-auto mb-8" />
            <p className="font-sans text-[10px] tracking-[0.3em] text-paper/40 mb-10 uppercase">ご注文専用・お問い合わせ枠</p>
            <a href="mailto:coffeehousehiro@gmail.com" className="font-serif text-xl md:text-3xl text-paper hover:text-caramel transition-colors tracking-widest block break-all">
              coffeehousehiro@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer / Access */}
      <footer id="access" className="bg-[#120D0B] text-paper pt-24 pb-12 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 md:gap-8 mb-24">
            
            <div>
              <div className="mb-10">
                <img src="/logo.png" alt="Logo" className="w-20 opacity-40 invert brightness-0" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <p className="font-serif text-lg tracking-widest mb-8 text-paper/90">coffee house ヒロ</p>
              <div className="space-y-3 text-[13px] text-paper/50 tracking-widest font-light mb-12">
                <p>〒712-8046</p>
                <p>岡山県倉敷市福田町福田 2370-6</p>
              </div>

              <a href="https://www.instagram.com/coffee_house_hiro" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-paper/40 hover:text-paper transition-colors tracking-widest text-[13px]">
                <Instagram className="w-4 h-4" />
                <span>@coffee_house_hiro</span>
              </a>
            </div>

            <div className="font-serif leading-loose space-y-12 pr-4">
              <div>
                <h4 className="text-[10px] font-sans tracking-[0.3em] text-caramel/70 mb-5 uppercase">Business Hours</h4>
                <p className="tracking-wider text-[14px] text-paper/80">
                  <span className="text-paper/40 text-xs mr-3 font-sans">MON-FRI</span> サラリーマン<br/>
                  <span className="text-paper/40 text-xs mr-3 font-sans">SAT-SUN</span> ロースター・バリスタ
                </p>
                <p className="text-[11px] text-paper/40 mt-3 tracking-widest font-sans">（ブラックコーヒー、アイスコーヒー専門）</p>
              </div>

              <div>
                <h4 className="text-[10px] font-sans tracking-[0.3em] text-caramel/70 mb-5 uppercase">Visit Details</h4>
                <p className="text-[13px] tracking-wide text-paper/70">
                  1組4名様までの完全予約制となっております。<br/>
                  ご来店をご希望の際は、Instagram等のメッセージより事前にご連絡ください。赤い小屋にて、実際にコーヒーをお召し上がりいただけます。
                </p>
              </div>
            </div>

          </div>
          
          <div className="text-center font-sans tracking-[0.3em] text-[9px] text-paper/20 uppercase border-t border-white/5 pt-12">
            &copy; {new Date().getFullYear()} coffee house hiro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

