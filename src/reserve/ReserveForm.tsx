import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ExternalLink } from "../components/ExternalLink.tsx";
import { INSTAGRAM_URL, LINE_CHAT_URL, VISIT } from "../content/shop.ts";
import { Choice, headingCls, inputCls, TextField } from "../order-form/controls.tsx";
import { useCopy } from "../order-form/useCopy.ts";
import { useOpenOnLink } from "../order-form/useOpenOnLink.ts";
import {
	buildReserveMessage,
	type Day,
	formatDay,
	isHoliday,
	isRestDay,
	monthCells,
	startTimes,
} from "./visit.ts";

/** 先の月は、今月を含めて何か月分まで選べるか */
const MONTHS_AHEAD = 3;
const GUESTS = Array.from({ length: VISIT.maxGuests }, (_, i) => `${i + 1}名`);
const MONTH_NAMES =
	"JANUARY FEBRUARY MARCH APRIL MAY JUNE JULY AUGUST SEPTEMBER OCTOBER NOVEMBER DECEMBER".split(
		" ",
	);
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const REST_BG = "bg-[#F5D36B]";
const WEEKDAY_BG = "bg-[#BDE8A9]";
const hoursLabel = ([open, close]: [number, number]) => `${open}時〜${close}時`;

const sameDay = (a: Day | null, b: Day) => a?.y === b.y && a.m === b.m && a.d === b.d;
const before = (a: Day, b: Day) => a.y * 10000 + a.m * 100 + a.d < b.y * 10000 + b.m * 100 + b.d;

/**
 * かんたん来店予約フォーム。日付・時刻・人数を選ぶと、LINE で送る予約のメッセージができる。
 * 普段は閉じておき、ページ内リンク(#reserve-form)で来たときに開く。
 */
