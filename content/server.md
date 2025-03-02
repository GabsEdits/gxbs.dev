# The gxbs server

The **gxbs server** is a personal home server that hosts various projects,
including websites, blogs, fediverse instance, and more.

## Hardware

Here are the specifications of the hardware:

- Raspberry Pi 5
  - 8GB RAM
  - 512GB microSD card
- Housed in the [official case](https://www.raspberrypi.com/products/raspberry-pi-5-case/)
- Powered by the [official 27W power supply](https://www.raspberrypi.com/products/27w-power-supply/) recommended for Raspberry Pi 5
- Entire setup sourced from [DigiKey](https://www.digikey.com/)
- Almost fully funded by [Hack Club](https://hackclub.com/)

## Software

Long story short:

- Runs on [Raspberry Pi OS](https://www.raspberrypi.com/software/)
- Uses [Docker](https://www.docker.com/) for containerization
- Managed with [Docker Compose](https://docs.docker.com/compose/) & [Portainer](https://www.portainer.io/)
- Uses [Tailscale](https://tailscale.com/) for secure remote access

The server is also accessible via SSH, but only to authorized users.

[Coolify](https://coolify.io/) is used for the complete management of the website.

It is connected with [a GitHub App](https://github.com/apps/gxbs-server), used to automatically deploy projects, preview deployments for pull requests, and manage server resources.

## Badges and Profile Picture

All of the projects hosted on the **gxbs server** have a special badge:

![Server Badge](/server-badge.svg#small)

You can paste the following markdown to include the badge in your project:

```
[![Server Badge](https://gxbs.dev/server-badge.svg)](https://gxbs.dev/server)
```

Additionally, the server has a special profile picture:

![Server Profile Picture](/assets/blog/rpi/icon.png#small)

This profile picture is currently used for the GitHub app.

## Status

- [Server Status](https://status.gxbs.dev/status/server)
