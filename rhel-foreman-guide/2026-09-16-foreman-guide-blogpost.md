# RHEL 9 Foreman Guide: From PXE Boot to Bare-Metal Provisioning

**Published:** 2026-09-16 · **Author:** Leonardo Jacobi · **Tags:** #Foreman #RHEL #PXE #Katello #Infrastructure #DevOps

> Full guide: [ji-podhead/RHEL_9_Foreman_Guide](https://github.com/ji-podhead/RHEL_9_Foreman_Guide)

In this guide I show you how to install Foreman with Puppet, Katello, and the Discovery plugin — including DHCP and TFTP server setup, PXE boot, and bare-metal provisioning of physical servers and workstations.

## What is Foreman?

Foreman is a complete lifecycle management tool for physical and virtual servers. It handles:
- **Provisioning:** PXE boot, DHCP, TFTP — from bare metal to running system
- **Configuration:** Puppet integration for desired-state management
- **Content:** Katello for repository, errata, and content management
- **Discovery:** The Discovery plugin auto-discovers new hosts on the network

## The 7 Chapters

### 1. Knowledge Base
How TFTP and DHCP work, how the PXE boot process works, how the Foreman SmartProxy operates, and lifecycle management with Puppet and Katello roles.

### 2. Installation (Katello, Discovery, DHCP, TFTP)
The complete installation process for Foreman with Katello, the Discovery plugin, and local DHCP/TFTP servers.

### 3. Discovery and Provisioning
Discover hosts using the Boot Image, set up Hostgroups, subnets, and finally provision the discovered host.

### 4. Libvirt in Foreman
Install libvirt, set it up as a compute resource, and boot into containers/VMs.

### 5. Proxmox
Install Proxmox inside a VM using KVM and libvirt, then set it up as a compute resource.

### 6. Foreman with External DHCP and DNS
Install Foreman inside a nested VM with external DHCP and DNS:
- DHCP and DNS Dynamic Updates using RNDC
- DHCP lease sharing via OMAPI (HMAC-MD5) key and NFS
- Foreman managing external DNS by importing the RNDC key
- Foreman managing external DHCP via remote-isc-key flag and OMAPI key

### 7. Diskless PXE Boot using ZFS *(under construction)*
Create a ZFS tank inside Proxmox, move VM storage to the ZFS tank, create an automatic backup plan, and create a PXE template for diskless boot using ZFS storage.

## Roadmap

- ~~Libvirt~~ ✓
- ~~Proxmox~~ ✓
- ~~Diskless boot using ZFS (incl. repo storage) and custom PXE/grub preset~~ ✓
- Lifecycle management with Puppet and Katello
- CI/CD with Ansible, Terraform, and Packer

---

## Sources

- [Full Guide on GitHub](https://github.com/ji-podhead/RHEL_9_Foreman_Guide) (live)
- [Foreman Documentation](https://theforeman.org/docs/) (referenced)
- [Proxmox VE Wiki](https://pve.proxmox.com/wiki/Main_Page) (referenced)
