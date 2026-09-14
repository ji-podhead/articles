# DevOps Cheatsheets: Network Segmentation, IDS, and the Layer-2 Attack Surface

**Published:** 2026-09-16 · **Author:** Leonardo Jacobi · **Tags:** #DevOps #Security #NetworkSegmentation #Suricata #IDS #Infrastructure

> Full guide: [ji-podhead/DevOps](https://github.com/ji-podhead/DevOps) · [ji-podhead/Network-Guides](https://github.com/ji-podhead/Network-Guides)

So I wanted to create a secure infrastructure in my datacenter / private cloud. That led me to this article about network segmentation, intrusion detection, and the often-underestimated Layer-2 attack surface.

## Why You Shouldn't Underestimate the Power of Layer 2

People forget about this when hosting multiple VMs and subnets on the same machine:

- The VMs/containers on the same machine can still talk to each other over **Layer 2** since they share the same NIC (master)
- If an attacker manages to break out or hack into a container...
- **This gives hackers a huge attack space**

## Possible Attack Vectors

### DNS Attacks
- Spoof the entire DNS by D(Do)S and spoof a sensible page to phish passwords (MITM)
- DNS cache poisoning
- Zone transfer attacks (ask the DNS for all entries)
- Bring down the server, then spoof the IP directly

### DHCP Attacks
- DDoS the DHCP server and spoof it, enabling DNS attacks and vice versa
- Send a new lease to a sensible page (e.g., Vault), replace the IP with a phishing site
- MITM by redirecting via HTTP router

### MAC Spoofing
- Bypass MAC-based DHCP filtering
- Exhaust leases (you lose connectivity, get DDoSed, machines overheat)
- Duplicate IP addresses (network completely broken)

### SSH Attacks
- Brute force, credential stuffing, key-based attacks

## IDS: Suricata

Suricata is an open-source network intrusion detection engine:
- **Multi-threaded architecture** with GPU support
- **Signature-based AND anomaly-based detection**
- **eBPF and XDP** for network filtering, load balancing, and routing in kernelspace
- **OPNsense plugin** — comes as a package for the open-source firewall

**Recommendation:** Use multi-WAN for IDS rather than routing traffic directly through it — direct routing slows down your traffic.

## Network Segmentation with iptables

We create two bridges for our VMs, forward traffic to our router (192.168.1.1), and **drop connections between the bridges** — isolating each VM segment at the kernel level.

## Full Network Guide Series

The complete [Network-Guides repo](https://github.com/ji-podhead/Network-Guides) covers:

| Topic | What |
|---|---|
| **DNS** | Knowledge base, install (bind9), debug (dig), dynamic updates (RNDC), attack vectors, protection (TSIG, DNSSEC, firewall) |
| **DHCP** | Knowledge base, subnets, dynamic updates |
| **Storage** | Knowledge base (SAN/NAS to Ceph), ZFS Pool in Proxmox, iSCSI with SCST-Project |
| **DRBD** | Distributed Replicated Block Device |

---

## Sources

- [DevOps Cheatsheets on GitHub](https://github.com/ji-podhead/DevOps) (live)
- [Network-Guides on GitHub](https://github.com/ji-podhead/Network-Guides) (live)
- [Suricata Documentation](https://suricata.io/) (referenced)
