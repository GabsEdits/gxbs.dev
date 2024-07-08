---
layout: article
title: Installing Fedora Asahi Remix
titleTemplate: Gabs' Blog
author:
  - Gabriel Cozma
description: My setup process for Fedora Asahi Remix, and my thoughts on it.
comments: giscus
date: 2024-07-08T11:18:00+02:00
tags:
  - tech
  - linux
  - fedora
  - asahi
---

I've used [MacOS](./macos-for-web-development.md) ever since I got my new device, which is well over a month now. It went pretty great, but I've started to want more and more to go back to my "home" system, which is Linux. Before getting my new device, I used [Fedora Workstation](https://fedoraproject.org/) as my daily driver, and I loved it. It was fast, reliable, and it had everything I needed. With the temptation of going back to Linux, I had a few options to choose for my distribution:

1. [**Fedora Asahi Remix**](https://asahilinux.org/fedora/): The most polished Linux for Apple Silicon Macs, and the flagship distribution for the [Asahi Linux](https://asahilinux.org/) project.
2. [**NixOS for Apple Silicon**](https://github.com/tpwrules/nixos-apple-silicon): A distribution that I've been wanting to try for a while now, and it's available for Apple Silicon Macs.
3. [Ubuntu Asahi](https://ubuntuasahi.org/): Ubuntu for Apple Silicon Macs, but you know I am not choosing Ubuntu.

Out of these options, the most polished, simplest and supported is, well, Fedora Asahi Remix. And even before getting the device I've setteld on it, since I am familiar with Fedora even more than MacOS. So, I've decided to go with Fedora Asahi Remix.

I decided to document my setup process, and my thoughts on it. So, here it is.

## Pre-Installation

Before installing Fedora Asahi Remix, I did many things:

1. I've asked the Asahi Linux community on what to expect, and to be ready for any issues. They were very helpful, and they told me what to expect. Few things that I've learned:

   - The battery life is not as good as on MacOS, but it's getting better. (Already knew that)
   - There could be flickering on the screen, but it's not a big issue.
   - For GNOME:
     - Occasionally, GDM will just fail because it tries to fallback to nonexistent X11 stuff. But it seems to be less noticeable now.
     - GNOME is unable to detect and explain ARM systems, due to missing features in libraries in the GNOME stack (e.g. `libgtop`).
     - The opinions of the developers don't align very well with the Apple Silicon platform. So there are a little mismatches in the experience.

2. I've prepared my post-setup script for Fedora to include Asahi Remix specific things, like apps that aren't available for `aarch64` architecture.
3. Prepare myself for the installation process, and to be ready for any issues that might come up.

Once I've done all of these, I was ready to install Fedora Asahi Remix.

## Installation

I used the installation script provided by the Fedora Asahi Remix team, which is the <https://fedora-asahi-remix.org> script. It's almost the same as the one provided by Asahi, but with a little less options.

Of course I've chosen the latest version with GNOME. (I am a GNOME fan, and I love it), and I've started the installation process. It was pretty simple, way simpler than I expected. I've chosen the disk and the installation started. It took around 20 minutes to install, and then I've rebooted the system, and followed the other steps that were provided by the script.

## Post-Installation

Everything was nice, I've installed my apps and got ready to use it. While browsing the web, I've noticed the first big issue: scrolling wasn't smooth at all. It was very choppy, and it was very annoying. I don't know if I did something wrong, but that scrolling issue was happening in all apps, and it was very annoying.

I've starting seeing performance issues, like barely being even able to scroll the web with 4 tabs! Maybe the way GNOME handles swap RAM is the issue? Since I have the base model with 8GB of RAM, swap played a big role on MacOS, and it was very fast. But on Fedora, it was very slow. And I guess, I am not ready to use Fedora Asahi Remix as my daily driver.

## Conclusion

While I **love** and I mean it, I love Fedora Asahi Remix and GNOME, I am not ready to use it as my daily driver. I will keep it installed, and I will keep an eye on it, and I will try to fix the issues that I've encountered. But for now, I am staying with MacOS, and I will keep using it until I am ready to switch to Fedora Asahi Remix.