export function ReserveForm() {
	const [open, setOpen] = useOpenOnLink("#reserve-form");
	// 今日はブラウザで決める。ビルド時に書き出す HTML と食い違わないよう、最初は空にしておく
	const [today, setToday] = useState<Day | null>(null);
	useEffect(() => {
		const t = new Date();
		setToday({ y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() });
	}, []);
	const [offset, setOffset] = useState(0);
	const [day, setDay] = useState<Day | null>(null);
	const [time, setTime] = useState("");
	const [guests, setGuests] = useState(GUESTS[Math.min(1, GUESTS.length - 1)]);
	const [name, setName] = useState("");
	const [note, setNote] = useState("");

	const times = day ? startTimes(day) : [];
	// スライダーは必ずどこかを指すので、時刻を選ぶ前はその日のいちばん早い時刻にしておく
	const pickedTime = times.includes(time) ? time : (times[0] ?? "");
	const ready = Boolean(day && pickedTime && name.trim());
	const text =
		day && pickedTime
			? buildReserveMessage({
					day,
					time: pickedTime,
					guests: Number.parseInt(guests, 10),
					name: name.trim(),
					note: note.trim(),
				})
			: "";
	const { copied, copy, previewRef } = useCopy(text);

	return (
		<details
			id="reserve-form"
			open={open}
			onToggle={(e) => setOpen(e.currentTarget.open)}
			className="group mt-10 bg-paper text-espresso shadow-2xl shadow-black/40 scroll-mt-8"
		>
			<summary className="flex items-center justify-between gap-4 p-5 md:p-10 lg:p-12 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
				<div>
					<h3 className="font-serif text-2xl md:text-[32px] tracking-wider md:tracking-widest mb-3">
						<span className="inline-block">かんたん</span>
						<span className="inline-block">来店予約フォーム</span>
					</h3>
					<p className="text-sm md:text-base text-roast/80 text-pretty">
						<span className="inline-block">日付と時刻を選ぶだけで、</span>
						<span className="inline-block">LINEで送る来店予約のメッセージができあがります。</span>
					</p>
				</div>
				<span className="shrink-0 flex items-center gap-1 text-sm md:text-base text-caramel">
					<span className="group-open:hidden">開く</span>
					<span className="hidden group-open:inline">閉じる</span>
					<ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
				</span>
			</summary>

			<div className="px-5 pb-5 md:px-10 md:pb-10 lg:px-12 lg:pb-12">
				<p className="text-sm md:text-base text-roast/85 tracking-wide leading-[1.9] mb-8 text-pretty">
					<span className="inline-block">赤い小屋で、</span>
					<span className="inline-block">実際にコーヒーを</span>
					<span className="inline-block">お召し上がりいただけます。</span>
					<span className="inline-block">ご来店は1組{VISIT.maxGuests}名様までの</span>
					<span className="inline-block">完全予約制です。</span>
				</p>

				{/* 注意書きは、1列のときは日付の前、2列のときはカレンダーの下の空きに置く */}
				<div className="grid lg:grid-cols-2 lg:grid-rows-[auto_1fr] gap-10 lg:gap-x-12 lg:gap-y-8">
					<ul className="lg:col-start-1 lg:row-start-2 space-y-2 text-sm text-roast/85 leading-[1.9] tracking-wide text-pretty list-disc pl-5 marker:text-caramel">
						<li>
							営業日・お休みの日は、
							<ExternalLink
								href={INSTAGRAM_URL}
								className="underline underline-offset-4 decoration-roast/40 hover:text-espresso"
							>
								Instagram
							</ExternalLink>
							でお知らせしています。ご予約の前にご確認ください。
						</li>
						<li>
							このフォームでは、予約の空き状況は分かりません。お送りいただいたメッセージを見て、店主が空き状況をLINEでお返事します。ご予約は、そのお返事で確定します。
						</li>
						<li>ご予約いただける時間帯は原則で、日によって変わることがあります。</li>
					</ul>

					<div className="lg:row-start-1 w-full max-w-md">
						<h4 className={headingCls}>1. 日付を選ぶ</h4>
						{today ? (
							<Calendar
								today={today}
								offset={offset}
								onOffsetChange={setOffset}
								selected={day}
								onSelect={setDay}
							/>
						) : (
							<div className="aspect-square" />
						)}
						<ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-roast/85">
							<li className="flex items-center gap-2">
								<span className={`w-4 h-4 rounded-full ${REST_BG}`} />
								土日・祝日　{hoursLabel(VISIT.holidayHours)}
							</li>
							<li className="flex items-center gap-2">
								<span className={`w-4 h-4 rounded-full ${WEEKDAY_BG}`} />
								平日　{hoursLabel(VISIT.weekdayHours)}
							</li>
						</ul>
					</div>

					<div className="lg:col-start-2 lg:row-span-2">
						<h4 className={headingCls}>2. 時刻と人数を選ぶ</h4>
						<p className="text-sm md:text-base text-roast/80 mb-4 min-h-6">
							{day ? `${formatDay(day)}` : "カレンダーから日付を選んでください。"}
						</p>
						{day && <TimePicker times={times} value={pickedTime} onChange={setTime} />}
						<Choice
							legend="人数"
							options={GUESTS}
							value={guests}
							onChange={setGuests}
							cols="grid-cols-4"
						/>
						<TextField
							label="お名前"
							value={name}
							invalid={false}
							onChange={setName}
							autoComplete="name"
						/>
						<label className="block mb-6">
							<span className="block text-sm md:text-base text-roast/80 mb-1.5">
								ご要望（任意）
							</span>
							<textarea
								value={note}
								onChange={(e) => setNote(e.target.value)}
								rows={3}
								className={`${inputCls} h-auto py-2 resize-none`}
							/>
						</label>

						<h4 className={headingCls}>3. メッセージを送る</h4>
						<textarea
							ref={previewRef}
							readOnly
							value={text}
							placeholder="日付と時刻を選ぶと、ここに予約のメッセージが表示されます。"
							aria-label="予約のメッセージのプレビュー"
							className="w-full h-56 font-sans text-sm leading-relaxed bg-white/70 border border-espresso/15 p-4 resize-none"
						/>
						{!ready && (
							<p className="text-xs md:text-sm text-roast/70 mt-2">
								日付・時刻・お名前を入力すると送信できます。
							</p>
						)}
						<p className="text-xs md:text-sm text-roast/70 mt-3 text-pretty">
							お知らせいただいたお名前は、ご来店の予約に関するご連絡にだけ使います。詳しくは
							<a
								href="/legal#privacy"
								className="underline underline-offset-4 decoration-roast/40 hover:text-espresso"
							>
								プライバシーポリシー
							</a>
							をご覧ください。
						</p>
						<ExternalLink
							href={ready ? LINE_CHAT_URL : undefined}
							onClick={ready ? copy : undefined}
							aria-disabled={!ready}
							className={`mt-4 w-full h-14 flex items-center justify-center bg-[#06C755] text-white font-bold tracking-widest md:text-lg shadow-lg shadow-[#06C755]/20 transition-opacity ${
								ready ? "hover:bg-[#05b14c]" : "opacity-40 pointer-events-none"
							}`}
						>
							コピーしてLINEを開く
						</ExternalLink>
						<p className="text-xs md:text-sm text-roast/70 mt-2 text-pretty">
							メッセージをコピーして、LINEのトーク画面を開きます。入力欄に貼り付けて送信してください。
						</p>
						<button
							type="button"
							onClick={copy}
							disabled={!text}
							className="mt-3 w-full h-12 border border-espresso/30 hover:border-espresso transition-colors disabled:opacity-40"
						>
							メッセージをコピーする
						</button>
						<p aria-live="polite" className="text-xs md:text-sm text-caramel mt-1 h-4">
							{copied ? "コピーしました" : ""}
						</p>
					</div>
				</div>
			</div>
		</details>
	);
}

