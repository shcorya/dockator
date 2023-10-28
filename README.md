# dockator
ATOR in a docker container

Based on https://github.com/Ilshidur/tor-relay-docker but configured for ATOR

Variables which should be set:
- `TOR_Nickname`="MY_NICKNAME"
- `TOR_ContactInfo`="name <name@email.com> @ator: 0xF5FF4853Ea36e2803E6e408D483a3F93042F86ba"
- `TOR_Address`="my.domain.invalid"
- `DOCKATOR_ETCD_HOSTS`="http://etcd-01:2379,http://etcd-02:2379,http://etcd-03:2379"

The changes from the default torrc to this images are:
- `DataDirectory` is set to `/var/lib/tor` (mount a docker volume at this location)
- `ORPort` is set to `9001`
- `SocksPort` is set to `0`
- `ExitRelay` is set to `0`

These changes are made in accordance with the [ATOR Relay Education](https://relayseries.ator.io/relay-education/installing-and-configuring-your-onion-router-relay#step-4-onion-router-configuration)

Additionally, the `MyFamily ` line is initially set without a value. Note the single space after `MyFamily `.

## The flow
- Monitor whether or not the tor process is running by setting `tor` process to null upon closure
- Check whether or not `SIGINT` has already been sent by checking `tor.killed` boolean
- Store a local, sorted array to compare with etcd at a polling interval
1. Pull fingerprints from etcd
2. Push this node's fingerprint to etcd if needed
3. Watch etcd for changes: on change, check if tor is running and restart if needed
4. Start tor process
5. Start polling, comparing polled fingerprints to /etc/tor/torrc
- What if another process adds itself to etcd between this node adding it's own fingerprint and starting its watcher?
    - Compare MyFamily in torrc to nodes in etcd at polling interval and

## Todo
[ ] handle non-graceful exits of tor process by restarting the process
