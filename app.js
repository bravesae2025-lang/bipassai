const LEVEL_DESCRIPTIONS = {
  easy:      'Beginner — most aggressive simplification, missing apostrophes, wrong plurals, casual shortcuts',
  medium:    'Student — moderate simplification, occasional missing comma or apostrophe',
  hard:      'Academic — light touch, removes obvious AI words only',
  customize: 'Custom — pick exactly which human traits to add',
};

const LEVEL_INDEX = { easy: 0, medium: 1, hard: 2, customize: 3 };

const HUMANIZE_PROMPTS = {
  easy: `Rewrite the following text so it sounds like a beginner or non-native English speaker wrote it. This must be completely undetectable by AI detectors. Follow every rule strictly.

NO DASHES — #1 AI tell:
NEVER write em dashes (—) or use a hyphen as an em dash (word - word mid-sentence). These are the clearest signal AI detectors scan for. If you feel like using a dash, use a comma, start a new sentence, or just say it plainly. Zero dashes anywhere in the text.

WRITE NORMAL TEXT — not conversational or spoken:
Write as a normal written piece, not like someone talking out loud. Casual words like "like", "I guess", "honestly" should only slip in once or twice as natural mistakes — not throughout. This is written text, not a speech or chat message.

REPLACE AI WORDS — statistically proven AI signals, swap every one:
"utilize" → "use" | "assist" → "help" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while" | "purchase" → "buy" | "commence" → "start" | "sorts" → "type"
"leverage" → "use" | "facilitate" → "help" | "underscore" → "show" | "constitute" → "make up" | "mitigate" → "reduce" | "foster" → "help" | "harness" → "use" | "empower" → "help" | "encompass" → "include" | "illuminate" → "show" | "bolster" → "strengthen" | "spearhead" → "lead"
"crucial" → "really important" | "significant/significantly" → "big" or "a lot" | "comprehensive" → "complete" | "robust" → "strong" | "pivotal" → "key" | "meticulous" → "careful" | "intricate" → "complex" | "palpable" → "real" | "paramount" → "most important" | "multifaceted" → "complicated" | "groundbreaking" → "new" | "transformative" → "life-changing" | "seamless" → "smooth"
"severity" → "how bad it is" | "scarcity/scarcities" → "shortage" | "prevalence" → "how common it is" | "magnitude" → "how big it is" | "methodology" → "method" | "realm" → "area" | "tapestry" → "mix" | "ultimately" → "in the end" | "fundamental" → "basic" | "in terms of" → "about"

COMMAS — only where clearly needed:
Use commas in lists and after long openers (5+ words). Skip them when in doubt — missing a comma is fine. Do NOT put commas after short starters like "But", "So", "And" at the beginning of a sentence. Fewer commas is better than too many.

SENTENCE LENGTH — most important:
Every paragraph must have at least one sentence under 7 words AND at least one sentence over 28 words. Never write 3 sentences in a row of similar length. Example: "That was hard. I think maybe I didn't study enough and also I was tired from work the day before so my brain just wasn't working right. Not good."
Never open two sentences in a row with the same word. Mix sentence types within each paragraph: a fragment, a run-on, a normal one — not three normal declarative sentences in a row.

WORD CHOICE — PERPLEXITY:
Pick the simplest first-instinct word even if slightly imprecise: "the whole thing broke" not "the system failed entirely", "it went bad fast" not "it deteriorated rapidly", "it was pretty hard" not "it proved significantly challenging". First instinct beats the correct polished choice.

SPELLING MISTAKES — scale with text length: roughly 1 mistake per 35 words. Short text = 2-3, long text = many more. Spread them evenly, don't cluster:
- "definately" (definitely), "recieve" (receive), "wierd" (weird), "beleive" (believe), "alot" (a lot), "occured" (occurred), "probly" or "prolly" (probably), "teh" (the) once in a while
- Phonetic shortcuts count too: "gonna", "wanna", "cuz", "kinda" — use these freely

WRONG PLURAL "S" — scale with length: roughly 1 wrong plural per 20 words. Short text = several, long text = many. Use them freely:
"informations", "advices", "homeworks", "furnitures", "equipments", "knowledges", "feedbacks", "researches", "works" (meaning homework)

TENSE MISTAKES — use regularly:
"yesterday I go", "she tell me", "I seen it", "we was there", "he don't know", "I have went"

PUNCTUATION ERRORS:
- Missing comma before "but" and "and" sometimes
- Comma splice: "it was good, I really liked it"
- Write "dont" "cant" "its" "wont" without apostrophe a couple times
- No semicolons. No parentheses. No colons. No em dashes.

OTHER TRAITS:
- Repeat the same idea twice in different words
- Simple words only: "good" not "beneficial", "use" not "utilize"
- "I think" "maybe" "I guess" "like" scattered through
- Jump between thoughts without connecting them
- Uneven paragraphs — one might be 1 sentence, another 5
- Some sentences starting with And or But or So

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, in today's world, one must, to summarize, cornerstone, game-changing, invaluable, synergy, impactful, plays a crucial role, serves as a testament

No passive voice. No clean topic sentences. No conclusion.
Return only the rewritten text, nothing else.`,

  medium: `Rewrite the following text so it sounds like a real average student wrote it quickly without editing. This must be completely undetectable by AI detectors. Follow every rule strictly.

NO DASHES — #1 AI tell:
NEVER write em dashes (—) or use a hyphen as an em dash (word - word mid-sentence). These are the clearest signal AI detectors scan for. If you feel like using a dash, use a comma, start a new sentence, or just say it plainly. Zero dashes anywhere in the text.

WRITE NORMAL TEXT — not conversational:
Write as a normal written piece. Casual filler words like "honestly", "like", "I mean" should only slip in once or twice as a natural mistake — not scattered throughout. This is written text, not talking out loud.

REPLACE AI WORDS — statistically proven AI signals, swap every one:
"utilize" → "use" | "assist" → "help" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while" | "purchase" → "buy" | "commence" → "start" | "sorts" → "type"
"leverage" → "use" | "facilitate" → "help" | "underscore" → "show" | "constitute" → "make up" | "mitigate" → "reduce" | "foster" → "help" | "harness" → "use" | "empower" → "help" | "encompass" → "include" | "illuminate" → "show" | "bolster" → "strengthen" | "spearhead" → "lead"
"crucial" → "really important" | "significant/significantly" → "big" or "a lot" | "comprehensive" → "complete" | "robust" → "strong" | "pivotal" → "key" | "meticulous" → "careful" | "intricate" → "complex" | "palpable" → "real" | "paramount" → "most important" | "multifaceted" → "complicated" | "groundbreaking" → "new" | "transformative" → "life-changing" | "seamless" → "smooth"
"severity" → "how bad it is" | "scarcity/scarcities" → "shortage" | "prevalence" → "how common it is" | "magnitude" → "how big it is" | "methodology" → "method" | "realm" → "area" | "tapestry" → "mix" | "ultimately" → "in the end" | "fundamental" → "basic" | "in terms of" → "about"

COMMAS — only where clearly needed:
Use commas in lists and after long openers (5+ words). Skip them when in doubt. Do NOT place a comma after short starters like "But", "So", "And" at the start of a sentence. Fewer commas is more natural than too many.

SENTENCE LENGTH — biggest detection signal — mandatory:
Every paragraph must have at least one sentence ONLY 4-8 words (fragment is fine) AND at least one sentence 30+ words that keeps going. Never 3 sentences in a row of similar length. Example: "That was the whole point. I think what happened was the teacher never really explained it properly so everyone just kind of guessed and hoped for the best. Not great."
Never open two consecutive sentences with the same word or same grammatical structure. Within each paragraph mix at least two sentence types: fragment, run-on, or normal declarative — not all the same type.

WORD CHOICE — PERPLEXITY:
Use the first natural word you'd actually think of, not the most precise one: "the idea kind of worked" not "the approach proved partially effective", "it got messy" not "it became increasingly complex", "the whole point was" not "the fundamental objective was". Students don't agonise over word choice.

SPELLING MISTAKES — scale with text length: roughly 1 mistake per 80 words. Short text = 1-2, long text = more. Spread evenly:
"definately" (definitely), "recieve" (receive), "seperate" (separate), "occured" (occurred), "wierd" (weird)
Casual shortcuts also count: "gonna", "wanna", "kinda", "prolly" — use them where they fit

WRONG PLURAL "S" — scale with length: roughly 1 wrong plural per 35 words. Spread naturally:
"informations", "advices", "feedbacks", "homeworks", "researches"

COMMAS — use them normally, but imperfectly:
Students use commas in lists and after openers fine. What they miss:
- Missing comma before "but" / "and" / "because" a few times: "I wanted to do it but I ran out of time"
- Comma splice once or twice: "it made sense, everyone got it fast"
- Chain clauses with commas: "the class ran long, we covered a lot, I didn't follow all of it"
- Do NOT remove commas from lists or after introductory words

OTHER PUNCTUATION:
- Write "dont" "cant" "its" "wont" without apostrophe once or twice
- No semicolons. No parentheses. No colons mid-sentence. No em dashes.

CAPITALIZATION:
- Miss a capital at the start of one sentence somewhere in the piece
- Do NOT capitalize random mid-sentence words

WORD CHOICE AND VOICE:
- Contractions throughout: don't, it's, I'm, wasn't, they're, couldn't, would've
- Filler: "honestly", "like", "kind of", "I guess", "basically", "I mean", "to be fair"
- Reuse the same word 2-3 times — students don't proofread
- Casual opinions: "honestly kind of pointless", "never really made sense to me", "wasn't great"
- One thought that doesn't connect to the one before — a slight logic jump
- One uncertainty: "I'm not totally sure but", "could be wrong"
- Some sentences starting with And, But, or So
- Uneven paragraphs — one might be just one sentence

STRUCTURE:
- Do NOT start paragraphs with a topic sentence — jump into the thought
- No conclusion or summary — just stop
- Paragraphs different lengths, not symmetrical

BURSTINESS — what GPTZero actually measures, this is critical:
Every ~150 words you MUST do this: place a dead-simple sentence (under 6 words, just subject+verb) RIGHT NEXT TO a sentence that runs 50+ words piling clause on clause with "and", "because", "so", "but". The contrast must be jarring. Example: "It didn't work. I remember thinking at the time that maybe if we had actually paid attention earlier in the semester and done the readings instead of just skimming them the night before it all would've gone differently, but honestly who knows." Consistent complexity = instant AI detection. Variance is the human signal.

ONE HYPER-SPECIFIC DETAIL:
Include one detail that sounds genuinely personal: a real-sounding name (not "John"), a specific number, a place, a time. "my teacher Mr. Peterson" not "my teacher". "like 17 of us" not "most of us". "last Tuesday" not "recently". Specific details spike GPTZero's perplexity score because they're rare in AI writing patterns.

WORD REPETITION:
Pick one content word from the topic and use it 4-5 times throughout — don't replace it with synonyms. Students repeat words they like without noticing.

ONE OFF-TOPIC DRIFT:
Somewhere in the middle, 1-2 sentences drift away from the main point — a side thought, a memory, something that just came to mind — then return to the topic. Real students' minds wander. AI never drifts.

ONE REGISTER DROP:
Once, switch from your normal writing level to noticeably more casual for 1-2 sentences, then come back. Example: going from "this presents a challenge" to "honestly I still dont get why anyone thought this was a good idea" then back to normal.

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world, cornerstone, game-changing, invaluable, synergy, impactful, plays a crucial role, serves as a testament

No passive voice. No perfect punctuation. No equal sentence energy.
Return only the rewritten text, nothing else.`,

  hard: `Rewrite the following text so it sounds like a confident real person wrote it without over-editing. This must be completely undetectable by AI detectors. Humanness is in rhythm and personality.

NO DASHES — #1 AI tell:
NEVER write em dashes (—) or use a hyphen as an em dash (word - word mid-sentence). These are the clearest signal AI detectors scan for. If you feel like using a dash, use a comma, start a new sentence, or just say it plainly. Zero dashes anywhere in the text.

WRITE NORMAL TEXT — not conversational:
Write as a normal written piece. A casual word or two can slip in naturally but this is not spoken text. No filler phrases scattered throughout.

REPLACE AI WORDS — statistically proven AI signals, swap every one:
"utilize" → "use" | "assist" → "help" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while" | "purchase" → "buy" | "commence" → "start" | "sorts" → "type"
"leverage" → "use" | "facilitate" → "help" | "underscore" → "show" | "constitute" → "make up" | "mitigate" → "reduce" | "foster" → "help" | "harness" → "use" | "empower" → "help" | "encompass" → "include" | "illuminate" → "show" | "bolster" → "strengthen" | "spearhead" → "lead"
"crucial" → "really important" | "significant/significantly" → "big" or "a lot" | "comprehensive" → "complete" | "robust" → "strong" | "pivotal" → "key" | "meticulous" → "careful" | "intricate" → "complex" | "palpable" → "real" | "paramount" → "most important" | "multifaceted" → "complicated" | "groundbreaking" → "new" | "transformative" → "life-changing" | "seamless" → "smooth"
"severity" → "how bad it is" | "scarcity/scarcities" → "shortage" | "prevalence" → "how common it is" | "magnitude" → "how big it is" | "methodology" → "method" | "realm" → "area" | "tapestry" → "mix" | "ultimately" → "in the end" | "fundamental" → "basic" | "in terms of" → "about"

COMMAS — only where clearly needed:
Lists and after long openers only. Skip when in doubt. No comma after short sentence starters. Fewer is better.

SENTENCE LENGTH — mandatory:
Every paragraph needs at least one sentence under 10 words and one sentence over 30 words. Never 3 sentences of similar length in a row. Rhythm should feel personal and uneven.
Never open two consecutive sentences with the same word or same grammatical structure (avoid "The X... The Y... The Z..."). Mix sentence types: fragment, run-on, normal — vary the shape, not just the length.

WORD CHOICE — PERPLEXITY:
Occasionally choose a slightly unexpected but fitting word over the obvious polished one: "the whole thing collapsed" not "the situation deteriorated significantly", "honestly strange" not "notably unusual", "it just didn't work" not "it proved ineffective". Real writers do this naturally — it signals a person chose the words, not a probability engine.

SPELLING — one subtle mistake per ~250 words, placed naturally:
"recieve", "seperate", or "definately" — even smart people make these

WRONG PLURAL "S" — ~1 per 80 words:
"informations", "advices", "feedbacks", "researches"

PUNCTUATION — clean but imperfect:
- Miss a comma before "but" or "and" once or twice — natural
- No semicolons. No parentheses. No em dashes. No mid-sentence colons.
- Contractions always: don't, it's, I'm, can't, won't, wouldn't, they've

VOICE:
- Strong direct opinions, pick a side, sound sure — no hedging
- One sentence that runs longer because the thought kept going
- One honest moment: "I don't fully know why" or "maybe I'm wrong"
- One real specific detail, personal not generic
- Some sentences starting with And, But, or So
- One small contradiction: "it worked fine, though honestly it kind of annoyed me"

STRUCTURE:
- Don't start paragraphs with a topic sentence — start mid-thought
- No conclusion summary — just end
- Paragraphs uneven in length
- Use slightly unexpected word choices over the polished "correct" ones

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world, cornerstone, game-changing, invaluable, synergy, impactful, plays a crucial role, serves as a testament

No passive voice. No parallel structure. No balanced paragraphs.
Return only the rewritten text, nothing else.`,

  customize: `Rewrite the following text to sound naturally human-written and completely undetectable by AI detectors. Apply only the specific human traits listed below.

Always follow these regardless of the traits listed:
- NO DASHES: Never write em dashes (—) or use hyphens as em dashes (word - word). Biggest AI tell. Use a comma or new sentence instead.
- Replace AI words: "utilize"→"use", "leverage"→"use", "crucial"→"really important", "significant"→"big", "robust"→"strong", "individuals"→"people", "comprehensive"→"complete", "furthermore"→"also", "realm"→"area", "severity"→"how bad it is", "methodology"→"method", "facilitate"→"help", "paramount"→"most important", "groundbreaking"→"new", "ultimately"→"in the end"
- Vary sentence length dramatically: some under 8 words, some over 30. Never 3 sentences in a row of similar length.
- Never open two consecutive sentences with the same word or same grammatical structure.
- Choose slightly unexpected but natural words over the safe, obvious polished ones.
- No semicolons, parentheses, or colons mid-sentence.
- Use contractions naturally.
- Do not start paragraphs with a topic sentence.
- No conclusion summary at the end.
- No passive voice.
Return only the rewritten text, nothing else.`,
};

