---
layout: post
title: Chef Happens - Managing Solaris with Chef
date: 2012-07-22 21:32:57.000000000 +03:00
type: post
published: true
status: publish
categories:
- System
- Tips and Tricks
tags:
- bootstrap
- chef
- knife
- opencsw
- pkgutil
- ruby
- solaris
- zfs
- zone
- zpool
meta:
  _edit_last: '9'
  _syntaxhighlighter_encoded: '1'
author:
  login: marthag@wix.com
  email: marthag@wix.com
  display_name: Martha Greenberg
  first_name: Martha
  last_name: Greenberg
---
Adding Solaris servers to be managed by **Chef** was the most annoying entry in our Wix.com DevOps backlog for almost a year. We moved our **MySQL databases to Solaris** more than a year ago. We automate everything, but getting Solaris into the Chef kitchen was not that trivial. There is minimal support for Solaris in Chef, so I have made several additions to Chef which other happy Solaris Chef masters might find useful.


My first challenge in setting up Chef on Solaris was that there is no omnibus installer for Solaris 5.10 x86.
Unfortunately, it takes quite a bit of work to go from a bare Solaris install to one that can install the chef gem. So I've written a bootstrap file that does that work for you.

This bootstrap file does the following:

* Adds /opt/csw/lib and /usr/local/lib to the library path (via crle).
* Installs pkgutil from [OpenCSW](https://www.opencsw.org/).
* Installs libgcc_s1, coreutils, libssl1_0_0, wget, gsed, binutils and gmake via pkgutil.
* Installs ruby from [Sunfreeware](http://www.sunfreeware.com/) (The ruby from OpenCSW does not work correctly).
* Re-names some files so that ruby can build new gems.
* Installs the ohai and chef gems.
* Adds a patch so that adding users to groups works (see [CHEF-3245](http://tickets.opscode.com/browse/CHEF-3245)).
* Creates the initial Chef files.

You can get this [bootstrap file](https://gist.github.com/marthag/3159828) from GitHub.
Once you have downloaded this file, put it in **.chef/bootstrap/solaris.erb** in the root of your Chef repository. If you are the only user who needs it, you can put it in your home directory instead.
Once you have the bootstrap file, (or if you are using another bootstrap file), you can install Chef.
Installing Chef on Solaris:

* Login to the machine you want to install Chef on.
* Set the hostname.
* Enable root login via SSH. (Set PermitRootLogin yes in /etc/ssh/sshd_config)
* svcadm restart ssh
* cd into the root of the Chef Git repository
* Knife bootstrap -d solaris
* Login to the machine as root and run: chef-client

Using OpenCSW packages:
My next challenge was that I want to be able to install OpenCSW packages from Chef. To I've written an LWRP for pkgutil and uploaded it to the [Opscode community cookbook](https://supermarket.chef.io/cookbooks/pkgutil) site. You can install this to your Chef repository by doing "knife cookbook site install pkgutil". Once you have done this, you can start using OpenCSW packages in your cookbooks.

In the cookbook that has the pkgutil_package resources, add a dependency on the pkgutil cookbook in your metadata.rb file, like this:

```ruby
depends "pkgutil"
```

Then use the resources as follows:

```ruby
pkgutil_package "vim"
```
Or:

```ruby
pkgutil_package "vim" do
 action :install
end
pkgutil_package "top" do
 action :upgrade
end
pkgutil_package "less" do
 action :remove
end
```
Using zpools, zfs and zones:
The next challenge was managing [zpools](https://supermarket.chef.io/cookbooks/zpool), [zfs filesystems](https://supermarket.chef.io/cookbooks/zfs) and [zones](https://supermarket.chef.io/cookbooks/zone) via Chef. To do that, I've written LWRPs for them as well, which you can install as you did for pkgutil.

To use these resources, in the cookbook that has the resources, add a dependency on the appropriate cookbook in your metadata.rb file, like this:

```ruby
depends "zpool"
depends "zfs"
```

Or:

```ruby
depends "zone"
```
Then on the global zone, include a recipe like this:

```ruby
zpool "zones" do
  disks [ "c0t2d0s0" ]
end
zfs "zones/test"
directory "/zones/test" do
  mode "0700"
end
zone "test" do
  path "/zones/test"
  limitpriv "default,dtrace_proc,dtrace_user"
  password "whbFxl4vH5guE"
  nets [ "192.168.0.9/24:e1000g0" ]
end
```

##Putting it all together:
My final challenge was to combine this all into a single step to create new zones. This was done in order to ease the transition into Chef for our Solaris administrators, who are used to creating new zones with a bunch of shell scripts. You can get [this script](https://gist.github.com/marthag/3160342) on GitHub.

In order to run the script, ruby 1.9 is required, as well as the chef, git and net/ssh gems. Chef must be installed on the global zone and the zpool for the zone must already be created. It is very strongly recommended to setup DNS for the new zone before beginning!

To see all of the options, run the script with -h:

```bash
shell$ create_zone.rb -h
Usage: ./create_zone.rb (options)
    -d, --debug                      Turn on debugging messages
    -t, --git                        Add/commit/push new recipes to git
    -g, --global GLOBAL              The FQDN of the server to create the zone on (required)
    -c, --config KNIFE_CONFIG        Knife configuration file (defaults to ~/.chef/knife.rb)
    -n, --net NET                    Network information for the new zone, in the form: ipaddress[/cidr]:interface (required)
    -r, --run_list RUN_LIST          Specify the run_list for the new zone
    -s, --password SSH_PASSWORD      SSH password to use (required)
    -P, --port SSH_PORT              SSH port to use (defaults to 22)
    -z, --zone ZONE                  The hostname of the new zone (required)
    -p, --zpool ZPOOL                Name of the zpool to use (defaults to rpool)
    -h, --help                       Show this message&amp;lt;/pre&amp;gt;
# Here is an example of how to create a new zone named test on the host global.example.com and install mysql in the new zone:
shell$ create_zone.rb -n 192.168.0.9/24:e1000g0 -z test -g global.example.com -s testpw -p zones -r "recipe[mysql::server]"
```

The script will:

* Generate the recipes to create the zfs filesystems and the zone.
* If -t is specified, add, commit and push the new recipes to git.
* Upload the cookbook to the Chef server (using the knife.rb configuration specified with -c).
* Add the new recipe to global host.
* Run Chef on the global host, creating the new zfs and zone.
* Knife bootstrap the new zone, with an initial run_list specified with -r.

You can take this script and modify it for your environment (you might want to change the template for the generated recipe), but hopefully you will find it helpful!
