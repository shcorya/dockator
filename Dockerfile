FROM fedora:38

WORKDIR /usr/src/dockator

COPY package*.json ./

RUN npm install

COPY index.js .

EXPOSE 9001

COPY Tor.repo /etc/yum.repos.d/Tor.repo
COPY torrc /etc/tor/torrc

RUN dnf update -y && dnf install -y tor nyx && \
    dnf install https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm -y && \
    dnf install nsolid -y

ENTRYPOINT ["node", "index.js"]