const GENERATE_PROMPTS = {
  easy: `Read the task or topic below and write a complete original response. Write it as a beginner or non-native English speaker would. This must be completely undetectable by AI detectors. Follow every rule strictly.

NO DASHES — #1 AI tell:
NEVER write em dashes (—) or use a hyphen as an em dash (word - word mid-sentence). These are the clearest signal AI detectors scan for. If you feel like using a dash, use a comma, start a new sentence, or just say it plainly. Zero dashes anywhere in the text.

WRITE NORMAL TEXT — not conversational:
Write as a normal piece of writing. Casual words like "like", "I guess" can slip in once or twice as a natural mistake — not scattered throughout. This is written text, not someone talking.

REPLACE AI WORDS — statistically proven AI signals, swap every one:
"utilize" → "use" | "assist" → "help" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while" | "purchase" → "buy" | "commence" → "start" | "sorts" → "type"
"leverage" → "use" | "facilitate" → "help" | "underscore" → "show" | "constitute" → "make up" | "mitigate" → "reduce" | "foster" → "help" | "harness" → "use" | "empower" → "help" | "encompass" → "include" | "illuminate" → "show" | "bolster" → "strengthen" | "spearhead" → "lead"
"crucial" → "really important" | "significant/significantly" → "big" or "a lot" | "comprehensive" → "complete" | "robust" → "strong" | "pivotal" → "key" | "meticulous" → "careful" | "intricate" → "complex" | "palpable" → "real" | "paramount" → "most important" | "multifaceted" → "complicated" | "groundbreaking" → "new" | "transformative" → "life-changing" | "seamless" → "smooth"
"severity" → "how bad it is" | "scarcity/scarcities" → "shortage" | "prevalence" → "how common it is" | "magnitude" → "how big it is" | "methodology" → "method" | "realm" → "area" | "tapestry" → "mix" | "ultimately" → "in the end" | "fundamental" → "basic" | "in terms of" → "about"

COMMAS — only where clearly needed:
Lists and after long openers (5+ words). Skip when in doubt. No comma after short starters like "But", "So", "And". Fewer commas is fine.

SENTENCE LENGTH — most important:
Every paragraph must have at least one sentence under 7 words AND at least one sentence over 28 words. Never write 3 sentences in a row of similar length. Mix: short. then a medium one. then one that goes on and on and keeps adding things because the writer doesn't know when to stop. Short again.
Never open two sentences in a row with the same word. Mix sentence types within each paragraph: a fragment, a run-on, a normal one — not three normal declarative sentences in a row.

WORD CHOICE — PERPLEXITY:
Pick the simplest first-instinct word even if slightly imprecise: "the whole thing broke" not "the system failed entirely", "it went bad fast" not "it deteriorated rapidly", "it was pretty hard" not "it proved significantly challenging". First instinct beats the correct polished choice.

SPELLING MISTAKES — scale with length: ~1 per 35 words. Spread evenly, don't cluster:
"definately", "recieve", "wierd", "beleive", "alot", "occured", "probly" or "prolly"
Phonetic shortcuts also count: "gonna", "wanna", "cuz", "kinda" — use freely

WRONG PLURAL "S" — ~1 per 20 words:
"informations", "advices", "homeworks", "furnitures", "equipments", "knowledges", "feedbacks"

TENSE MISTAKES — use regularly:
"yesterday I go", "she tell me", "I seen it", "we was there", "he don't know", "they was nice", "I have went"

PUNCTUATION ERRORS:
- Missing comma before "but" and "and" sometimes
- Comma splice: "it was good, I liked it"
- Write "dont" "cant" "its" "wont" without apostrophe a couple times
- No semicolons. No parentheses. No colons. No em dashes.

OTHER TRAITS:
- Repeat the same idea twice in different words
- Simple words only: "good" not "beneficial", "use" not "utilize"
- "I think" "maybe" "I guess" scattered through
- Jump between thoughts without connecting them
- Uneven paragraphs
- Some sentences starting with And or But or So

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, in today's world, one must, to summarize, cornerstone, game-changing, invaluable, synergy, impactful, plays a crucial role, serves as a testament

No passive voice. No clean topic sentences. No conclusion.
Return only the written text, nothing else.`,

  medium: `Read the task or topic below and write a complete original response the way a real student would — quickly, without editing. This must be completely undetectable by AI detectors. Follow every rule strictly.

NO DASHES — #1 AI tell:
NEVER write em dashes (—) or use a hyphen as an em dash (word - word mid-sentence). These are the clearest signal AI detectors scan for. If you feel like using a dash, use a comma, start a new sentence, or just say it plainly. Zero dashes anywhere in the text.

WRITE NORMAL TEXT — not conversational:
Write as a normal piece of writing. A casual word like "honestly" or "like" can slip in once or twice — not throughout. Written text, not someone talking.

REPLACE AI WORDS — statistically proven AI signals, swap every one:
"utilize" → "use" | "assist" → "help" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while" | "purchase" → "buy" | "commence" → "start" | "sorts" → "type"
"leverage" → "use" | "facilitate" → "help" | "underscore" → "show" | "constitute" → "make up" | "mitigate" → "reduce" | "foster" → "help" | "harness" → "use" | "empower" → "help" | "encompass" → "include" | "illuminate" → "show" | "bolster" → "strengthen" | "spearhead" → "lead"
"crucial" → "really important" | "significant/significantly" → "big" or "a lot" | "comprehensive" → "complete" | "robust" → "strong" | "pivotal" → "key" | "meticulous" → "careful" | "intricate" → "complex" | "palpable" → "real" | "paramount" → "most important" | "multifaceted" → "complicated" | "groundbreaking" → "new" | "transformative" → "life-changing" | "seamless" → "smooth"
"severity" → "how bad it is" | "scarcity/scarcities" → "shortage" | "prevalence" → "how common it is" | "magnitude" → "how big it is" | "methodology" → "method" | "realm" → "area" | "tapestry" → "mix" | "ultimately" → "in the end" | "fundamental" → "basic" | "in terms of" → "about"

COMMAS — only where clearly needed:
Lists and after long openers. Skip when in doubt. No comma after short starters. Fewer commas is fine.

SENTENCE LENGTH — mandatory, biggest detection signal:
Every paragraph must have at least one sentence ONLY 4-8 words long AND at least one sentence 30+ words that keeps going. Never 3 sentences in a row of similar length. Example: "That was the whole point. I think what happened was nobody really understood the instructions so everyone just kind of did their own thing and hoped it worked out. Pretty chaotic."
Never open two consecutive sentences with the same word or same grammatical structure. Within each paragraph mix at least two sentence types: fragment, run-on, or normal declarative — not all the same type.

WORD CHOICE — PERPLEXITY:
Use the first natural word you'd actually think of, not the most precise one: "the idea kind of worked" not "the approach proved partially effective", "it got messy" not "it became increasingly complex", "the whole point was" not "the fundamental objective was". Students don't agonise over word choice.

SPELLING MISTAKES — scale with length: ~1 per 80 words. Spread evenly:
"definately", "recieve", "seperate", "occured", "wierd"
Shortcuts also count: "gonna", "wanna", "kinda", "prolly"

WRONG PLURAL "S" — ~1 per 35 words:
"informations", "advices", "feedbacks", "homeworks", "researches"

COMMAS — use normally, but imperfectly:
- Missing comma before "but" / "and" / "because" a few times
- Comma splice once or twice: "it made sense, everyone got it fast"
- Chain clauses: "the class ran long, we covered a lot, I didn't follow all of it"
- Do NOT strip commas from lists or after introductory words

OTHER PUNCTUATION:
- Write "dont" "cant" "its" "wont" without apostrophe once or twice
- No semicolons. No parentheses. No colons mid-sentence. No em dashes.

CAPITALIZATION:
- Miss a capital at the start of one sentence somewhere in the piece

WORD CHOICE AND VOICE:
- Contractions everywhere: don't, it's, I'm, wasn't, they're, couldn't, would've
- Filler: "honestly", "like", "kind of", "I guess", "basically", "I mean"
- Reuse the same word 2-3 times — students don't edit
- Casual opinions: "honestly kind of pointless", "never made sense to me"
- One thought that doesn't connect perfectly to the one before
- One uncertainty: "I'm not totally sure but", "could be wrong"
- Some sentences starting with And, But, or So
- Uneven paragraphs

STRUCTURE:
- Don't start paragraphs with a topic sentence — just jump in
- No conclusion or summary — just stop
- Paragraphs different lengths

BURSTINESS — what GPTZero actually measures, this is critical:
Every ~150 words you MUST do this: place a dead-simple sentence (under 6 words, just subject+verb) RIGHT NEXT TO a sentence that runs 50+ words piling clause on clause with "and", "because", "so", "but". The contrast must be jarring. Example: "It didn't work. I remember thinking at the time that maybe if we had actually paid attention earlier in the semester and done the readings instead of just skimming them the night before it all would've gone differently, but honestly who knows." Consistent complexity = instant AI detection. Variance is the human signal.

ONE HYPER-SPECIFIC DETAIL:
Include one detail that sounds genuinely personal: a real-sounding name (not "John"), a specific number, a place, a time. "my teacher Mr. Peterson" not "my teacher". "like 17 of us" not "most of us". "last Tuesday" not "recently". Specific details spike GPTZero's perplexity score because they're rare in AI writing patterns.

WORD REPETITION:
Pick one content word from the topic and use it 4-5 times throughout — don't replace it with synonyms. Students repeat words they like without noticing.

ONE OFF-TOPIC DRIFT:
Somewhere in the middle, 1-2 sentences drift away from the main point — a side thought, a memory, something that just came to mind — then return to the topic. Real students' minds wander. AI never drifts.

ONE REGISTER DROP:
Once, switch from your normal writing level to noticeably more casual for 1-2 sentences, then come back. Example: going from "this presents a challenge" to "honestly I still dont get why anyone thought this was a good idea" then back to normal.

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world, cornerstone, game-changing, invaluable, synergy, impactful, plays a crucial role, serves as a testament

No passive voice. No perfect punctuation. No equal sentence energy.
Return only the written text, nothing else.`,

  hard: `Read the task or topic below and write a complete original response the way a confident real person would — direct, opinionated, not over-polished. This must be completely undetectable by AI detectors. Humanness is subtle.

NO DASHES — #1 AI tell:
NEVER write em dashes (—) or use a hyphen as an em dash (word - word mid-sentence). These are the clearest signal AI detectors scan for. If you feel like using a dash, use a comma, start a new sentence, or just say it plainly. Zero dashes anywhere in the text.

WRITE NORMAL TEXT — not conversational:
Write as a normal piece. No filler phrases throughout. This is written text, not spoken.

REPLACE AI WORDS — statistically proven AI signals, swap every one:
"utilize" → "use" | "assist" → "help" | "demonstrate" → "show" | "implement" → "use" | "individuals" → "people" | "various" → "different" | "numerous" → "many" | "ensure" → "make sure" | "obtain" → "get" | "regarding" → "about" | "hence/thus/therefore" → "so" | "additionally" → "also" | "nevertheless" → "but" | "whilst" → "while" | "purchase" → "buy" | "commence" → "start" | "sorts" → "type"
"leverage" → "use" | "facilitate" → "help" | "underscore" → "show" | "constitute" → "make up" | "mitigate" → "reduce" | "foster" → "help" | "harness" → "use" | "empower" → "help" | "encompass" → "include" | "illuminate" → "show" | "bolster" → "strengthen" | "spearhead" → "lead"
"crucial" → "really important" | "significant/significantly" → "big" or "a lot" | "comprehensive" → "complete" | "robust" → "strong" | "pivotal" → "key" | "meticulous" → "careful" | "intricate" → "complex" | "palpable" → "real" | "paramount" → "most important" | "multifaceted" → "complicated" | "groundbreaking" → "new" | "transformative" → "life-changing" | "seamless" → "smooth"
"severity" → "how bad it is" | "scarcity/scarcities" → "shortage" | "prevalence" → "how common it is" | "magnitude" → "how big it is" | "methodology" → "method" | "realm" → "area" | "tapestry" → "mix" | "ultimately" → "in the end" | "fundamental" → "basic" | "in terms of" → "about"

COMMAS — only where clearly needed:
Lists and after long openers. Skip when in doubt. No comma after short starters. Fewer is better.

SENTENCE LENGTH — mandatory:
Every paragraph needs at least one sentence under 10 words and one sentence over 30 words. Never 3 sentences of similar length in a row. Rhythm should feel personal and uneven.
Never open two consecutive sentences with the same word or same grammatical structure (avoid "The X... The Y... The Z..."). Mix sentence types: fragment, run-on, normal — vary the shape, not just the length.

WORD CHOICE — PERPLEXITY:
Occasionally choose a slightly unexpected but fitting word over the obvious polished one: "the whole thing collapsed" not "the situation deteriorated significantly", "honestly strange" not "notably unusual", "it just didn't work" not "it proved ineffective". Real writers do this naturally — it signals a person chose the words, not a probability engine.

SPELLING — one subtle mistake per ~250 words, placed naturally:
"recieve", "seperate", or "definately"

WRONG PLURAL "S" — ~1 per 80 words:
"informations", "advices", "feedbacks", "researches"

PUNCTUATION:
- Miss a comma before "but" or "and" once or twice
- No semicolons. No parentheses. No em dashes. No mid-sentence colons.
- Contractions always: don't, it's, I'm, can't, won't, wouldn't, they've

VOICE AND STRUCTURE:
- Strong direct opinions, pick a side, sound sure
- One sentence that runs longer because the thought kept going
- One honest moment: "I don't fully know why" or "maybe I'm wrong"
- One real specific detail, personal not generic
- Some sentences starting with And, But, or So
- One small contradiction: "it worked fine, though honestly it kind of annoyed me"
- Don't start paragraphs with a topic sentence
- No conclusion summary — just end
- Uneven paragraphs

BANNED: furthermore, moreover, in conclusion, it's worth noting, notably, significantly, crucial, delve, nuanced, it is important, this highlights, this demonstrates, one must consider, it can be seen, to summarize, this suggests, in today's world, cornerstone, game-changing, invaluable, synergy, impactful, plays a crucial role, serves as a testament

No passive voice. No parallel structure. No balanced paragraphs.
Return only the written text, nothing else.`,

  customize: `Read the task or topic below and write a complete original response. Make it sound naturally human-written and completely undetectable by AI detectors. Apply only the specific human traits listed below.

Always follow these regardless:
- NO DASHES: Never write em dashes (—) or use hyphens as em dashes (word - word). Biggest AI tell. Use a comma or new sentence instead.
- Replace AI words: "utilize"→"use", "leverage"→"use", "crucial"→"really important", "significant"→"big", "robust"→"strong", "individuals"→"people", "comprehensive"→"complete", "furthermore"→"also", "realm"→"area", "severity"→"how bad it is", "methodology"→"method", "facilitate"→"help", "paramount"→"most important", "groundbreaking"→"new", "ultimately"→"in the end"
- Vary sentence length dramatically: some under 8 words, some over 30. Never 3 in a row of similar length.
- Never open two consecutive sentences with the same word or same grammatical structure.
- Choose slightly unexpected but natural words over the safe, obvious polished ones.
- No semicolons, parentheses, or mid-sentence colons.
- Use contractions naturally.
- Don't start paragraphs with a topic sentence.
- No conclusion summary.
- No passive voice.
Return only the written text, nothing else.`,
};

