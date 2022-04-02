# DefiChain Liquidity Mining Balancer

## Important 

This comes without warranty, use it at your own risk. 
It is good the walk through the code and look what is does and test it. 

## What is it for ? 

Currently this script will only deposit your DFI into a given Vault (every 5 minutes) 
As I had to do this manually and I do not like it, this is what the script does.

It uses JellyFish and the OceanAPI (https://jellyfish.defichain.com). So no need to run a full node to use it (leightweight) 

I works on a small footprint and it should be sufficient to run this 
on the smallest droplet (virtual machine) on DigitalOcean or on your Raspberry PI. 

## PreRequisites (Obtain private key)

### General 

To be able to let this work, you will need you private key of your DeFiChain Light Wallet (mobile) 
Because it is not possible to extract it directly from the app, you will need to do the following 
steps (it does not work with saiive.live - mobile version IOS !!) 

Download saiive.live - wallet for your Desktop (tested it on OSX, but should work the same for Windows) 
https://apps.apple.com/app/saiive-live-defi-wallet/id1588945201

If this download is not working, take it from github (releases):
https://github.com/saiive/saiive.live/releases

### Steps in SAIIVE (tested on macbook - osx) 

I. Download / Install / Import Wallket (24 words) 

  1. Download saiive.live and install it.
  2. Open App saiive.live
  3. Import Wallet / Wallet importieren (German) 
  4. Agree to Terms of Usage
  5. Enter a new pin (need to remember this one) 
  6. Enter you 24 words (you should have noted or get from DFI Lite Wallet) + click on the button
  7. Be patient, it will take its time (take at least 20 minutes into account)

II. After that saivve should: 
  * Present you one wallet (in my case: DFIJellyFishBS1) 
  * Click on that wallet 
  * Now that wallet should get imported 

III. After the wallet is imported: 
  * Click on accounts / Konten(German) (left menu) 
  * Click on DFIJellyFishBS1 (right window)
  * Identify your wallet (by the hash). In most cases it should be the first one 
  * Click on it and scroll down to "expert mode" and click on this area
  * Now click "export private key" (or something the like)  
  * You need to enter the pin, you used to enter when importing the wallet 

## Installation (Using docker-compose) 

```
git clone https://github.com/jmetzger/dfi-lm-optimizer 
cd dfi-lm-optimizer 
cp -a .dummy.env.template .dummy.env 
# Now adjust your data in .dummy.env (private_key, wallet, vault_id) 
docker compose up -d 
# Now you will see the name of your running container 
# To see what is happening, you can look into the logs 
# You will need to wait to see the first entries
docker logs dfi_lm_optimizer_1 

```

## Installation (Using kubernetes) 

```
# you need a running kuberenetes cluster, you have access to with kubectl 
# kubernetes using the build image from https://hub.docker.com/t3company/dfi-lm-optimizer:latest 
# This is created when I perform a pull request to the branch release 
git clone https://github.com/jmetzger/dfi-lm-optimizer 
cd dfi-lm-optimizer/kubernetes 
# only tested on osx 
# (envsubst tool is needed (needs to be installed)) 
# The reason to use this, i do not want to publish my private key ;o)
# Hint: MAC: brew install gettext
# Hint: RedHat/Centos :: yum install -y gettext

./deploy.sh 

```
