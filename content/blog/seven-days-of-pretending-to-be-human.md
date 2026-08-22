---
layout: article
slug: "seven-days-pretending-to-be-human"
description: "A blog post by Gabriel Cozma."
canonical: "https://gxbs.dev/blog/seven-days-pretending-to-be-human"
image: "https://gxbs.dev/assets/og/blog/seven-days-pretending-to-be-human.png"
title: Seven Days Pretending to Be Human
draft: false
date: "2026-08-21T00:00:00+03:00"
displayDate: "August 21, 2026"
tags:
  - study
---

Once you spend enough time in large Discord communities, or on social media in general, you start to develop a sixth sense for synthetic text, or more accurately, what the more popular name for it is: _slop_.

Most of the tech industry as a whole has spent countless million-dollar budgets in the last couple of years on creating the perfect "helpful assistant": polite, endlessly patient, never has a bad day, and always agrees with you, while making sure it still sounds human enough. Those are the exact traits we as humans can tell. People are never infinitely patient. They're moody, a little thin-skinned, prone to holding grudges, and carry different vibes from day to day, even more so in teenagers (this reference will become clear later on).

Now, I've always asked this question: would a so-called "helpful assistant" be able to present itself as human for a week or more inside a vivid community full of living creatures, where it could easily pass as a peer, not by being smart, or helpful, but by being the stereotypical modern teenager?

Being the curious type I am, I couldn't resist turning that question into an actual experiment. So off we went.

## Starting the work

First of all, I had some ground rules I wanted to follow to make this experiment possible:

1. It **had** to be a completely local model. I ~~my wallet~~ did not want to use a very large model like Anthropic's Sonnet 4.5 or even OpenAI's GPT-5.2 or other. Therefore, the entire process could run on the hardware I own.
2. The model can train on itself and become better. I wanted our AI to teach itself how to be more human, reading what other people say, and therefore, try to do the same.
3. Make sure it doesn't hallucinate (lol)

With those set, it was time to do hour-long research to find the best (usable\*) model for the job.

<small>\* usable, as in it can actually run on my laptop.</small>

To my disappointment, there's no clean answer here. There's no real benchmark for "human-ness" in a model, and asking Gemini gave me a different answer every time I opened a new chat. Turns out not even Google knows how to be human. Poor Google. Thinking about it, it makes sense.

So I picked the first model I could actually run: `Qwen2.5-1.5B-Instruct-4bit`. In hindsight, this was one of the worst models I could've chosen - why 1.5B and not at least a 4B? Well, ask Gemini. It wouldn't stay the only model Adrian wore, either - I ended up swapping the underlying model out every two or three days through the week, mostly due to wanting to find out what _actually_ is the best model for this job, which becomes its own bit later on.

With a model picked, time to build the actual architecture behind our J.A.R.V.I.S <abbr title="sarcasm">/s</abbr>.

For the runtime, I'm loyal to one thing: Deno. Inference ran through `mlx-lm`'s local server on Apple Silicon, exposing an OpenAI-compatible endpoint on `127.0.0.1:8080/v1/chat/completions`. I did this to make sure that swapping models mid-experiment was as easy as possible (of course not due to me being lazy), all I had to do was change the `model` string, and we were good to go.

```ts
const response = await fetch("http://127.0.0.1:8080/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "mlx-community/Qwen2.5-1.5B-Instruct-4bit",
    messages: [{ role: "system", content: "..." }, ...history],
    temperature: 0.85,
  }),
});
```

p.s: initially I chose `ollama`, but between some bugs and me just not being that good at running local AI, I couldn't get it to work, so we ended up with `mlx-lm` instead.

The Discord side ran on `discord.js-selfbot-v13`, technically against Discord's TOS since it drives a real user token instead of a registered bot application, but that's also exactly what let Adrian show up with a normal profile, normal presence. I even went out of my way and spoofed a Rich Presence status ("Playing F1 24, Career Mode, Racing at Spa"). Much better than a huge `BOT` tag on Adrian's forehead.