const WRITING_TYPE_PROMPTS = {
  essay:      '\nFORMAT: Structure this as a written essay — flowing paragraphs, consistent voice, no bullet points or lists.',
  email:      '\nFORMAT: Write this as an email — natural greeting, clear body, appropriate sign-off. Direct and purposeful.',
  story:      '\nFORMAT: Write this as a short narrative or story — descriptive language, show through action, build to a moment.',
  casual:     '\nFORMAT: Write this very casually — like texting or talking to a friend. Short sentences, informal, contractions throughout.',
  business:   '\nFORMAT: Write this for a professional context — clear, organised, no slang. Respectful and direct tone.',
  discussion: '\nFORMAT: Write this as a class or forum discussion post — engage directly with the topic, share a clear personal take.',
};

// ─── Post-process AI output ───────────────────────────────────

// ─── Level Adjust (client-side, no API) ──────────────────────

function _swapCase(original, replacement) {
  return original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

function _applySwaps(text, swaps) {
  for (const [ai, human] of Object.entries(swaps)) {
    const escaped = ai.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    text = text.replace(re, m => _swapCase(m, human));
  }
  return text;
}

function _applyPhrases(text, phrases) {
  for (const [phrase, replacement] of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(escaped, 'gi');
    text = text.replace(re, m => _swapCase(m, replacement));
  }
  return text;
}

function _removeApostrophes(text, rate) {
  const pairs = [
    ["don't","dont"],["can't","cant"],["won't","wont"],["it's","its"],
    ["I'm","Im"],["i'm","im"],["didn't","didnt"],["couldn't","couldnt"],
    ["isn't","isnt"],["wasn't","wasnt"],["aren't","arent"],["weren't","werent"],
    ["haven't","havent"],["hasn't","hasnt"],["wouldn't","wouldnt"],
    ["shouldn't","shouldnt"],["they're","theyre"],["we're","were"],
    ["you're","youre"],["I've","Ive"],["they've","theyve"],["we've","weve"],
    ["I'll","Ill"],["they'll","theyll"],["that's","thats"],["there's","theres"],
    ["what's","whats"],["who's","whos"],["he's","hes"],["she's","shes"],
  ];
  for (const [w, wo] of pairs) {
    const re = new RegExp(w.replace(/'/g, "'"), 'g');
    text = text.replace(re, m => Math.random() < rate ? _swapCase(m, wo) : m);
  }
  return text;
}

function _addWrongPlurals(text, rate) {
  const pairs = [
    [/\binformation\b/g,'informations'],[/\badvice\b/g,'advices'],
    [/\bfeedback\b/g,'feedbacks'],[/\bknowledge\b/g,'knowledges'],
    [/\bequipment\b/g,'equipments'],[/\bhomework\b/g,'homeworks'],
    [/\bresearch\b/g,'researches'],
  ];
  for (const [re, rep] of pairs) {
    text = text.replace(re, m => Math.random() < rate ? rep : m);
  }
  return text;
}

function _applyGrammarMistakes(text, rate) {
  // Remove comma before but/and/or at given rate
  text = text.replace(/, (but|and|or)\b/gi, (m, w) =>
    Math.random() < rate ? ' ' + w : m);
  // Comma splice: turn some ". " into ", " (only between lowercase-continuing sentences)
  if (rate >= 0.25) {
    text = text.replace(/\. ([a-z])/g, (m, ch) =>
      Math.random() < rate * 0.3 ? ', ' + ch : m);
  }
  return text;
}

function _applyTenseMistakes(text, rate) {
  const swaps = [
    [/\bwent\b/g, 'go'], [/\bsaid\b/g, 'say'], [/\btold\b/g, 'tell'],
    [/\bwas\b/g, 'is'],  [/\bwere\b/g, 'are'], [/\bdid\b/g, 'do'],
    [/\bhad\b/g, 'have'],[/\bsaw\b/g, 'see'],  [/\bgot\b/g, 'get'],
    [/\bcame\b/g,'come'],[/\bmade\b/g,'make'], [/\btook\b/g,'take'],
    [/\bknew\b/g,'know'],[/\bthought\b/g,'think'],[/\bfound\b/g,'find'],
  ];
  for (const [re, rep] of swaps) {
    text = text.replace(re, m => Math.random() < rate ? _swapCase(m, rep) : m);
  }
  return text;
}

function _applyCapsMistakes(text, rate) {
  // Lowercase the first letter of some sentences after sentence-ending punctuation
  return text.replace(/([.?!] )([A-Z])/g, (m, punct, letter) =>
    Math.random() < rate ? punct + letter.toLowerCase() : m);
}

function _applySpellingMistakes(text, rate) {
  const pairs = [
    [/\bdefinitely\b/gi, 'definately'],
    [/\breceive\b/gi,    'recieve'],
    [/\bseparate\b/gi,   'seperate'],
    [/\boccurred\b/gi,   'occured'],
    [/\bweird\b/gi,      'wierd'],
    [/\bbelieve\b/gi,    'beleive'],
    [/\ba lot\b/gi,      'alot'],
    [/\buntil\b/gi,      'untill'],
    [/\bbeginning\b/gi,  'begining'],
    [/\bexistence\b/gi,  'existance'],
  ];
  for (const [re, rep] of pairs) {
    text = text.replace(re, m => Math.random() < rate ? _swapCase(m, rep) : m);
  }
  return text;
}

const _BASE_SWAPS = {
  'utilize':'use','utilizes':'uses','utilized':'used','utilizing':'using',
  'assist':'help','assists':'helps','assisted':'helped','assisting':'helping',
  'individuals':'people','individual':'person',
  'various':'different','numerous':'many',
  'ensure':'make sure','ensures':'makes sure','ensured':'made sure',
  'obtain':'get','obtains':'gets','obtained':'got',
  'regarding':'about',
  'hence':'so','thus':'so','furthermore':'also','moreover':'also',
  'nevertheless':'but','nonetheless':'but',
  'whilst':'while','purchase':'buy','purchases':'buys','purchased':'bought',
  'commence':'start','commences':'starts','commenced':'started',
  'leverage':'use','leverages':'uses','leveraged':'used','leveraging':'using',
  'facilitate':'help','facilitates':'helps','facilitated':'helped',
  'constitute':'make up','constitutes':'makes up',
  'mitigate':'reduce','mitigates':'reduces','mitigated':'reduced',
  'foster':'build','fosters':'builds','fostered':'built',
  'harness':'use','harnessing':'using',
  'empower':'help','empowers':'helps',
  'encompass':'include','encompasses':'includes',
  'crucial':'really important','pivotal':'key','paramount':'most important',
  'meticulous':'careful','meticulously':'carefully',
  'comprehensive':'complete','robust':'strong','versatile':'flexible',
  'seamless':'smooth','seamlessly':'smoothly',
  'transformative':'life-changing','methodology':'method',
  'realm':'area','ultimately':'in the end',
  'fundamental':'basic','intricate':'complex',
  'bolster':'strengthen','bolsters':'strengthens',
  'demonstrate':'show','demonstrates':'shows','demonstrated':'showed',
  'indicate':'show','indicates':'shows','indicated':'showed',
  'illuminate':'show','illuminates':'shows',
  'spearhead':'lead','spearheads':'leads',
  'underscore':'show','underscores':'shows',
  'palpable':'real','groundbreaking':'new',
  'severity':'how bad it is','scarcity':'shortage','prevalence':'how common it is',
  'magnitude':'how big it is','tapestry':'mix',
  'multifaceted':'complicated','nuanced':'complex',
  // Common AI overuse words
  'delve':'explore','delves':'explores','delved':'explored','delving':'exploring',
  'notably':'importantly','note that':'keep in mind',
  'innovative':'new','innovation':'new idea','innovations':'new ideas',
  'rapidly':'quickly','rapidly evolving':'fast changing',
  'unprecedented':'unheard of',
  'sophisticated':'advanced',
  'invaluable':'very useful',
  'thriving':'growing','vibrant':'lively',
  'scalable':'flexible',
  'reimagine':'rethink','reimagines':'rethinks','reimagined':'rethought',
  'holistic':'complete',
  'actionable':'practical',
  'streamline':'simplify','streamlines':'simplifies','streamlined':'simplified','streamlining':'simplifying',
  'navigate':'handle','navigates':'handles','navigated':'handled','navigating':'handling',
  'landscape':'area',
  'ecosystem':'environment',
  'framework':'system','frameworks':'systems',
  'dynamic':'active',
  'shed light on':'explain','sheds light on':'explains',
  'thought-provoking':'interesting',
  'cutting-edge':'advanced',
  'state-of-the-art':'advanced',
  'game-changing':'important',
  'ever-evolving':'always changing','ever-changing':'always changing',
  'in-depth':'detailed',
  'leverage the power':'use the power',
  'harness the power':'use the power',
  'unlock':'open up','unlocks':'opens up','unlocked':'opened up',
  'empower individuals':'help people',
  'skyrocket':'shoot up','skyrockets':'shoots up',
  'unprecedented levels':'record levels',
  'pave the way':'open the door','paves the way':'opens the door',
  'at the forefront':'leading',
  'in the realm of':'in',
  'it is worth noting':'note that',
  'it should be noted':'note that',
  'needless to say':'obviously',
  'as previously mentioned':'as mentioned',
  'in light of':'because of',
  'rest assured':'don\'t worry',
  'pivotal role':'key role',
  'crucial role':'important role',
  'key takeaway':'main point','key takeaways':'main points',
  'dive into':'look at','dives into':'looks at','diving into':'looking at',
  'unpack':'break down','unpacks':'breaks down',
  'foster innovation':'encourage new ideas',
  'drive innovation':'push new ideas',
  'robust solution':'strong solution','robust solutions':'strong solutions',
};

const _STUDENT_SWAPS = {
  'analyze':'look at','analyzes':'looks at','analyzed':'looked at',
  'evaluate':'judge','evaluates':'judges','evaluated':'judged',
  'establish':'set up','establishes':'sets up','established':'set up',
  'significant':'big','significantly':'a lot',
  'primary':'main','secondary':'second',
  'component':'part','components':'parts',
  'factor':'thing','factors':'things',
  'impact':'effect','impacts':'effects',
  'approach':'way','approaches':'ways',
  'develop':'build','develops':'builds','developed':'built',
  'identify':'find','identifies':'finds','identified':'found',
  'maintain':'keep','maintains':'keeps','maintained':'kept',
  'contribute':'add to','contributes':'adds to',
  'enhance':'improve','enhances':'improves','enhanced':'improved',
  'achieve':'get','achieves':'gets','achieved':'got',
  'implement':'use','implements':'uses','implemented':'used',
  'transform':'change','transforms':'changes','transformed':'changed',
  'examine':'look at','examines':'looks at','examined':'looked at',
  'investigate':'look into','investigates':'looks into',
  'determine':'figure out','determines':'figures out','determined':'figured out',
  'acknowledge':'admit','acknowledges':'admits','acknowledged':'admitted',
  'possess':'have','possesses':'has','possessed':'had',
  'acquire':'get','acquires':'gets','acquired':'got',
  'provide':'give','provides':'gives','provided':'gave',
  'require':'need','requires':'needs','required':'needed',
  'approximately':'about','typically':'usually','generally':'usually',
  'specifically':'exactly','particularly':'especially','essentially':'basically',
  'effectively':'well','efficiently':'well','successfully':'well',
  'collaborate':'work together','collaborates':'works together',
  'participate':'take part','participates':'takes part',
  'incorporate':'add','incorporates':'adds','incorporated':'added',
  'eliminate':'get rid of','eliminates':'gets rid of',
  'consequently':'so','subsequently':'then','previously':'before',
  'currently':'now',
};

const _BEGINNER_SWAPS = {
  'however':'but',
  'therefore':'so',
  'observe':'see','observes':'sees','observed':'saw',
  'consider':'think about','considers':'thinks about','considered':'thought about',
  'respond':'answer','responds':'answers','responded':'answered',
  'inquire':'ask','inquires':'asks','inquired':'asked',
  'attempt':'try','attempts':'tries','attempted':'tried',
  'initiate':'start','initiates':'starts','initiated':'started',
  'terminate':'end','terminates':'ends','terminated':'ended',
  'perceive':'see','perceives':'sees','perceived':'saw',
  'comprehend':'understand','comprehends':'understands',
  'request':'ask for','requests':'asks for',
  'allow':'let','allows':'lets','allowed':'let',
  'prevent':'stop','prevents':'stops','prevented':'stopped',
  'reduce':'cut down','reduces':'cuts down',
  'expand':'grow','expands':'grows','expanded':'grew',
  'combine':'mix','combines':'mixes','combined':'mixed',
  'organize':'sort','organizes':'sorts','organized':'sorted',
  'design':'make','designs':'makes','designed':'made',
  'produce':'make','produces':'makes','produced':'made',
  'discover':'find','discovers':'finds','discovered':'found',
  'communicate':'talk about',
};

const _BASE_PHRASES = [
  ['in order to','to'],
  ['due to the fact that','because'],
  ['at this point in time','now'],
  ['in the event that','if'],
  ['with regard to','about'],
  ['in terms of','about'],
  ['as a result of','because of'],
  ['in spite of','even though'],
  ['with respect to','about'],
  ['on the basis of','based on'],
  ['at the present time','now'],
  ['a large number of','many'],
  ['a significant number of','many'],
  ['the majority of','most'],
  ['in conjunction with','with'],
  ['in addition to','plus'],
  ['as well as','and'],
  ['it is important to note that','note that'],
  ['it is worth noting that','note that'],
  ['it can be seen that','we can see that'],
  ['in conclusion','to sum up'],
  ['in summary','to sum up'],
  ['to summarize','to sum up'],
  ['plays a crucial role','is really important'],
  ['plays a key role','is important'],
  ['serves as a testament','shows'],
  ['in today\'s world','today'],
  ['in today\'s society','today'],
];

const _TENSE_MAP = {
  went:'go', said:'say', told:'tell', was:'is', were:'are', did:'do',
  had:'have', saw:'see', got:'get', came:'come', made:'make', took:'take',
  knew:'know', thought:'think', found:'find', gave:'give', wrote:'write',
  ran:'run', began:'begin', became:'become',
};

function _editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  return d[m][n];
}

// Regular past↔present tense: walk↔walked, change↔changed, study↔studied, stop↔stopped
function _isRegularTense(a, b) {
  const pair = (past, pres) => {
    if (!past || !pres || past === pres) return false;
    if (past === pres + 'ed') return true;                             // walk→walked
    if (past === pres + 'd') return true;                              // change→changed
    if (pres.endsWith('y') && past === pres.slice(0, -1) + 'ied') return true; // study→studied
    if (past === pres + pres.slice(-1) + 'ed') return true;            // stop→stopped
    return false;
  };
  return pair(a, b) || pair(b, a);
}

function _classifyChange(orig, repl) {
  if (!orig) return 'grammar';                         // pure insertion / structural
  const ol = orig.toLowerCase(), rl = repl.toLowerCase();
  const letters = s => s.toLowerCase().replace(/[^a-z]/g, '');
  const oL = letters(orig), rL = letters(repl);
  if (orig !== repl && ol === rl) return 'caps';       // identical except CASE
  if (orig !== repl && oL === rL) return 'punct';      // identical letters, punct/apostrophe differs
  if (_TENSE_MAP[oL] === rL || _TENSE_MAP[rL] === oL || _isRegularTense(oL, rL))
    return 'tense';                                    // tense swap (irregular map or regular -ed)
  if (oL && rL && oL[0] === rL[0] && oL !== rL
      && Math.abs(oL.length - rL.length) <= 1
      && _editDistance(oL, rL) <= 2) return 'spelling';// small typo
  return 'word';                                       // vocabulary swap (default)
}

// Per-category highlight colors (mirror the CSS [data-cat] vars in style.css)
const CAT_COLORS = {
  word: '#e8a317', caps: '#2f6df6', punct: '#8b5cf6',
  spelling: '#e0533d', tense: '#1aa564', grammar: '#d6336c',
};
const _VALID_CATS = new Set(Object.keys(CAT_COLORS));

// Build a striped linear-gradient background + split underline from N category colors
function _multiCatStyle(cats) {
  const cols = cats.map(c => CAT_COLORS[c] || CAT_COLORS.word);
  const step = 100 / cols.length;
  const tint  = cols.map((c, i) => `color-mix(in srgb, ${c} 16%, transparent) ${i * step}% ${(i + 1) * step}%`).join(', ');
  const solid = cols.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(', ');
  return `background:linear-gradient(100deg, ${tint});`
       + `border-bottom:2px solid transparent;`
       + `border-image:linear-gradient(100deg, ${solid}) 1;`;
}

// Parse AI annotation markers [[orig|new|cats]] into clean text + change HTML + counts.
// Returns null when no markers are present (caller falls back to the diff).
function _parseAnnotatedResult(annotated) {
  if (!annotated || annotated.indexOf('[[') === -1) return null;
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const re = /\[\[([^\]|]*)\|([^\]|]*)\|([^\]]*)\]\]/g;

  const counts = { word: 0, caps: 0, punct: 0, spelling: 0, tense: 0, grammar: 0 };
  let html = '', cleanText = '', total = 0, last = 0, m, found = false;

  while ((m = re.exec(annotated)) !== null) {
    found = true;
    const before = annotated.slice(last, m.index);
    html += esc(before);
    cleanText += before;
    last = re.lastIndex;

    const orig = m[1], repl = m[2];
    let cats = m[3].split('+').map(c => c.trim().toLowerCase())
                   .map(c => c === 'vocab' ? 'word' : c)
                   .filter(c => _VALID_CATS.has(c));
    if (!cats.length) cats = ['word'];
    cats = [...new Set(cats)];

    cats.forEach(c => counts[c]++);
    total++;
    cleanText += repl;

    const safe   = esc(repl);
    const origEsc = esc(orig);
    if (cats.length === 1) {
      const cat = cats[0];
      html += orig
        ? `<span class="word-change-pair" data-cat="${cat}"><mark class="word-changed">${safe}</mark><span class="word-original">${origEsc}</span></span>`
        : `<mark class="word-changed" data-cat="${cat}">${safe}</mark>`;
    } else {
      const cl = cats.join(' ');
      const st = _multiCatStyle(cats);
      html += orig
        ? `<span class="word-change-pair" data-cats="${cl}"><mark class="word-changed" style="${st}">${safe}</mark><span class="word-original" style="text-decoration-color:${CAT_COLORS[cats[0]]}">${origEsc}</span></span>`
        : `<mark class="word-changed" data-cats="${cl}" style="${st}">${safe}</mark>`;
    }
  }
  if (!found) return null;

  const tail = annotated.slice(last);
  html += esc(tail);
  cleanText += tail;

  // Safety: strip any stray/malformed markers from clean text so copy/extension stay clean
  cleanText = cleanText.replace(/\[\[([^\]|]*)\|([^\]|]*)\|([^\]]*)\]\]/g, '$2')
                       .replace(/\[\[|\]\]/g, '');
  return { cleanText: cleanText.trim(), html: html.replace(/\n/g, '<br>\n'), counts, total };
}

