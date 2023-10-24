# dockator
ATOR in a docker container

Based on https://github.com/Ilshidur/tor-relay-docker but configured for ATOR

Variables which should be set:
- `TOR_Nickname`="MY_NICKNAME"
- `TOR_ContactInfo`="name <name@email.com>"
- `TOR_Address`="my.domain.invalid"

You can optionally set:
- `TOR_ControlPort`="9051" - this is useful if you want to run something like [The Onion Box](https://github.com/ralphwetzel/theonionbox)

The changes from the default torrc to this images are:
- `DataDirectory` is set to `/var/lib/tor` (mount a docker volume at this location)
- `ORPort` is set to `9001`
- `SocksPort` is set to `0`
- `ExitRelay` is set to `0`

These changes are made in accordance with the [ATOR Relay Education](https://relayseries.ator.io/relay-education/installing-and-configuring-your-onion-router-relay#step-4-onion-router-configuration)