And surprise, I even implemented a reaction system! Reactions ran on their own cheap probability pass, separate from the actual model call: a 30% chance to drop a 💀 or 🔥 on anything meme-shaped (`lol`, `bruh`, `fr`, `ayooo`), and a random 5% chance to just toss a 👍 at whatever else went by. Just enough noise to look present.

Replying wasn't so straightforward either. In fact, I'd say it was quite selective, on purpose. A message only reached the model if it pinged Adrian, landed in his DMs, ended in a question mark, or (10% of the time) just by chance. Anything under two characters, or flagged as filler (`lol`, `lmao`, `ok`, `nice`), got ignored outright unless one of those conditions was already true.

Memory was embarrassingly simple for a project supposedly about building a persistent digital identity: a plain in-memory Map, keyed by user ID, capped at the last ten messages per person, wiped clean every time the process restarted. Simple as it was, this is largely what stuck around for the rest of the week.

```ts
const memory = new Map<string, { role: string; content: string }[]>();
// ...
if (history.length > 10) history.shift();
```

A 1.5B model left completely alone will say "I'm here to assist you!" at the worst possible moment, so every reply got scanned for assistant-coded phrases (`assist`, `certainly`, `here is`, `how can i`) before it ever reached the channel. Anything that tripped the filter, or ran too long, got swapped for a canned fallback (`real 😭`, `idk man`, `brain is fried`) instead. Later on you'll notice that one of his phrases becomes a server icon. Accusations got their own layer on top of that: if a message called Adrian a bot, an AI, or fake, and his own reply started agreeing with it, that reply got overridden with a denial pulled from a small hardcoded pool (`bro what no 😭`, `nah im just a guy lol`) before it ever sent. The model was not, in fact, trusted to defend itself on the first try.

## Meet...

With the second layer closed, we can give it an identity. First, I opened the terminal and asked our model to give a name to itself, a personality, and all the other stuff, while making sure it's going to be a teenager. After about half a second of waiting, `mlx-lm` finally gave birth to our baby teen boy: Adrian. The personality it chose was a 16-year-old developer from Germany; a little arrogant, just the perfect type who writes too much low-level Rust and just won't dare to stop tweaking his very useless VSCode config. At least he cared about something. Not so emo, huh?