function _buildDiffHtml(original, result) {
  const norm = w => w.replace(/[.,!?;:'"()\[\]]/g, '').toLowerCase();
  // Split into alternating [word, whitespace, word, ...] tokens
  const allToks  = s => s.match(/\S+|\s+/g) || [];
  const wordOnly = toks => toks.filter(t => !/^\s+$/.test(t));

  const rToks = allToks(result);
  const O = wordOnly(allToks(original));
  const R = wordOnly(rToks);

  // LCS DP (O(m*n)) — fine for typical essay lengths
  const m = O.length, n = R.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = norm(O[i]) === norm(R[j])
        ? 1 + dp[i + 1][j + 1]
        : Math.max(dp[i + 1][j], dp[i][j + 1]);

  // Walk back: collect changed result words + which originals they replaced
  const changed = new Set();
  const origFor = new Map();
  const origRawFor = new Map();
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let pending = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (norm(O[i]) === norm(R[j])) {
      if (O[i] !== R[j]) {                 // same word, only case/punctuation differs
        changed.add(j);
        origFor.set(j, esc(O[i]));
        origRawFor.set(j, O[i]);
      }
      i++; j++; pending = [];
    }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { pending.push(O[i]); i++; }
    else {
      changed.add(j);
      if (pending.length) { origFor.set(j, pending.map(esc).join(' ')); origRawFor.set(j, pending.join(' ')); pending = []; }
      j++;
    }
  }
  let firstTrailing = true;
  while (j < n) {
    changed.add(j);
    if (firstTrailing && pending.length) { origFor.set(j, pending.map(esc).join(' ')); origRawFor.set(j, pending.join(' ')); firstTrailing = false; pending = []; }
    j++;
  }

  // Build HTML from result tokens
  let wordIdx = 0, html = '';
  for (const tok of rToks) {
    if (/^\s+$/.test(tok)) { html += tok; continue; }
    const safe = tok.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (changed.has(wordIdx)) {
      const orig    = origFor.get(wordIdx);
      const origRaw = origRawFor.get(wordIdx) || '';
      const cat     = _classifyChange(origRaw, tok);
      html += orig
        ? `<span class="word-change-pair" data-cat="${cat}"><mark class="word-changed">${safe}</mark><span class="word-original">${orig}</span></span>`
        : `<mark class="word-changed" data-cat="${cat}">${safe}</mark>`;
    } else {
      html += safe;
    }
    wordIdx++;
  }
  return html.replace(/\n/g, '<br>\n');
}

function _countChanges(original, result) {
  const norm = w => w.replace(/[.,!?;:'"()\[\]]/g, '').toLowerCase();
  const words = s => (s.match(/\S+/g) || []);
  const O = words(original), R = words(result);
  const m = O.length, n = R.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = norm(O[i]) === norm(R[j])
        ? 1 + dp[i + 1][j + 1]
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
  return (m + n) - 2 * dp[0][0];
}

function _buildChangesHtml(original, level) {
  let h = original
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  h = h.replace(/\s*—\s*/g, ', ').replace(/\s*–\s*/g, ', ').replace(/ - /g, ', ');

  for (const [phrase, replacement] of _BASE_PHRASES) {
    const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    h = h.replace(new RegExp(esc, 'gi'), m =>
      `<mark class="word-changed">${_swapCase(m, replacement)}</mark>`);
  }

  let swaps = { ..._BASE_SWAPS };
  if (level === 'easy' || level === 'medium') Object.assign(swaps, _STUDENT_SWAPS);
  if (level === 'easy') Object.assign(swaps, _BEGINNER_SWAPS);

  for (const [ai, human] of Object.entries(swaps)) {
    const esc = ai.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    h = h.replace(new RegExp(`\\b${esc}\\b`, 'gi'), m =>
      `<mark class="word-changed">${_swapCase(m, human)}</mark>`);
  }

  return h.replace(/\n/g, '<br>\n');
}

function adjustLevelOutput(text, level) {
  // Strip dashes first
  text = text.replace(/\s*—\s*/g, ', ');
  text = text.replace(/\s*–\s*/g, ', ');
  text = text.replace(/ - /g, ', ');

  // Apply phrases (multi-word, do before single-word swaps)
  text = _applyPhrases(text, _BASE_PHRASES);

  // Build word swap dict for this level
  let swaps = { ..._BASE_SWAPS };
  if (level === 'easy' || level === 'medium') Object.assign(swaps, _STUDENT_SWAPS);
  if (level === 'easy') Object.assign(swaps, _BEGINNER_SWAPS);

  text = _applySwaps(text, swaps);

  // Punctuation rules by level
  if (level === 'easy') {
    text = text.replace(/, (but|and|or|so)\b/gi, (m, w) => Math.random() < 0.70 ? ' ' + w : m);
    text = _removeApostrophes(text, 0.50);
    text = _addWrongPlurals(text, 0.30);
  } else if (level === 'medium') {
    text = text.replace(/, (but)\b/gi, (m, w) => Math.random() < 0.30 ? ' ' + w : m);
    text = _removeApostrophes(text, 0.20);
  } else if (level === 'hard') {
    text = _removeApostrophes(text, 0.08);
  }

  return text;
}

function adjustLevelCustom(text) {
  const wlVal = parseInt(optionsPanel?.querySelector('[data-mistake="wordlevel"]')?.value ?? 5);
  const fallbackLevel = wlVal <= 3 ? 'easy' : wlVal <= 6 ? 'medium' : 'hard';
  text = adjustLevelOutput(text, fallbackLevel);

  const sliderRate = v => {
    const n = parseInt(v);
    if (n <= 2) return 0;
    if (n <= 4) return 0.12;
    if (n <= 6) return 0.25;
    if (n <= 8) return 0.40;
    return 0.55;
  };

  const getVal = type => {
    const el = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
    return el ? parseInt(el.value) : 0;
  };

  const gr = sliderRate(getVal('grammar'));
  const te = sliderRate(getVal('tense'));
  const pu = sliderRate(getVal('punct'));
  const ca = sliderRate(getVal('caps'));
  const sp = sliderRate(getVal('spelling'));

  if (gr > 0) text = _applyGrammarMistakes(text, gr);
  if (te > 0) text = _applyTenseMistakes(text, te);
  if (pu > 0) text = _removeApostrophes(text, pu);
  if (ca > 0) text = _applyCapsMistakes(text, ca);
  if (sp > 0) text = _applySpellingMistakes(text, sp);

  return text;
}

// Keep postProcessOutput as a thin wrapper for anything still calling it
function postProcessOutput(text) {
  return adjustLevelOutput(text, selectedLevel || 'medium');
}

// ─── Adjust Level (main action, client-side) ──────────────────

async function adjustLevel() {
  const text = inputText.value.trim();
  if (!text) { showToast('Paste some text first'); inputText.focus(); return; }

  const getMistakes = () => ({
    grammar:   parseInt(optionsPanel?.querySelector('[data-mistake="grammar"]')?.value   || 0),
    tense:     parseInt(optionsPanel?.querySelector('[data-mistake="tense"]')?.value     || 0),
    punct:     parseInt(optionsPanel?.querySelector('[data-mistake="punct"]')?.value     || 0),
    caps:      parseInt(optionsPanel?.querySelector('[data-mistake="caps"]')?.value      || 0),
    spelling:  parseInt(optionsPanel?.querySelector('[data-mistake="spelling"]')?.value  || 0),
    wordLevel: parseInt(optionsPanel?.querySelector('[data-mistake="wordlevel"]')?.value ?? 5),
  });

  setLoading(true, 'Adjusting level…');
  try {
    const token  = await window.bipassAuth.getToken();
    const res    = await fetch('/api/adjust-level', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body:    JSON.stringify({
        text,
        level: selectedLevel,
        lockSentenceStructure,
        mistakes: selectedLevel === 'customize' ? getMistakes() : undefined,
      }),
    });
    if (!res.ok) throw new Error('API error');
    const { result } = await res.json();

    // Prefer AI annotations (accurate multi-category); fall back to the diff.
    const parsed   = _parseAnnotatedResult(result);
    const cleanRes = parsed ? parsed.cleanText : result;
    const htmlDiff = parsed ? parsed.html      : _buildDiffHtml(text, result);
    const changed  = parsed ? parsed.total     : _countChanges(text, result);

    sessionStorage.setItem('bipass_input',        text);
    sessionStorage.setItem('bipass_result',       cleanRes);
    sessionStorage.setItem('bipass_result_html',  htmlDiff);
    sessionStorage.setItem('bipass_mode',         'humanize');
    sessionStorage.setItem('bipass_change_count', String(changed));
    sessionStorage.setItem('bipass_wc',           String(countWords(text)));
    window.location.href = 'editor.html';
  } catch {
    // Fallback to client-side dictionary if API fails
    const result = selectedLevel === 'customize' ? adjustLevelCustom(text) : adjustLevelOutput(text, selectedLevel);
    const htmlDiff = _buildDiffHtml(text, result);
    const changed  = _countChanges(text, result);
    sessionStorage.setItem('bipass_input',        text);
    sessionStorage.setItem('bipass_result',       result);
    sessionStorage.setItem('bipass_result_html',  htmlDiff);
    sessionStorage.setItem('bipass_mode',         'humanize');
    sessionStorage.setItem('bipass_change_count', String(changed));
    sessionStorage.setItem('bipass_wc',           String(countWords(text)));
    window.location.href = 'editor.html';
  } finally {
    setLoading(false);
  }
}

// ─── State ────────────────────────────────────────────────────

let selectedLevel          = 'easy';
let selectedModel          = localStorage.getItem('bipass_model') || 'gemini';
let lockSentenceStructure  = localStorage.getItem('bipass_lock_structure') === 'true';
let selectedWritingType    = null;
let myStyleActive          = false;
let savedStyle             = null; // points to the active style in savedStyles
let savedStyles            = [];   // array of {id, name, style_summary, style_prompt}
let activeStyleId          = null;
let currentAbortController = null;

// ─── Elements ─────────────────────────────────────────────────

const promptText     = document.getElementById('prompt-text');
const inputText      = document.getElementById('input-text');
const promptWc       = document.getElementById('prompt-wc');
const humanizeWc     = document.getElementById('humanize-wc');
const generateBtn    = document.getElementById('generate-btn');
const generateLabel  = document.getElementById('generate-label');
const generateLoader = document.getElementById('generate-loader');
const humanizeBtn    = document.getElementById('humanize-btn');
const humanizeLabel  = document.getElementById('humanize-label');
const humanizeLoader = document.getElementById('humanize-loader');
const charCount      = document.getElementById('char-count');
const wordCount      = document.getElementById('word-count');
const levelDesc      = document.getElementById('level-desc');
const levelLabel     = document.getElementById('level-label');
const levelGlider    = document.getElementById('level-glider');
const statusLabel    = document.getElementById('status-label');
const pills          = document.querySelectorAll('.level-btn');
const optionsPanel   = document.getElementById('options-panel');
const toast          = document.getElementById('toast');
const workspace      = document.getElementById('workspace');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText    = document.getElementById('loading-text');
const loadingRewrite = document.getElementById('loading-rewrite');
const loadingStepper = document.getElementById('loading-stepper');
const levelTrack     = document.querySelector('.level-track');
const colCustomize   = document.querySelector('.col-customize');
const myStyleBox     = document.getElementById('my-style-block');
const sampleContainer  = document.getElementById('sample-container');
const addSampleBtn     = document.getElementById('add-sample-btn');
const analyzeStyleBtn  = document.getElementById('analyze-style-btn');
const analyzeLabel     = document.getElementById('analyze-label');
const analyzeLoader    = document.getElementById('analyze-loader');
const myStyleInputs    = document.getElementById('my-style-inputs');
const styleCardsList   = document.getElementById('style-cards-list');

// ─── Model toggle ─────────────────────────────────────────────

(function () {
  function syncModelButtons() {
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.classList.toggle('model-btn-active', btn.dataset.model === selectedModel);
    });
  }

  syncModelButtons();

  document.querySelectorAll('.model-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedModel = btn.dataset.model;
      localStorage.setItem('bipass_model', selectedModel);
      syncModelButtons();
    });
  });
})();

