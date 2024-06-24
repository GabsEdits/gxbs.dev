# Find Me

<noscript>
<small style="text-align: center;">It seems like you have JavaScript disabled, if you are intrested in the time in my country check <a href="https://time.is/Moldova#time_zone">time.is</a>, you will see all the info needed about my timezone.</small>
</noscript>

Here, in my part of the world, it's currently <time><span :title="'The current time in my location is ' + TimeForMe">{{ TimeForMe }}</span><noscript>Enable JS to see it</noscript></time> <small>({{ timezone }})</small>, so take that into consideration if I don’t respond immediately. I am available on the following platforms:

<section class="cards">

- [**Discord** gabsme](https://discord.com/users/841649648606249021)
- [**Email** me [at] gabs.eu.org](mailto:me@gabs.eu.org)
- [**Mastodon** @gabs@vmst.io](https://vmst.io/@gabs)
- [**Matrix <mark>Not Active</mark>** @gxbs:matrix.org](https://matrix.to/#/@gxbs:matrix.org)
- [**Telegram** @GabsEdits](https://t.me/gabsedits)

</section>

Feel free to message me on any of these platforms - I'd love to hear from you! :D

---

## Contributions

You can find me on the following Git Services:

<section class="cards">

- [**GitHub** @GabsEdits](https://github.com/GabsEdits) { .special }
- [**Forgejo** @gxbs@codeberg.org](https://codeberg.org/gxbs)
- [**GitLab** @gxbs](https://gitlab.com/gxbs)
- [**GNOME GitLab** @gabs](https://gitlab.gnome.org/gabs)

</section>

> [!TIP] Tip
> If you want to explore my projects, check on GitHub! As all of my current work is hosted there. Feel free to check out my repositories for a great view of what I've been working on :+1:

## Miscellaneous

Other information that claims that it's me:

<section class="cards">

- [**Keyoxide <mark>Identity claims</mark>** Pretty much all of my socials](https://keyoxide.org/me%40gabs.eu.org)
- [**Public Key** My GPG Key](https://github.com/GabsEdits.gpg)

</section>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const TimeForMe = ref('');
const timezone = ref('');

function TimeForMeFunction() {
  const now = new Date();
  const userLocale = navigator.language || "en-US";
  const chisinauTime = now.toLocaleTimeString(userLocale, { timeZone: "Europe/Chisinau", hour12: !(userLocale.startsWith("en") || userLocale.startsWith("en-US")), hour: "numeric", minute: "numeric" });
  return chisinauTime;
}

function getTimezone() {
  try {
    const now = new Date();
    const options = { timeZone: "Europe/Chisinau", timeZoneName: "longOffset" };
    const gmtOffset = new Intl.DateTimeFormat(undefined, options).formatToParts(now).find(part => part.type === 'timeZoneName').value;

    timezone.value = `${gmtOffset}`;
  } catch (error) {
    console.error("Error fetching GMT offset:", error);
  }
}

onMounted(() => {
  setInterval(() => {
    TimeForMe.value = TimeForMeFunction();
  }, 100);
  getTimezone();
});
</script>