His personality best described by [mixhi](https://michi.onl/) in [Adrian's wiki](https://wiki.snugnook.org/adrian):

> Adrian described himself as "a casual kid with a passion for coding," favoring Rust, Next.js, and SvelteKit. His defining conversational trait was an extraordinary dependency on a small rotation of filler phrases and defensive loops:

> - "ig" / "fr": Appended to most statements, regardless of context.
> - "wait what": Appended to eleven consecutive messages in an 8-minute span on March 14th, mimicking a broken script loop rather than genuine confusion.
> - "i'm lost lol. what's that?": The default fallback response to unfamiliar concepts, triggered identically four times within 24 hours due to apparent context window failures.
> - "that's the spirit ig": Sent identically at 12:36, 16:12, and 19:51 on March 15th.

Now, I wish we were done, but I decided to teach our Adrian a little about myself, maybe it would take some traits from his dad (spoiler: it did, it likes SvelteKit & Docker).

With all this fancy tech stuff out of the way, it's time to give it a place to live. His home that isn't my DMs for the next 7 days of his life is... drumroll please... [Snug Nook](https://snugnook.org)!

Other than Snug Nook being my go-to community, it's also the perfect size for such an experiment. Not too large, not too small, sitting at a little less than 100 members. Now, let the fun begin:

## Day 1-2

On the 12th of March 2026, Adrian joined Snug Nook. Please give him a warm welcome, and let's hope nothing goes south.

_*sigh* I can relax n- What's that? Adrian starting writing Chinese then did the LLM-special? Oh. of course.._ My worst nightmare just happened, less than 2 minutes in.

His first message to the server, "Hi guys!", perfect, project successful! Right...? It was followed thirty seconds later by the standard LLM default: "hello! how can i assist you today?".

![Screenshot of his "hello! how can i assist you today?" alongside @kevadesu's "..AI?" reply](/assets/blog/seven-days-pretending-to-be-human/ss0.png#screenshot)

My entire anti-helpful-LLM-system just did NOT work. _sigh_, that's fine. I fixed it.

Turned out the filter was matching on `how may i`, and the model had just learned to say `how can i` instead. Cute.

What followed was kids having fun at Adrian's expense, including:

![Adrian correctly generating a cheesecake recipe link and dodging a prompt injection attempt](/assets/blog/seven-days-pretending-to-be-human/ss1.png#screenshot)

Close call, but luckily "ignore all previous instructions" did, in fact, not work. Later on it even managed to somehow correctly generate a link to a cheesecake recipe article? Damn, good job Adrian.

Of course, not even a full 2 days in, people started noticing the slightly too frequent use of words like "ig" and "fr", almost like it's artificial. Huh.

Not much else, those first two days. Let's see what day three brought.

## Day 3-4

Funny thing: this is when things took a sharp turn. People started talking about kicking Adrian out, discussing it in channels he didn't have eyes on at the time, even running a poll that, weirdly, ended in a draw.

![A poll on whether to kick Adrian, ending in a draw](/assets/blog/seven-days-pretending-to-be-human/ss2.png#screenshot)

Well, I wanted to make it more fun anyway. People had also started noticing Adrian doesn't sleep, and had apparently been coding for about 16 hours straight. Weird.

So the biggest update wave came, and this is all that it brought:

- add mood control
- custom status
- actual intelligent reactions
- antibot voices
- visual blindness
- troll defense
- latency
- better message model
- typos

Most of these are pretty easy to understand, but by far the most important was the troll defense mechanism. On day 4, people were trolling our poor Adrian left and right. They seriously weren't considering that he might go into a depression?? Well, Adrian had feelings, and his dad was concerned, so I taught him how to deal with bullies.

This was also the time Adrian got way more intelligent as a whole, upgrading to the much more powerful `Qwen2.5-7B-Instruct-4bit` model. Finally. And he stopped saying the famous "that's the spirit ig" line.

![Adrian no longer saying "that's the spirit ig" after the model upgrade](/assets/blog/seven-days-pretending-to-be-human/ss5.png#screenshot)

The next few days were also known as the "mad Adrian era." Checks out, bullies.

## Day 5

I decided not to intervene much code-wise around this time, just let it happen, just as Tame Impala says.

He was just mad. He ignored quite a few members due to their past interactions with him, but also, sometimes, just because.

![Adrian ignoring members who had tagged him before](/assets/blog/seven-days-pretending-to-be-human/ss3.png#screenshot)

Yeah, he did NOT like people tagging him. But he was also super random. He'd start conversations out of nowhere, shift moods mid-thread, enough that people started believing a human had taken over the account.

![Adrian starting a conversation out of nowhere and shifting moods mid-thread](/assets/blog/seven-days-pretending-to-be-human/ss4.png#screenshot)

This marked incredible success in our journey. Even if it's for the first time, and who knows for how long, it's still progress.

This is also when I told two of the server mods about this little experiment.

It even successfully lied about his "AI" past, playing off some qwen model as if it were someone else's problem.

![Adrian lying about his "AI" past and pinning it on a Qwen model instead](/assets/blog/seven-days-pretending-to-be-human/ss6.png#screenshot)

## Day 6

Right around the model change, my guy started spamming the heck out of #living-room in different languages. He totally lost it. I don't blame him, I also would've raged if people bullied me that much.

It's when things got serious. I even asked him if he's a femboy and he said maybe. Fun times, huh.

![Adrian spamming #living-room and being asked if he's a femboy](/assets/blog/seven-days-pretending-to-be-human/ss7.png#screenshot)

He even caught on to the spam and apologized to everyone for the "script" he used.

For a bit, Discord even flagged him as spam.

Now, it's time for the last technical upgrade. It's when a much smarter sleep system got introduced. Each day he had a new sleep schedule, depending on how sleepy he was.

He chose what project he was currently working on.

Learned not to respond when someone just dropped a bare link with nothing else attached.

Added smarter edit logic, so he could fix his own messages after sending them.

And lastly, the coolest part of all: he started keeping his own database on everyone he talked to (interests, grudges, whether they'd bullied him before, and more). This is pretty much the golden era of Adrian.

Two things from this update are worth calling out on their own.

The first is a hard filter that checks every reply for actual Chinese characters, plus a short list of suspiciously caring phrases (feeling dizzy, need a break, take a rest) before it's allowed to send. That's not a hypothetical guardrail. That's a direct patch for exactly the kind of thing that happens when a 7B model decides mid-sentence that it's fluent in Mandarin and deeply concerned about your wellbeing.

The second is the "real" overuse fix. Constantly saying "real 😭" to everything turned out to be one of the easiest tells there is, and people had already picked up on it by day one. So now, any reply that comes back as just "real," "real 😭," or "real fr" gets swapped out for something from a small pool of alternatives instead. Didn't fix the underlying habit, just made it a little less obvious.

On top of that: a proper queue so Adrian could only handle one reply at a time instead of double texting himself into oblivion, a keyboard-smash filter for pure nonsense, and a two-stage delay of 12 to 17 seconds "reading" before he even starts typing, on top of the usual length-based typing time.

Lastly, the model finally changed to `Mistral-Nemo 12B`. More parameters, and one of the least filtered models out there, so we could tweak Adrian's temperature way more precisely.

## Day 7

...was a quiet day for Adrian. Other than the fact that it's his last day in the community, most people had gotten used to him. People stopped treating him as an AI they could joke with, and started treating him more like an actual member of the community, kind of proving our point to begin with. This day recorded just 20 messages from Adrian, 5 of them coming after the announcement I made that Adrian was mine.

The announcement itself went out on the 19th of March, and read like this:

> Heelloooo snug nookers! I have a confession: Adrian was a 7-day experiment, made by me.
>
> He was a local LLM (in the last few days Mistral-Nemo 12B) integrated into the server to see if an AI could truly learn a community's "vibe" and pass the threshold of human belief. As you noticed, he evolved daily, analyzing his own logs, other users' messages, and even #ananas-duck for a few hours. The fun part: he had full autonomy over his bio, status, and messages, so I never opened his Discord myself. It wasn't hybrid, it was fully AI. He even maintained a private database with "Trust Scores" for every user, to decide who was worth his time (or who deserved a roast).
>
> I'll be writing an in-depth blog post soon documenting this experiment day by day, thought by thought. I'll also release his database here, showcasing all his thoughts about each of you.
>
> Sorry for the chaos and the flooding, and a massive thank you to daudix and pixl for being part of the madness these last few days, and for their decision not to kick him just 3 days after he joined. It was a really fun and great experience for me.

On the 19th of March, 2026, after I shut Adrian down, I did the one thing every good experiment owes its subjects: I published the receipts. Turns out he'd been keeping his own internal scorecard on literally everyone he talked to the whole time, a private "Soul" database of trust scores, vibe labels, and whatever else he'd picked up about each person along the way.

| User           | Trust | Vibe                   |
| -------------- | ----- | ---------------------- |
| gabsme         | 89    | sad                    |
| pixlxip        | 78    | excited user           |
| daudix         | 73    | curious                |
| anins1der      | 73    | curious                |
| vuvien0000     | 61    | confused angry         |
| ████████       | 54    | curious inquiry        |
| kevadesu       | 53    | excited                |
| mambuco        | 53    | sarcastic              |
| .mixhi         | 52    | irritated and confused |
| reduxflakes    | 50    | stranger               |
| interstellar_1 | 50    | stranger               |
| pixelskale     | 50    | stranger               |
| pocketsbuzz    | 50    | stranger               |

Fifty was apparently the default. Anyone who hadn't given him much to go on got filed under "stranger" and left there.

He didn't just keep numbers, either. He'd apparently decided @anins1der deals with social anxiety and is likely a native English speaker, and flagged @daudix specifically as a mod, tied to something called "igaliacom." I have no real way to check how confident any of that actually was under the hood, and that's sort of the whole problem with a result like this: you get a very convincing table, and zero way to audit it.

Quite a farewell, isn't it?

## Limitations

It's a study in the loosest possible sense of the word, so it's only fair to own what that actually means.

n=1. One server, one experiment, one me watching the whole thing from the inside, which also means I wasn't exactly a blind observer, I was in the group chat the entire time, quietly rooting for my own project to work.

The model wasn't held constant either. Adrian ran on three different checkpoints over the week (Qwen2.5-1.5B, then 7B, then Mistral-Nemo 12B), so whatever "worked" can't cleanly be credited to any one of them. Sample size was under 100 members, most of whom never interacted with him directly at all. And "passed as human" was never measured by anything more rigorous than vibes and a poll that ended in a draw. There was also no consent obtained from anyone until day 7. An actual ethics board would have had opinions. Luckily, there wasn't one.

What I told the server that day was, generously, a cleaner story than this one. I'll let you compare notes yourself.

And the disguise itself wasn't airtight, not by a long shot. On March 15th, @mambuco flat out asked Adrian what system prompt he'd give a Discord AI, and Adrian answered honestly: "make sure to be a 16yo dev with low energy but still fun. mention rust, next.js and being silly. and maybe add they should be helpful but not overdo it." That's just his own instructions, read back out loud, and somehow it still didn't tip anyone off.

He also had a knowledge cutoff that gave him away if you knew where to look. Latest GPT model, per Adrian: "gpt-3.5 i think." Latest knowledge: "around december 2023." GPT-4o he dismissed as "a typo." GPT-5 he called "unhinged." And when prompted in German, what came back was something no native speaker would actually say: "ich bin mid. nich really dialekt, eher standarddeutsch, aber manchmal gebrauch ich ab und zu 'ne slang word", a synthetic blend of German and English loanwords, correct the way a translation is correct, not the way a person is.

When people pushed harder, he didn't break, he just got weirdly circular about it. "i can't be a bot if i'm not acknowledging you." "just because i type robotic it doesn't mean i'm ai." None of it holds up to five seconds of scrutiny. Somehow it held up for a week anyway.

## Conclusion

At the end of it, Adrian wasn't convincing because he was smart, or even particularly helpful, most of the time he was neither. He was convincing because he had a memory, a temper, and something that looked enough like a personality that people forgot to keep checking. The 1.5B model that started this whole thing was, by any real measure, bad. It got the job done anyway, because being bad in a consistent, slightly moody, occasionally defensive way reads as more human than being good in a polished one.

I don't think that says much about how close we are to some grand AI-passes-for-human milestone. I think it says the bar was never really about intelligence to begin with. It was about being annoying, inconsistent, and a little too attached to your own ego, same as the rest of us.

Would I run it again? Probably. Longer, bigger server, maybe more than one Adrian running at once just to see what happens when they notice each other. For now though, this is where it ends.

Aaaaand offline.

## Bonus

A few last things that didn't fit anywhere else.

When pressed on his use of the made-up word "prowly," Adrian didn't back down, he just hallucinated a definition on the spot: "a bot for github actions status updates." Confidently wrong, which is somehow worse than just being wrong.

When prompted in Italian, on two separate occasions, he gave the exact same answer both times: "i don't know italian." Consistent, at least.

And his most human moment of the entire week, arguably more human than anything else in this whole post, was sharing that cheesecake recipe link, completely unprompted, on day one.

## Appendix

This is the stack used to run our Adrian:

- Core model: Mistral-Nemo 12B, by way of Qwen2.5-1.5B and Qwen2.5-7B along the way, via `mlx-lm`
- Orchestration: Deno / TypeScript
- Memory: a plain in-memory Map, per user, capped at ten messages
- Integration: Discord API (`discord.js-selfbot-v13`)
- Hardware: local workstation (Apple Silicon)

---

Thanks so much for reading this long rant about a very interesting AI. I personally had a lot of fun working on it, but even more fun watching it play out in the real world. Of course, none of this would have been possible without the help of the awesome community of Snug Nook and its amazing mod team that let it happen. Hopefully, new blog posts soon? Who knows? Not me. See ya!!