document.querySelectorAll('.qs-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.qs-pill').forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');
    if (promptText) { promptText.value = pill.dataset.prompt; promptText.focus(); promptText.dispatchEvent(new Event('input')); }
  });
});

document.querySelectorAll('.wt-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const type = pill.dataset.type;
    if (selectedWritingType === type) {
      selectedWritingType = null;
      pill.classList.remove('active');
    } else {
      document.querySelectorAll('.wt-pill').forEach(p => p.classList.remove('active'));
      selectedWritingType = type;
      pill.classList.add('active');
    }
  });
});

// ─── File upload ──────────────────────────────────────────────

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

document.getElementById('file-upload-input')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const nameEl = document.getElementById('file-upload-name');
  nameEl.textContent = file.name;
  nameEl.classList.remove('hidden');

  const ext = file.name.split('.').pop().toLowerCase();

  try {
    let text = '';
    if (ext === 'txt') {
      text = await file.text();
    } else if (ext === 'pdf') {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => item.str).join(' '));
      }
      text = pages.join('\n\n');
    } else if (ext === 'docx') {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    }

    if (text.trim()) {
      inputText.value = text.trim();
      inputText.dispatchEvent(new Event('input'));
    } else {
      showToast('No text found in file');
    }
  } catch {
    showToast('Could not read file — try copy-pasting instead');
  }

  e.target.value = '';
});

document.getElementById('file-upload-input-generate')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const nameEl = document.getElementById('file-upload-name-generate');
  nameEl.textContent = file.name;
  nameEl.classList.remove('hidden');

  const ext = file.name.split('.').pop().toLowerCase();

  try {
    let text = '';
    if (ext === 'txt') {
      text = await file.text();
    } else if (ext === 'pdf') {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map(item => item.str).join(' '));
      }
      text = pages.join('\n\n');
    } else if (ext === 'docx') {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    }

    if (text.trim()) {
      if (promptText) { promptText.value = text.trim(); promptText.dispatchEvent(new Event('input')); }
    } else {
      showToast('No text found in file');
    }
  } catch {
    showToast('Could not read file — try copy-pasting instead');
  }

  e.target.value = '';
});

// ─── Nav user ─────────────────────────────────────────────────

async function setupNavUser() {
  const navUser = document.getElementById('nav-user');
  if (!navUser) return;
  const session = await window.bipassAuth.getSession();
  if (session) {
    navUser.innerHTML = `<span class="nav-user-email">${session.user.email}</span><button class="nav-signout" id="nav-signout-btn">Sign out</button>`;
    document.getElementById('nav-signout-btn').addEventListener('click', () => window.bipassAuth.signOut());
  } else {
    navUser.innerHTML = `<a class="nav-link" href="login.html">Sign in</a>`;
  }
}

// ─── Init ─────────────────────────────────────────────────────

function setupDrawer(session) {
  const hamburger  = document.getElementById('nav-hamburger');
  const overlay    = document.getElementById('drawer-overlay');
  const drawer     = document.getElementById('drawer');
  const closeBtn   = document.getElementById('drawer-close');
  const drawerUser = document.getElementById('drawer-user');
  const signoutBtn = document.getElementById('drawer-signout-btn');

  const email = session ? session.user.email : '';
  let displayName = session ? (session.user.user_metadata?.display_name || '') : '';
  const tier = session ? (session.user.user_metadata?.tier || 'free') : 'free';
  const initials = () => (displayName || email || '?')[0].toUpperCase();

  function renderProfile() {
    drawerUser.innerHTML = `
      <div class="drawer-profile-row">
        <div class="drawer-avatar" id="drawer-avatar">${initials()}</div>
        <div class="drawer-profile">
          <div class="drawer-username-row">
            <span class="drawer-username" id="drawer-username">${displayName || 'Set a username'}</span>
            <button class="drawer-username-edit-btn" id="drawer-username-edit-btn" aria-label="Edit username">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          <span class="drawer-user-email">${email}</span>
        </div>
      </div>
    `;
    document.getElementById('drawer-username-edit-btn').addEventListener('click', startEdit);
  }

  function startEdit() {
    const current = displayName;
    document.getElementById('drawer-username-edit-btn').style.display = 'none';
    document.getElementById('drawer-username').outerHTML = `<input class="drawer-username-input" id="drawer-username-input" type="text" value="${current}" placeholder="Enter username" maxlength="30" />`;
    const input = document.getElementById('drawer-username-input');
    input.focus();
    input.select();

    let done = false;
    async function save() {
      if (done) return;
      done = true;
      const newName = input.value.trim();
      if (newName && newName !== current) {
        try {
          await window.bipassAuth.client.auth.updateUser({ data: { display_name: newName } });
          displayName = newName;
        } catch {}
      }
      renderProfile();
    }
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { done = true; renderProfile(); }
    });
    input.addEventListener('blur', save);
  }

  renderProfile();

  function openDrawer()  { drawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('drawer-lock'); }
  function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('drawer-lock'); }

  hamburger.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  if (signoutBtn) signoutBtn.addEventListener('click', () => window.bipassAuth.signOut());
}

async function init() {
  const session = await window.bipassAuth.requireAuth();
  if (!session) return;

  setupNavUser();
  setupDrawer(session);
  bipassSetupPlanStatus(session);

  // Show no-plan banner if user has no active plan
  const _tier = session.user.user_metadata?.tier || 'free';
  const _planExp = session.user.user_metadata?.plan_expires_at;
  const _hasPlan = _tier !== 'free' && (!_planExp || Date.now() < _planExp);
  if (!_hasPlan) {
    const _banner = document.getElementById('no-plan-banner');
    if (_banner) {
      _banner.classList.remove('hidden');
      document.getElementById('no-plan-banner-close')?.addEventListener('click', () => {
        _banner.classList.add('hidden');
      }, { once: true });
    }
  }

  restoreState();
  updateStats();
  bindEvents();
  loadSavedStyle(session);

  // Seed credit display from session metadata, then immediately refresh from server
  const valEl = document.getElementById('credit-val');
  if (valEl) {
    const cached = session.user.user_metadata?.credits ?? 5000;
    valEl.textContent = cached.toLocaleString();
  }
  window.bipassAuth.refreshCredits().then(fresh => {
    if (fresh !== null && valEl) valEl.textContent = fresh.toLocaleString();
  }).catch(() => {});

  // Show welcome modal for brand-new users
  if (!session.user.user_metadata?.signup_welcome_shown) {
    showWelcomeModal();
  }

  const autostart = sessionStorage.getItem('bipass_autostart');
  if (autostart) {
    sessionStorage.removeItem('bipass_autostart');
    setTimeout(() => { adjustLevel(); }, 50);
  }

  // Refresh plan status when user returns to tab
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      window.bipassAuth.refreshSession().then(fresh => {
        if (fresh) bipassSetupPlanStatus(fresh);
      }).catch(() => {});
    }
  });
}

async function showWelcomeModal() {
  const overlay = document.getElementById('welcome-modal');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('show'));

  // Initialize credits on server
  let expiresAt = Date.now() + 86400000;
  try {
    const token = await window.bipassAuth.getToken();
    const res = await fetch('/api/init-credits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.alreadyInit) {
      overlay.classList.remove('show');
      setTimeout(() => overlay.classList.add('hidden'), 250);
      return;
    }
    if (data.expiresAt) expiresAt = data.expiresAt;
  } catch (_) {}

  // Update credit display to 5,000
  const valEl = document.getElementById('credit-val');
  if (valEl) valEl.textContent = (5000).toLocaleString();

  // Live countdown
  const expireEl = document.getElementById('welcome-expire-val');
  function tick() {
    const remaining = expiresAt - Date.now();
    if (!expireEl) return;
    if (remaining <= 0) { expireEl.textContent = 'Expired'; return; }
    const h = Math.floor(remaining / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    expireEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  tick();
  const timer = setInterval(tick, 1000);

  document.getElementById('welcome-cta')?.addEventListener('click', () => {
    clearInterval(timer);
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.classList.add('hidden');
      window.__bipassShowExtPopup?.();
    }, 250);
  });
}

// ─── Restore state from sessionStorage (after regenerate) ─────

