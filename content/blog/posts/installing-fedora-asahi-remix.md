---
layout: article
title: Installing Fedora Asahi Remix
titleTemplate: Gabs' Blog
author:
  - Gabriel Cozma
description: My setup process for Fedora Asahi Remix, and my thoughts on it.
comments: giscus
date: 2024-07-08T11:18:00+02:00
prev: My Take on Serverless Hosting
next: Zed - My New Code Editor
tags:
  - Tech
  - Linux
  - Fedora
  - Asahi Linux
---

I've used [macOS](./macos-for-web-development.md) ever since I got my new device, which is well over a month now. It went pretty great, but I've started to want more and more to go back to my "home" system, which is Linux.

---

Before getting my new device, I used [Fedora Workstation](https://fedoraproject.org/workstation/) as my daily driver, and I loved it. It was fast, reliable, and it had everything I needed. With the temptation of going back to Linux, I had a few options to choose for my distribution:

1. [Fedora Asahi Remix](https://asahilinux.org/fedora/): The most polished Linux for Apple Silicon Macs, and the flagship distribution for the [Asahi Linux](https://asahilinux.org/) project.
2. [NixOS for Apple Silicon](https://github.com/tpwrules/nixos-apple-silicon): A distribution that I've been wanting to try for a while now, and it's available for Apple Silicon Macs.
3. [Ubuntu Asahi](https://ubuntuasahi.org/): Ubuntu for Apple Silicon Macs, but you know I am not choosing Ubuntu.

Out of these options, the most polished, simplest, and supported is, well, Fedora Asahi Remix. And even before getting the device, I've settled on it since I am more familiar with Fedora than macOS. So, I've decided to go with Fedora Asahi Remix.

I decided to document my setup process and my thoughts on it. So, here it is.

## Pre-Installation

Before installing Fedora Asahi Remix, I did many things:

1. I asked the Asahi Linux community what to expect and be ready for any issues. They were very helpful and provided me with the following information:

   - The battery life is not as good as on macOS, but it's improving. (Which I new from the beginning, and not supprised by it.)
   - There could be flickering on the screen, but it's not a major issue. (I've heard about it on Redit)
   - For GNOME:
     - Occasionally, GDM may fail because it tries to fallback to nonexistent X11 stuff, but it seems to be less likely to happen now.
     - GNOME is unable to detect and explain ARM systems due to missing features in libraries in the GNOME stack (e.g., `libgtop`).
     - The opinions of the developers don't align very well with the Apple Silicon platform, resulting in some mismatches in the experience.

2. I prepared my post-setup script for Fedora to include Asahi Remix specific things, like apps that aren't available for the `aarch64` architecture.
3. I prepared myself for the installation process and any potential issues that might arise.

Once I had completed all of these steps, I was ready to install Fedora Asahi Remix.

## Installation

I used the installation script provided by the Fedora Asahi Remix team (<https://fedora-asahi-remix.org>). It's almost the same as the one provided by Asahi, but without extra steps that are not related to Fedora. (Both will provide you with the same end result)

Of course I've chosen the latest version with GNOME. (I am a GNOME fan and will still be), with that I've started the installation process. It was pretty simple, way simpler than I expected. I've chosen the disk and the installation started. It took around 20 minutes to install, and then I've rebooted the system, and followed the other steps that were provided by the script.

## Post-Installation

Everything went smoothly after installing my apps and getting everything set up. However, I immediately noticed a major issue with scrolling while I was scrolling the web. It was extremely choppy and quite annoying. This problem persisted across all applications, and I couldn't figure out if I had made a mistake or if there was another underlying cause.

I've starting seeing performance issues, like barely being even able to scroll the web with 4 tabs! Maybe the way GNOME handles swap RAM is the issue? Since I have the base model with 8GB of RAM, swap played a big role on MacOS, and it was very fast. But on Fedora, it was very slow. And I guess, I am not ready to use Fedora Asahi Remix as my daily driver.

## Conclusion

While I **love** and I mean it, I love Fedora Asahi Remix and GNOME, I am not ready to use it as my daily driver. I will keep it installed, and I will keep an eye on it, and I will try to fix the issues that I've encountered. But for now, I am staying with MacOS, and I will keep using it until I am ready to switch to Fedora Asahi Remix.

**Note:** It's really not Asahi's fault, they do their best (for free) to provide us with Linux on Apple Silicon Macs, and I am very grateful for that. Thanks to everyone who is working on Asahi Linux, you are doing an amazing job! :heart:

I will keep you updated on my journey with Fedora Asahi Remix, and I will let you know if I switch to it as my daily driver. Stay tuned!
