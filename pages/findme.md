<noscript>
<small style="text-align: center;">It seems like you have JavaScript disabled, if you are intrested in the time in my country check <a href="https://time.is/Moldova#time_zone">time.is</a>, you will see all the info needed about my timezone.</small>
</noscript>

# Find Me

Here, in my part of the world, it's currently <time><span>{{ TimeForMe }}</span><noscript>Enable JS to see it</noscript></time> <small>({{ timezone }})</small>, so take that into consideration if I don’t respond immediately. I am available on the following platforms:

<div class="socials-container">
    <a class="socials" href="https://discord.com/users/841649648606249021">
        <h3>Discord</h3>
        <p>gabsme</p>
    </a>
    <a class="socials" href="mailto:me@gabs.eu.org">
        <h3>Email</h3>
        <p>&#109;&#101;[at]&#103;&#97;&#98;&#115;&#46;&#101;&#117;&#46;&#111;&#114;&#103;</p>
    </a>
    <a class="socials" rel="me" href="https://fosstodon.org/@gabs">
        <h3>Mastodon</h3>
        <p>@gabs@fosstodon.org</p>
    </a>
    <a class="socials" href="https://t.me/gabsedits">
        <h3>Telegram</h3>
        <p>/gabsedits</p>
    </a>
</div>

Feel free to message me on any of these platforms - I'd love to hear from you! :D

---

## Contributions

You can find me on the following Git Services:

<div class="git-container">
    <a class="git git-special" href="https://github.com/GabsEdits" title="My main Git Service">
        <h3>GitHub</h3>
        <p>@GabsEdits</p>
    </a>
      <a class="git" href="https://codeberg.org/gxbs">
        <h3>Codeberg</h3>
        <p>@gxbs</p>
    </a>
    <a class="git" href="https://gitlab.com/gxbs">
        <h3>GitLab:</h3>
        <p>@gxbs</p>
    </a>
    <a class="git" href="https://gitlab.gnome.org/gabs" title="GNOME GitLab for all my GNOME contributions">
        <h3>GNOME GitLab</h3>
        <p>@gabs</p>
    </a>
</div>

> [!TIP] 💡 Tip
> If you want to explore my projects, check on GitHub! As all of my current work is hosted there. Feel free to check out my repositories for a great view of what I've been working on :+1:

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
