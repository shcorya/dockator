FROM fedora



COPY Tor.repo /etc/yum.repos.d/Tor.repo

COPY entrypoint.sh /entrypoint.sh

RUN dnf update -y && dnf install -y tor && \
    chmod ugo+rx /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