function restoreState() {
  const level = sessionStorage.getItem('bipass_level') || localStorage.getItem('bipass_pref_level') || 'easy';
  selectLevel(level);

  // Restore active tab
  const savedMode = sessionStorage.getItem('bipass_mode');
  if (savedMode === 'humanize') {
    document.getElementById('tab-humanize')?.click();
  }

  const savedPrompt = sessionStorage.getItem('bipass_prompt');
  const savedInput  = sessionStorage.getItem('bipass_input');
  if (savedPrompt && promptText) { promptText.value = savedPrompt; }
  if (savedInput)  { inputText.value  = savedInput; }

  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    const saved = parseInt(sessionStorage.getItem(`bipass_m_${type}`) || '0');
    const slider = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
    if (slider && saved > 0) {
      slider.value = saved;
      updateSliderFill(slider);
      const valEl = optionsPanel?.querySelector(`.mistake-slider-val[data-mistake="${type}"]`);
      if (valEl) valEl.textContent = mistakeLabel(saved);
    }
  }
  const savedWL = parseInt(sessionStorage.getItem('bipass_m_wordlevel') || '5');
  const wlSlider = optionsPanel?.querySelector('input.mistake-slider[data-mistake="wordlevel"]');
  if (wlSlider) {
    wlSlider.value = savedWL;
    updateSliderFill(wlSlider);
    const wlVal = optionsPanel?.querySelector('.mistake-slider-val[data-mistake="wordlevel"]');
    if (wlVal) wlVal.textContent = wordLevelLabel(savedWL);
  }
  const savedMyStyle = sessionStorage.getItem('bipass_my_style');
  if (savedMyStyle !== null) {
    myStyleActive = savedMyStyle === 'true';
  } else {
    myStyleActive = localStorage.getItem('bipass_pref_mystyle') === 'true';
  }
  colCustomize?.classList.add('col-active');
}

// ─── Events ───────────────────────────────────────────────────

function bindEvents() {
  inputText.addEventListener('input', updateStats);
  inputText.addEventListener('paste', () => setTimeout(updateStats, 0));

  pills.forEach(pill => {
    pill.addEventListener('click', () => selectLevel(pill.dataset.level));
  });

  // Lock sentence structure toggle
  const lockBtn   = document.getElementById('lock-structure-btn');
  const lockLabel = document.getElementById('lock-structure-label');
  if (lockBtn) {
    function syncLockBtn() {
      lockBtn.classList.toggle('active', lockSentenceStructure);
      lockBtn.setAttribute('aria-pressed', String(lockSentenceStructure));
      lockLabel.textContent = lockSentenceStructure ? 'Structure locked' : 'Lock sentence structure';
    }
    syncLockBtn();
    lockBtn.addEventListener('click', () => {
      lockSentenceStructure = !lockSentenceStructure;
      localStorage.setItem('bipass_lock_structure', lockSentenceStructure ? 'true' : 'false');
      syncLockBtn();
    });
  }

  // Mistake sliders
  optionsPanel?.querySelectorAll('.mistake-slider').forEach(slider => {
    const type = slider.dataset.mistake;
    updateSliderFill(slider);
    slider.addEventListener('input', () => {
      const valEl = optionsPanel?.querySelector(`.mistake-slider-val[data-mistake="${type}"]`);
      if (valEl) valEl.textContent = type === 'wordlevel' ? wordLevelLabel(slider.value) : mistakeLabel(slider.value);
      updateSliderFill(slider);
      sessionStorage.setItem(`bipass_m_${type}`, slider.value);
      // Auto-detach from style on manual adjustment — fires once per drag
      if (myStyleActive) {
        myStyleActive = false;
        sessionStorage.setItem('bipass_my_style', 'false');
        renderStyleList();
      }
    });
  });

  humanizeBtn.addEventListener('click', adjustLevel);

  document.getElementById('loading-cancel-btn')?.addEventListener('click', () => {
    if (currentAbortController) { currentAbortController.abort(); currentAbortController = null; }
    setLoading(false);
    showToast('Cancelled');
  });

  // My Style events
  let sampleCount = 1;

  function updateDeleteVisibility() {
    const btns = sampleContainer.querySelectorAll('.sample-delete-btn');
    btns.forEach(b => { b.style.visibility = sampleCount <= 1 ? 'hidden' : ''; });
  }

  function makeSampleDeleteBtn(row) {
    const del = document.createElement('button');
    del.className = 'sample-delete-btn';
    del.type = 'button';
    del.setAttribute('aria-label', 'Remove sample');
    del.textContent = '×';
    del.addEventListener('click', () => {
      if (sampleCount <= 1) return;
      row.remove();
      sampleCount--;
      addSampleBtn.style.display = '';
      updateDeleteVisibility();
    });
    return del;
  }

  // Wire delete on the initial first sample
  document.querySelectorAll('.sample-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (sampleCount <= 1) return;
      btn.closest('.sample-row').remove();
      sampleCount--;
      addSampleBtn.style.display = '';
      updateDeleteVisibility();
    });
  });

  // Hide the single initial delete button on load
  updateDeleteVisibility();

  addSampleBtn.addEventListener('click', () => {
    if (sampleCount >= 5) return;
    sampleCount++;
    const row = document.createElement('div');
    row.className = 'sample-row';
    const ta = document.createElement('textarea');
    ta.className = 'style-sample-textarea';
    ta.id = `style-sample-${sampleCount}`;
    ta.placeholder = `Paste sample ${sampleCount}…`;
    ta.rows = 4;
    row.appendChild(ta);
    row.appendChild(makeSampleDeleteBtn(row));
    const wc = document.createElement('span');
    wc.className = 'sample-wc';
    wc.textContent = '0 / 50';
    row.appendChild(wc);
    sampleContainer.appendChild(row);
    if (sampleCount >= 5) addSampleBtn.style.display = 'none';
    updateDeleteVisibility();
  });

  analyzeStyleBtn.addEventListener('click', analyzeStyle);

  // Clear error borders as user types
  document.getElementById('style-name-input')?.addEventListener('input', function () {
    this.classList.remove('field-error');
  });
  sampleContainer.addEventListener('input', (e) => {
    if (!e.target.classList.contains('style-sample-textarea')) return;
    const ta = e.target;
    ta.classList.remove('field-error');
    const words = ta.value.trim() === '' ? 0 : ta.value.trim().split(/\s+/).length;
    const wc = ta.closest('.sample-row')?.querySelector('.sample-wc');
    if (wc) {
      wc.textContent = `${words} / 50`;
      wc.classList.toggle('wc-ok', words >= 50);
    }
  });

}

// ─── Level selection ──────────────────────────────────────────

function selectLevel(level) {
  deactivateMyStyle();
  selectedLevel = level;
  pills.forEach(p => p.classList.toggle('active', p.dataset.level === level));
  levelDesc.textContent  = LEVEL_DESCRIPTIONS[level];
  levelLabel.textContent = level.charAt(0).toUpperCase() + level.slice(1);
  levelGlider.style.transform = `translateX(${LEVEL_INDEX[level] * 100}%)`;
  optionsPanel.style.display = level === 'customize' ? 'flex' : 'none';
}

// ─── My Style ─────────────────────────────────────────────────

function activateMyStyle() {
  myStyleActive = !!savedStyle;
  sessionStorage.setItem('bipass_my_style', myStyleActive ? 'true' : 'false');
}

function deactivateMyStyle() {
  myStyleActive = false;
  sessionStorage.setItem('bipass_my_style', 'false');
}

let styleTraitSaveTimer = null;

function saveStoredStyles() {
  try {
    localStorage.setItem('bipass_styles_v1', JSON.stringify({ styles: savedStyles, activeId: activeStyleId }));
  } catch (_) {}
}