/** ご来店の時刻。スライダーで30分ごとに動かせ、1時間ごとの時刻はボタンでも選べる */
function TimePicker({
	times,
	value,
	onChange,
}: {
	times: string[];
	value: string;
	onChange: (time: string) => void;
}) {
	const index = times.indexOf(value);
	return (
		<fieldset className="mb-5">
			<legend className="text-sm md:text-base text-roast/80 mb-2">ご来店の時刻</legend>
			<p className="font-serif text-3xl tabular-nums tracking-wider mb-1" aria-hidden>
				{value}
				<span className="text-base text-roast/70 ml-1">〜</span>
			</p>
			<input
				type="range"
				min={0}
				max={times.length - 1}
				step={1}
				value={index}
				onChange={(e) => onChange(times[Number(e.target.value)])}
				aria-label="ご来店の時刻（30分ごと）"
				aria-valuetext={value}
				className="w-full h-8 accent-caramel cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel"
			/>
			<div className="flex justify-between text-xs text-roast/60 tabular-nums mb-3">
				<span>{times[0]}</span>
				<span>{times.at(-1)}</span>
			</div>
			<div className="grid grid-cols-5 gap-2">
				{times
					.filter((t) => t.endsWith(":00"))
					.map((t) => (
						<button
							key={t}
							type="button"
							aria-pressed={value === t}
							onClick={() => onChange(t)}
							className={`h-11 border text-sm md:text-base tabular-nums transition-colors ${
								value === t
									? "bg-espresso text-paper border-espresso"
									: "border-espresso/20 hover:border-espresso/50"
							}`}
						>
							{t}
						</button>
					))}
			</div>
		</fieldset>
	);
}

/** 月のカレンダー。平日と休日を色で分け、今日より前の日は選べない */
function Calendar({
	today,
	offset,
	onOffsetChange,
	selected,
	onSelect,
}: {
	today: Day;
	offset: number;
	onOffsetChange: (n: number) => void;
	selected: Day | null;
	onSelect: (day: Day) => void;
}) {
	const first = new Date(today.y, today.m - 1 + offset, 1);
	const [y, m] = [first.getFullYear(), first.getMonth() + 1];
	const nav =
		"w-11 h-11 flex items-center justify-center rounded-full border border-espresso/20 hover:border-espresso disabled:opacity-25 disabled:hover:border-espresso/20";
	return (
		<div>
			<div className="flex items-center justify-between mb-5">
				<button
					type="button"
					className={nav}
					aria-label="前の月"
					disabled={offset === 0}
					onClick={() => onOffsetChange(offset - 1)}
				>
					<ChevronLeft className="w-5 h-5" />
				</button>
				<p className="flex items-end gap-3" aria-live="polite">
					<span className="text-5xl md:text-6xl font-bold leading-none tabular-nums">{m}</span>
					<span className="flex flex-col items-start gap-1">
						<span className="px-2.5 py-0.5 rounded-full bg-espresso text-paper text-xs font-bold tabular-nums">
							{y}
						</span>
						<span className="text-lg md:text-xl font-bold tracking-wider leading-none">
							{MONTH_NAMES[m - 1]}
						</span>
					</span>
					<span className="sr-only">{`${y}年${m}月`}</span>
				</p>
				<button
					type="button"
					className={nav}
					aria-label="次の月"
					disabled={offset === MONTHS_AHEAD - 1}
					onClick={() => onOffsetChange(offset + 1)}
				>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
			<div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
				{WEEKDAYS.map((w, i) => (
					<span
						key={w}
						aria-hidden
						className={`text-[11px] sm:text-xs font-bold tracking-wider pb-1 ${
							i === 0 ? "text-[#D2453F]" : i === 6 ? "text-[#3D74C9]" : ""
						}`}
					>
						{w}
					</span>
				))}
				{monthCells(y, m).map((c) => {
					const past = before(c, today);
					const rest = isRestDay(c);
					const wd = new Date(c.y, c.m - 1, c.d).getDay();
					const color =
						wd === 0 || isHoliday(c) ? "text-[#D2453F]" : wd === 6 ? "text-[#3D74C9]" : "";
					if (!c.inMonth) {
						return (
							<span
								key={`${c.m}-${c.d}`}
								aria-hidden
								className="aspect-square flex items-center justify-center font-bold text-espresso/15 tabular-nums"
							>
								{c.d}
							</span>
						);
					}
					const isSel = sameDay(selected, c);
					return (
						<button
							key={`${c.m}-${c.d}`}
							type="button"
							disabled={past}
							aria-pressed={isSel}
							aria-label={`${formatDay(c)}　${rest ? "休日" : "平日"}${past ? "（選べません）" : ""}`}
							onClick={() => onSelect(c)}
							className={`aspect-square rounded-full flex items-center justify-center font-bold sm:text-lg tabular-nums transition ${
								past
									? "text-espresso/20"
									: `${rest ? REST_BG : WEEKDAY_BG} ${color} hover:brightness-95 ${
											isSel ? "ring-[3px] ring-espresso ring-offset-2 ring-offset-paper" : ""
										}`
							} focus-visible:outline-2 focus-visible:outline-caramel focus-visible:outline-offset-2`}
						>
							{c.d}
						</button>
					);
				})}
			</div>
		</div>
	);
}