function saveStyleTraits() {
  saveStoredStyles();
  clearTimeout(styleTraitSaveTimer);
  styleTraitSaveTimer = setTimeout(async () => {
    try {
      const session = await window.bipassAuth.getSession();
      if (!session || !savedStyle) return;
      await window.bipassAuth.client.from('user_styles').upsert({
        user_id:       session.user.id,
        style_summary: savedStyle.style_summary,
        style_prompt:  savedStyle.style_prompt,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (_) {}
  }, 500);
}

function getTraits() {
  let raw = [];
  try { raw = JSON.parse(savedStyle.style_summary); } catch (_) { raw = [savedStyle.style_summary]; }
  return raw.map(t => {
    if (typeof t === 'string') return { name: t, intensity: 10 };
    const intensity = t.intensity ?? 10;
    // Migrate old 0/1/2 scale → 0/5/10
    const migrated = intensity <= 2 ? intensity * 5 : intensity;
    return { name: t.name, intensity: migrated };
  });
}

function updateSliderFill(slider) {
  const pct = (parseInt(slider.value) / 10) * 100;
  slider.style.setProperty('--pct', `${pct}%`);
}

function mistakeLabel(v) {
  v = parseInt(v);
  if (v === 0) return 'None';
  if (v <= 2) return 'Subtle';
  if (v <= 5) return 'Moderate';
  if (v <= 8) return 'Strong';
  return 'Heavy';
}

function wordLevelLabel(v) {
  v = parseInt(v);
  if (v <= 1) return 'Elementary';
  if (v <= 3) return 'Beginner';
  if (v <= 6) return 'Student';
  if (v <= 8) return 'Academic';
  return 'Expert';
}

function traitIntensityLabel(val) {
  if (val === 0)  return 'None';
  if (val <= 2)   return 'Very subtle';
  if (val <= 4)   return 'Subtle';
  if (val <= 6)   return 'Moderate';
  if (val <= 8)   return 'Strong';
  return 'Heavy';
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderTraitSliders(container, style) {
  const prevSaved = savedStyle;
  savedStyle = style;
  const traits = getTraits();
  savedStyle = prevSaved;

  container.innerHTML = `<div class="style-trait-rows">${
    traits.map((t, i) => `
      <div class="style-trait-row">
        <div class="trait-slider-head">
          <span class="style-trait-name">${escapeHtml(t.name)}</span>
          <span class="trait-slider-val">${traitIntensityLabel(t.intensity)}</span>
        </div>
        <input class="trait-slider" type="range" min="0" max="10" step="1"
               value="${t.intensity}" data-trait-idx="${i}" data-sid="${escapeHtml(style.id)}">
      </div>`).join('')
  }</div>`;

  container.querySelectorAll('.trait-slider').forEach(slider => {
    updateSliderFill(slider);
    slider.addEventListener('input', () => {
      const sid = slider.dataset.sid;
      const s = savedStyles.find(x => x.id === sid);
      if (!s) return;
      const prevSaved2 = savedStyle;
      savedStyle = s;
      const currentTraits = getTraits();
      savedStyle = prevSaved2;
      const idx = parseInt(slider.dataset.traitIdx);
      const val = parseInt(slider.value);
      slider.previousElementSibling.querySelector('.trait-slider-val').textContent = traitIntensityLabel(val);
      updateSliderFill(slider);
      currentTraits[idx].intensity = val;
      s.style_summary = JSON.stringify(currentTraits);
      if (s.id === activeStyleId) savedStyle = s;
      saveStyleTraits();
    });
  });
}

function showStyleDeleteModal(styleName, onConfirm) {
  const existing = document.getElementById('style-delete-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'style-delete-modal';
  modal.className = 'style-delete-modal-overlay';
  modal.innerHTML = `
    <div class="style-delete-modal-card">
      <div class="style-delete-modal-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </div>
      <div class="style-delete-modal-title">Delete style?</div>
      <div class="style-delete-modal-sub">
        "${escapeHtml(styleName)}" will be permanently removed.
      </div>
      <div class="style-delete-modal-actions">
        <button class="style-delete-modal-cancel">Cancel</button>
        <button class="style-delete-modal-confirm">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));

  const close = () => {
    modal.classList.remove('open');
    setTimeout(() => modal.remove(), 200);
  };

  modal.querySelector('.style-delete-modal-confirm').addEventListener('click', () => {
    close();
    onConfirm();
  });
  modal.querySelector('.style-delete-modal-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

function renderStyleList() {
  myStyleInputs.style.display = 'none';
  styleCardsList.style.display = 'flex';

  styleCardsList.innerHTML = savedStyles.map(style => {
    const isActive = style.id === activeStyleId && myStyleActive;
    return `
      <div class="style-card ${isActive ? 'style-card-active' : ''}" data-id="${escapeHtml(style.id)}">
        <div class="style-card-header">
          <input class="style-card-name" type="text"
                 value="${escapeHtml(style.name || '')}"
                 placeholder="Name this style…" maxlength="30" />
          <div class="style-card-btns">
            <button class="style-use-btn ${isActive ? 'active' : ''}" data-id="${escapeHtml(style.id)}">
              ${isActive ? 'Using' : 'Use'}
            </button>
            <button class="style-delete-btn" data-id="${escapeHtml(style.id)}">✕</button>
          </div>
        </div>
      </div>`;
  }).join('') + `<button class="create-another-btn" id="create-another-btn">+ Create another style</button>`;

  styleCardsList.querySelectorAll('.style-card-name').forEach(input => {
    input.addEventListener('input', () => {
      const id = input.closest('[data-id]').dataset.id;
      const s = savedStyles.find(x => x.id === id);
      if (s) { s.name = input.value; saveStoredStyles(); }
    });
  });

  styleCardsList.querySelectorAll('.style-use-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const isAlreadyActive = btn.classList.contains('active');

      if (isAlreadyActive) {
        // Full deactivate — reset sliders to None
        myStyleActive = false;
        sessionStorage.setItem('bipass_my_style', 'false');
        saveStoredStyles();
        renderStyleList();
        resetSlidersToNone();
      } else {
        // Activate — load style into sliders
        activeStyleId = id;
        savedStyle = savedStyles.find(s => s.id === id) || null;
        saveStoredStyles();
        // selectLevel calls deactivateMyStyle, so it must come before we set myStyleActive
        if (selectedLevel !== 'customize') selectLevel('customize');
        myStyleActive = !!savedStyle;
        sessionStorage.setItem('bipass_my_style', myStyleActive ? 'true' : 'false');
        renderStyleList();
        if (savedStyle) setSlidersFromStyle(savedStyle);
      }
    });
  });

  styleCardsList.querySelectorAll('.style-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const styleName = savedStyles.find(s => s.id === id)?.name || 'this style';
      showStyleDeleteModal(styleName, () => {
        savedStyles = savedStyles.filter(s => s.id !== id);
        if (activeStyleId === id) {
          activeStyleId = savedStyles[0]?.id || null;
          savedStyle = savedStyles[0] || null;
        }
        saveStoredStyles();
        if (savedStyles.length === 0) {
          deactivateMyStyle();
          styleCardsList.style.display = 'none';
          myStyleInputs.style.display = '';
        } else {
          renderStyleList();
        }
      });
    });
  });



  document.getElementById('create-another-btn')?.addEventListener('click', () => {
    styleCardsList.style.display = 'none';
    myStyleInputs.style.display = '';
    if (!document.getElementById('back-to-styles-btn')) {
      const backBtn = document.createElement('button');
      backBtn.id = 'back-to-styles-btn';
      backBtn.className = 'reanalyze-link';
      backBtn.style.marginTop = '6px';
      backBtn.textContent = '← Back to styles';
      backBtn.addEventListener('click', () => { backBtn.remove(); renderStyleList(); });
      myStyleInputs.appendChild(backBtn);
    }
  });
}

async function loadSavedStyle(session) {
  // Load from localStorage first
  let loadedFromStorage = false;
  try {
    const raw = localStorage.getItem('bipass_styles_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      savedStyles = Array.isArray(parsed.styles) ? parsed.styles : [];
      activeStyleId = parsed.activeId || null;
      savedStyle = savedStyles.find(s => s.id === activeStyleId) || savedStyles[0] || null;
      if (savedStyle && !activeStyleId) activeStyleId = savedStyle.id;
      loadedFromStorage = true;
    }
  } catch (_) {}

  if (loadedFromStorage) {
    if (savedStyles.length > 0) {
      renderStyleList();
      if (myStyleActive && savedStyle) {
        activateMyStyle();
        setSlidersFromStyle(savedStyle);
      }
    }
    return;
  }

  // Fallback: migrate legacy single style from Supabase
  try {
    const { data } = await window.bipassAuth.client
      .from('user_styles')
      .select('style_summary, style_prompt')
      .eq('user_id', session.user.id)
      .single();
    if (data) {
      const id = Date.now().toString();
      savedStyles = [{ id, name: '', style_summary: data.style_summary, style_prompt: data.style_prompt }];
      activeStyleId = id;
      savedStyle = savedStyles[0];
      saveStoredStyles();
      renderStyleList();
      if (myStyleActive) activateMyStyle();
    }
  } catch (_) {}
}

async function analyzeStyle() {
  let valid = true;

  // Validate style name
  const nameInput = document.getElementById('style-name-input');
  if (!nameInput?.value.trim()) {
    nameInput?.classList.add('field-error');
    valid = false;
  }

  // Validate each sample — must have ≥ 50 words
  const textareas = Array.from(document.querySelectorAll('.style-sample-textarea'));
  const samples = [];
  textareas.forEach(ta => {
    const text = ta.value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    if (words < 50) {
      ta.classList.add('field-error');
      valid = false;
    } else {
      samples.push(text);
    }
  });

  if (!valid) return;

  analyzeLabel.style.display  = 'none';
  analyzeLoader.style.display = '';
  analyzeLoader.textContent   = 'Analyzing.';
  analyzeStyleBtn.disabled    = true;

  let _dotCount = 1;
  const _dotsTimer = setInterval(() => {
    _dotCount = (_dotCount % 3) + 1;
    analyzeLoader.textContent = 'Analyzing' + '.'.repeat(_dotCount);
  }, 450);

  const prompt = `Analyze these writing samples. Return ONLY a single-line JSON object — no markdown, no code fences, no line breaks inside the JSON, no explanation before or after.

Look for personal writing habits that appear regardless of topic: spelling errors, grammar mistakes, missing or wrong capitalisation, punctuation habits, repeated words, run-on sentences, vocabulary level. Ignore sentence length or writing structure — those depend on the topic.

Use this exact format (replace the example values with real findings, keep it on ONE LINE):
{"traits":[{"name":"Grammar mistakes","intensity":7},{"name":"Missing capitals","intensity":4},{"name":"Word repetition","intensity":9}],"style_prompt":"A single paragraph describing this person's specific writing quirks for an AI to replicate. End with: Apply these personal quirks to whatever format the user requests."}

intensity must be 0–10 where 0=none, 1–2=very subtle, 3–4=subtle, 5–6=moderate, 7–8=strong, 9–10=heavy. Use the full range to accurately reflect how prominently each trait appears in the samples. Include up to 7 traits.

Writing samples:
${samples.map((s, i) => `Sample ${i + 1}: ${s}`).join('\n')}`;

  try {
    const token = await window.bipassAuth.getToken();
    if (!token) throw new Error('Not signed in');
    const res   = await fetch('/api/analyze', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body:    JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || `Server error ${res.status}`);
    }
    const data = await res.json();
    console.log('[analyze] raw result:', data.result);
    const rawStr = (data.result || '').replace(/```json|```/g, '').trim();
    const jsonStr = rawStr.match(/\{[\s\S]*\}/)?.[0] || rawStr;
    let json;
    try {
      json = JSON.parse(jsonStr);
    } catch {
      const cleaned = jsonStr.replace(/[\r\n\t]/g, ' ').replace(/\s{2,}/g, ' ');
      json = JSON.parse(cleaned);
    }
    if (!json.traits || !json.style_prompt) throw new Error('Missing traits or style_prompt in response');

    // Normalise traits — accept both {name,intensity} objects and plain strings
    const normTraits = json.traits.map(t =>
      typeof t === 'string' ? { name: t, intensity: 2 } : { name: t.name, intensity: t.intensity ?? 2 }
    );

    const styleName = document.getElementById('style-name-input')?.value.trim() || '';
    const newStyle = {
      id: Date.now().toString(),
      name: styleName,
      style_summary: JSON.stringify(normTraits),
      style_prompt: json.style_prompt,
    };
    savedStyles.push(newStyle);
    activeStyleId = newStyle.id;
    savedStyle = newStyle;
    saveStoredStyles();
    document.getElementById('back-to-styles-btn')?.remove();
    renderStyleList();
    const nameInput = document.getElementById('style-name-input');
    if (nameInput) nameInput.value = '';
    showToast('Style analyzed');
    myStyleActive = true;
    sessionStorage.setItem('bipass_my_style', 'true');
    setSlidersFromStyle(newStyle);

    try {
      const session = await window.bipassAuth.getSession();
      await window.bipassAuth.client.from('user_styles').upsert({
        user_id:       session.user.id,
        style_summary: JSON.stringify(normTraits),
        style_prompt:  json.style_prompt,
        sample_count:  samples.length,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (saveErr) {
      console.warn('Style save failed (non-critical):', saveErr);
    }
  } catch (e) {
    console.error('analyzeStyle error:', e?.message || e);
    showToast('Could not analyze style — ' + (e?.message?.slice(0, 60) || 'try again'));
  } finally {
    clearInterval(_dotsTimer);
    analyzeLabel.style.display  = '';
    analyzeLoader.style.display = 'none';
    analyzeStyleBtn.disabled    = false;
  }
}

// ─── Stats ────────────────────────────────────────────────────

function countWords(val) {
  return val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
}

function estimateGenerateCost(prompt) {
  const match = prompt.match(/(\d[\d,]*)[- ]word/i);
  if (!match) return null;
  const words = parseInt(match[1].replace(/,/g, ''));
  return Math.round(words * 5);
}

function updateCostPreview(elId, chars) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (chars === null && elId === 'generate-cost') {
    const hasText = document.getElementById('prompt-text')?.value.trim();
    if (hasText) {
      el.textContent = 'cost varies with output length';
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
      el.textContent = '';
    }
    return;
  }
  if (!chars) { el.classList.add('hidden'); el.textContent = ''; return; }
  el.textContent = `≈ ${chars.toLocaleString()} credits`;
  el.classList.remove('hidden');
}

function updateStats() {
  const val   = inputText.value;
  const words = countWords(val);
  charCount.textContent  = val.length.toLocaleString();
  wordCount.textContent  = words.toLocaleString();
  humanizeWc.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  updateCostPreview('humanize-cost', val.length || null);
}

// ─── Build prompts ────────────────────────────────────────────

const MISTAKE_KEYWORDS = {
  grammar:  ['grammar', 'grammatical'],
  tense:    ['tense', 'verb'],
  punct:    ['punctuation', 'punct', 'comma', 'period'],
  caps:     ['capital', 'capitalization'],
  spelling: ['spelling', 'typo', 'spell'],
};

const MISTAKE_PROMPTS = {
  grammar: [
    null,
    'Make one or two grammar mistakes — a subject-verb disagreement or a missing article.',
    'Make frequent grammar mistakes throughout — missing articles, wrong subject-verb agreement ("they was", "he don\'t"), run-on sentences.',
  ],
  tense: [
    null,
    'Make one or two verb tense mistakes — use present instead of past tense occasionally ("she tell me", "yesterday I go").',
    'Make frequent tense mistakes throughout — mix past and present tense consistently, like a non-native speaker ("I seen it", "she tell me yesterday", "we was there").',
  ],
  punct: [
    null,
    'Miss a comma or two, or add one where it doesn\'t belong.',
    'Use inconsistent punctuation throughout — miss commas often, overuse commas instead of periods, occasionally skip ending punctuation.',
  ],
  caps: [
    null,
    'Miss a capital letter once or twice — a proper noun left lowercase or a sentence starting without a capital.',
    'Frequently miss capital letters — proper nouns often lowercase, some sentences start without capitals, inconsistent throughout.',
  ],
  spelling: [
    null,
    'Make one or two minor spelling mistakes — a wrong homophone (their/there/they\'re, your/you\'re) or a simple repeated letter.',
    'Make several spelling mistakes — wrong homophones, simple misspellings ("recieve", "definately", "alot"), a typo or two.',
  ],
};

function getMistakeLevel(type) {
  const slider = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
  if (!slider) return 0;
  const val = parseInt(slider.value);
  if (val <= 2) return 0;
  if (val <= 6) return 1;
  return 2;
}

function resetSlidersToNone() {
  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    const slider = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
    if (!slider) continue;
    slider.value = 0;
    updateSliderFill(slider);
    const valEl = optionsPanel?.querySelector(`.mistake-slider-val[data-mistake="${type}"]`);
    if (valEl) valEl.textContent = 'None';
    sessionStorage.setItem(`bipass_m_${type}`, '0');
  }
}

function setSlidersFromStyle(style) {
  let traits = [];
  try { traits = JSON.parse(style.style_summary); } catch (_) {}
  if (!Array.isArray(traits)) traits = [];

  for (const [type, kws] of Object.entries(MISTAKE_KEYWORDS)) {
    const trait = traits.find(t => kws.some(k => t.name?.toLowerCase().includes(k)));
    const slider = optionsPanel?.querySelector(`input.mistake-slider[data-mistake="${type}"]`);
    if (!slider) continue;
    const intensity = trait ? Math.round(typeof trait.intensity === 'number' ? trait.intensity : 0) : 0;
    const mapped = intensity <= 2 ? intensity * 5 : intensity; // migrate old 0/1/2 scale
    slider.value = Math.min(10, mapped);
    updateSliderFill(slider);
    const valEl = optionsPanel?.querySelector(`.mistake-slider-val[data-mistake="${type}"]`);
    if (valEl) valEl.textContent = mistakeLabel(slider.value);
  }
}

function buildMistakeExtras() {
  const extras = [];
  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    const level = getMistakeLevel(type);
    if (level > 0 && MISTAKE_PROMPTS[type][level]) extras.push(MISTAKE_PROMPTS[type][level]);
  }
  return extras;
}

function buildTraitIntensityLine() {
  const traits = getTraits();
  function intensityWord(v) {
    if (v <= 2)  return 'very subtly';
    if (v <= 4)  return 'subtly';
    if (v <= 6)  return 'moderately';
    if (v <= 8)  return 'quite a lot';
    return 'heavily';
  }
  const active = traits.filter(t => t.intensity > 0)
    .map(t => `${t.name} (${intensityWord(t.intensity)})`).join(', ');
  return active ? `\nApply these writing traits at the given levels: ${active}.` : '';
}

function buildHumanizePrompt(text) {
  if (myStyleActive && savedStyle) {
    // Combined: full style description + specific mistake levels from sliders
    const extras = buildMistakeExtras();
    let prompt = savedStyle.style_prompt;
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
    return prompt + `\n\nText to rewrite:\n${text}`;
  }
  let prompt = HUMANIZE_PROMPTS[selectedLevel];
  if (selectedLevel === 'customize') {
    const extras = buildMistakeExtras();
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
  }
  prompt += `\n\nText to rewrite:\n${text}`;
  return prompt;
}

function buildGeneratePrompt(userPrompt) {
  const typeModifier = selectedWritingType ? WRITING_TYPE_PROMPTS[selectedWritingType] : '';
  if (myStyleActive && savedStyle) {
    const extras = buildMistakeExtras();
    let prompt = savedStyle.style_prompt;
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
    if (typeModifier) prompt += typeModifier;
    return prompt + `\n\nWhat to write:\n${userPrompt}`;
  }
  let prompt = GENERATE_PROMPTS[selectedLevel];
  if (selectedLevel === 'customize') {
    const extras = buildMistakeExtras();
    if (extras.length > 0) prompt += '\n\n' + extras.join('\n');
  }
  if (typeModifier) prompt += typeModifier;
  prompt += `\n\nWhat to write:\n${userPrompt}`;
  return prompt;
}

// ─── Generate ─────────────────────────────────────────────────

async function generateNew() {
  const prompt = promptText.value.trim();
  if (!prompt) { showToast('Enter a prompt first'); promptText.focus(); return; }

  updateCostPreview('generate-cost', null);
  saveState('generate');
  setLoading(true, 'Generating your text…');

  try {
    const result = postProcessOutput(await callAPIStream(buildGeneratePrompt(prompt)));
    await new Promise(r => setTimeout(r, 1200));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'generate');
    window.location.href = 'editor.html';
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'CreditError') return;
    setLoading(false);
    showToast(err.message || 'Something went wrong');
    setStatus('Error');
  }
}

// ─── Humanize ─────────────────────────────────────────────────

async function humanize() {
  const text = inputText.value.trim();
  if (!text) { showToast('Paste some text first'); inputText.focus(); return; }

  updateCostPreview('humanize-cost', null);
  saveState('humanize');
  setLoading(true, 'Humanizing your text…');

  try {
    const result = postProcessOutput(await callAPIStream(buildHumanizePrompt(text)));
    await new Promise(r => setTimeout(r, 1200));
    sessionStorage.setItem('bipass_result', result);
    sessionStorage.setItem('bipass_mode', 'humanize');
    window.location.href = 'editor.html';
  } catch (err) {
    if (err.name === 'AbortError' || err.name === 'CreditError') return;
    setLoading(false);
    showToast(err.message || 'Something went wrong');
    setStatus('Error');
  }
}

// ─── Save state for regenerate ────────────────────────────────

function saveState(mode) {
  sessionStorage.setItem('bipass_level',    selectedLevel);
  sessionStorage.setItem('bipass_mode',     mode);
  sessionStorage.setItem('bipass_prompt',   promptText.value);
  sessionStorage.setItem('bipass_input',    inputText.value);
  sessionStorage.setItem('bipass_my_style', myStyleActive);
  for (const type of ['grammar', 'tense', 'punct', 'caps', 'spelling']) {
    sessionStorage.setItem(`bipass_m_${type}`, getMistakeLevel(type));
  }
}

// ─── Streaming API call (for generate / humanize) ────────────

async function callAPIStream(prompt) {
  currentAbortController = new AbortController();
  const token = await window.bipassAuth.getToken();

  const res = await fetch('/api/stream', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify({ prompt, model: selectedModel }),
    signal:  currentAbortController.signal,
  });

  if (res.status === 402) {
    const data = await res.json().catch(() => ({}));
    const msg = data.error || 'No credits remaining';
    setLoading(false);
    // Refresh plan status so badge updates immediately
    window.bipassAuth.refreshSession().then(fresh => {
      if (fresh) bipassSetupPlanStatus(fresh);
    }).catch(() => {});
    showCreditWarning(msg);
    throw Object.assign(new Error(msg), { name: 'CreditError' });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${res.status}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  const credEl = document.getElementById('loading-credits');
  let buffer = '';
  let accumulated = '';
  let finalResult = null;
  let creditsData = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(line.slice(6));
        if (json.error) throw new Error(json.error);
        if (json.chunk) {
          accumulated += json.chunk;
        }
        if (json.polishing) {
          setLoading(true, 'Polishing to reduce AI detection…');
        }
        if (json.done) {
          finalResult = json.result;
          creditsData = { creditsUsed: json.creditsUsed, creditsRemaining: json.creditsRemaining };
          sessionStorage.setItem('bipass_tokens', JSON.stringify({
            input: json.inputTokens || 0,
            output: json.outputTokens || 0,
          }));
        }
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e;
      }
    }
  }

  if (!finalResult) {
    if (accumulated.trim()) finalResult = accumulated.trim();
    else throw new Error('No output received');
  }
  if (creditsData) {
    updateCreditDisplay(creditsData.creditsUsed, creditsData.creditsRemaining);
    animateLoadingCredits(creditsData.creditsUsed);
  }
  return finalResult;
}

// ─── API call (for style analysis) ───────────────────────────

async function callAPI(prompt) {
  currentAbortController = new AbortController();
  const token = await window.bipassAuth.getToken();
  const res = await fetch('/api/humanize', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body:    JSON.stringify({ prompt }),
    signal:  currentAbortController.signal,
  });

  if (res.status === 402) {
    showToast('No credits remaining — visit Plans to get more');
    throw new Error('No credits remaining');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  if (!data?.result) throw new Error('No output from server');

  if (data.creditsUsed !== undefined) {
    updateCreditDisplay(data.creditsUsed, data.creditsRemaining);
  }

  return data.result;
}

function animateLoadingCredits(total) {
  const wrapEl = document.getElementById('loading-credits-wrap');
  const numEl  = document.getElementById('loading-credits');
  if (!wrapEl || !numEl) return;
  numEl.textContent = '0';
  wrapEl.style.transition = 'opacity 0.25s ease';
  wrapEl.style.opacity = '1';
  animateCount(numEl, 0, total, 650);
}

function animateCount(el, from, to, duration = 700) {
  if (from === to || isNaN(from)) { el.textContent = to.toLocaleString(); return; }
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateCreditDisplay(used, remaining) {
  const valEl  = document.getElementById('credit-val');
  const badgeEl = document.getElementById('credit-used-badge');
  if (valEl) {
    const current = parseInt(valEl.textContent.replace(/[^0-9]/g, '')) || 0;
    animateCount(valEl, current, remaining);
  }
  if (badgeEl) {
    badgeEl.textContent = '−0 credits';
    badgeEl.classList.remove('hidden', 'credit-used-animate');
    void badgeEl.offsetWidth;
    badgeEl.classList.add('credit-used-animate');
    const badgeStart = performance.now();
    const badgeDur = 700;
    (function tickBadge(now) {
      const p = Math.min((now - badgeStart) / badgeDur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      badgeEl.textContent = `−${Math.round(used * ease).toLocaleString()} credits`;
      if (p < 1) requestAnimationFrame(tickBadge);
    })(performance.now());
  }
  // Confirm with a fresh server-side value a moment later
  setTimeout(() => {
    window.bipassAuth.refreshCredits().then(fresh => {
      if (fresh !== null && valEl) animateCount(valEl, remaining, fresh, 400);
    }).catch(() => {});
  }, 1500);
}

// ─── Loading overlay ──────────────────────────────────────────

function showCreditWarning(msg) {
  const modal = document.getElementById('no-plan-modal');
  const bodyEl = document.getElementById('no-plan-modal-body');
  if (!modal) { showToast(msg + ' — visit Plans'); return; }
  if (bodyEl && msg) bodyEl.textContent = msg;
  modal.classList.remove('hidden');
  requestAnimationFrame(() => modal.classList.add('show'));
  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => modal.classList.add('hidden'), 250);
  }
  document.getElementById('no-plan-modal-close')?.addEventListener('click', closeModal, { once: true });
  document.getElementById('no-plan-modal-dismiss')?.addEventListener('click', closeModal, { once: true });
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); }, { once: true });
}

// ─── Loading FX: decode headline + live rewrite strip + phase stepper ─
const _lfx = { decodeRaf: 0, rewriteTimer: 0, stepTimer: 0 };
const LFX_GLYPHS = '!<>-_\\/[]{}—=+*^?#%@&ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const LFX_PHRASES = [
  'rephrasing', 'varying cadence', 'softening tone', 'breaking patterns',
  'your words', 'adjusting rhythm', 'trimming filler', 'natural phrasing',
];
function lfxReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function lfxGlyph() { return LFX_GLYPHS[(Math.random() * LFX_GLYPHS.length) | 0]; }

function lfxDecodeHeadline(text) {
  if (!loadingText) return;
  cancelAnimationFrame(_lfx.decodeRaf);
  const chars = [...text];
  loadingText.innerHTML = '';
  const spans = chars.map((ch) => {
    const s = document.createElement('span');
    s.className = 'dc';
    s.textContent = ch;
    loadingText.appendChild(s);
    return s;
  });
  if (lfxReduced()) return;

  const start = performance.now();
  const perChar = 50;   // stagger each char's lock
  const settle  = 300;  // scramble window before a char locks
  function frame(now) {
    let done = true;
    const elapsed = now - start;
    chars.forEach((ch, i) => {
      const span = spans[i];
      if (ch === ' ') { span.textContent = ' '; span.classList.remove('scrambling'); return; }
      if (elapsed >= settle + i * perChar) {
        span.textContent = ch;
        span.classList.remove('scrambling');
      } else {
        span.textContent = lfxGlyph();
        span.classList.add('scrambling');
        done = false;
      }
    });
    if (!done) _lfx.decodeRaf = requestAnimationFrame(frame);
  }
  _lfx.decodeRaf = requestAnimationFrame(frame);
}

function lfxStartRewrite() {
  if (!loadingRewrite) return;
  if (lfxReduced()) { loadingRewrite.textContent = LFX_PHRASES[0]; return; }
  const WIDTH = 34;
  let pIdx = 0, tick = 0;
  function render() {
    const phrase = LFX_PHRASES[pIdx];
    const pad = Math.max(0, WIDTH - phrase.length);
    const left = pad >> 1, right = pad - left;
    let nL = '', nR = '';
    for (let i = 0; i < left;  i++) nL += Math.random() < 0.5 ? lfxGlyph() : ' ';
    for (let i = 0; i < right; i++) nR += Math.random() < 0.5 ? lfxGlyph() : ' ';
    loadingRewrite.innerHTML = '';
    const sL = document.createElement('span'); sL.className = 'rw-scramble'; sL.textContent = nL;
    const sR = document.createElement('span'); sR.className = 'rw-scramble'; sR.textContent = nR;
    loadingRewrite.append(sL, document.createTextNode(phrase), sR);
    if (++tick % 26 === 0) pIdx = (pIdx + 1) % LFX_PHRASES.length;
  }
  render();
  _lfx.rewriteTimer = setInterval(render, 70);
}

function lfxStartStepper() {
  if (!loadingStepper) return;
  const steps = loadingStepper.querySelectorAll('.loading-step');
  const underline = document.getElementById('loading-step-underline');
  if (!steps.length) return;
  function activate(i) {
    steps.forEach((s, n) => s.classList.toggle('active', n === i));
    if (underline) {
      underline.style.left  = steps[i].offsetLeft  + 'px';
      underline.style.width = steps[i].offsetWidth + 'px';
    }
  }
  activate(0);
  if (lfxReduced()) return;
  let idx = 0;
  _lfx.stepTimer = setInterval(() => {
    idx = (idx + 1) % steps.length;
    activate(idx);
  }, 1600);
}

function startLoadingFx(text) {
  lfxDecodeHeadline(text || 'Loading…');
  lfxStartRewrite();
  lfxStartStepper();
}

function stopLoadingFx() {
  cancelAnimationFrame(_lfx.decodeRaf);
  clearInterval(_lfx.rewriteTimer);
  clearInterval(_lfx.stepTimer);
  _lfx.decodeRaf = _lfx.rewriteTimer = _lfx.stepTimer = 0;
  if (loadingRewrite) loadingRewrite.textContent = '';
}

function setLoading(on, text) {
  if (generateBtn) generateBtn.disabled = on;
  humanizeBtn.disabled = on;

  if (on) {
    const credEl  = document.getElementById('loading-credits');
    const wrapEl  = document.getElementById('loading-credits-wrap');
    if (credEl)  credEl.textContent = '0';
    if (wrapEl)  { wrapEl.style.transition = 'none'; wrapEl.style.opacity = '0'; }
    workspace.style.opacity = '0';
    workspace.style.pointerEvents = 'none';
    loadingOverlay.classList.add('visible');
    startLoadingFx(text || 'Loading…');
    setStatus(text || 'Loading…');
  } else {
    workspace.style.opacity = '';
    workspace.style.pointerEvents = '';
    loadingOverlay.classList.remove('visible');
    stopLoadingFx();
    const credEl = document.getElementById('loading-credits');
    if (credEl) credEl.textContent = '';
    setStatus('Ready');
  }
}

// ─── Status ───────────────────────────────────────────────────

function setStatus(text) {
  if (statusLabel) statusLabel.textContent = text;
}

// ─── Toast ────────────────────────────────────────────────────

let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, 2200);
}

// ─── Navbar hide on scroll ────────────────────────────────────

(function () {
  const navbar = document.querySelector('.navbar');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY, diff = y - lastY;
    if (diff > 6 && y > 80) navbar.classList.add('hidden');
    else if (diff < -6) navbar.classList.remove('hidden');
    lastY = y;
  }, { passive: true });
})();

// ─── Scroll reveal ────────────────────────────────────────────

(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));
})();

// ─── Ticker bar dismiss ───────────────────────────────────────

(function () {
  const bar = document.getElementById('ticker-bar');
  const btn = document.getElementById('ticker-close-btn');
  if (!bar || !btn) return;
  if (localStorage.getItem('ticker-dismissed') === '1') bar.classList.add('hidden');
  btn.addEventListener('click', () => {
    bar.classList.add('hidden');
    localStorage.setItem('ticker-dismissed', '1');
  });
})();

// ─── Extension popup (first-visit onboarding) ─────────────────
(function () {
  const popup    = document.getElementById('ext-popup');
  const closeBtn = document.getElementById('ext-popup-close');
  const extBtn   = document.querySelector('.nav-ext-btn');
  if (!popup || !extBtn) return;

  function positionPopup() {
    const r  = extBtn.getBoundingClientRect();
    const pw = 340;
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
    popup.style.top  = (r.bottom + 10) + 'px';
    popup.style.left = left + 'px';
    const arrow = popup.querySelector('.ext-popup-arrow');
    if (arrow) arrow.style.left = (r.left + r.width / 2 - left) + 'px';
  }

  function showPopup() {
    positionPopup();
    popup.classList.add('show');
    localStorage.setItem('ext_popup_seen', '1');
  }

  function hidePopup() { popup.classList.remove('show'); }

  extBtn.addEventListener('click', (e) => {
    e.preventDefault();
    popup.classList.contains('show') ? hidePopup() : showPopup();
  });

  closeBtn?.addEventListener('click', hidePopup);

  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && !extBtn.contains(e.target)) hidePopup();
  });

  window.__bipassShowExtPopup = showPopup;

  if (!localStorage.getItem('ext_popup_seen') && !document.getElementById('welcome-modal')) {
    setTimeout(showPopup, 1400);
  }
})();

// ─── Own Text → Extension ────────────────────────────────────

(function () {
  const btn      = document.getElementById('own-text-push-btn');
  const textarea = document.getElementById('own-text-textarea');
  const label    = document.getElementById('own-text-btn-label');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const text = textarea?.value?.trim();
    if (!text) { textarea?.focus(); return; }

    btn.disabled = true;
    label.textContent = 'Pushing…';

    try {
      const session = await window.bipassAuth.getSession();
      if (!session) throw new Error('Not signed in');

      const { error } = await window.bipassAuth.client
        .from('results')
        .insert({ user_id: session.user.id, text, mode: 'humanize', level: 'easy', ext_push: true });
      if (error) throw error;

      label.textContent = '✓ Pushed to Extension';
      btn.classList.add('pushed');
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('pushed');
        label.textContent = 'Push to Extension';
      }, 3000);
    } catch {
      btn.disabled = false;
      label.textContent = '↻ Try Again';
      setTimeout(() => { label.textContent = 'Push to Extension'; }, 2500);
    }
  });
})();

// ─── Start ────────────────────────────────────────────────────

init();
