import { WIF } from '@defichain/jellyfish-crypto'
import { BigNumber } from "@defichain/jellyfish-api-core";
import { MainNet } from "@defichain/jellyfish-network";
import { CTransactionSegWit } from "@defichain/jellyfish-transaction";
import { WalletClassic } from '@defichain/jellyfish-wallet-classic'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";


const _priv_key       = process.env.DFI_WALLET_ADDRESS_PRIV_KEY
const _wallet         = process.env.DFI_WALLET_ADDRESS
const _vault_id       = process.env.DFI_WALLET_ADDRESS_VAULT_ID 
const _softMinColRatioOffset = 25
var   _softMinColRatio // calulate -> _minColRatio + _softMinColRatioOffset 
var   _minColRatio // minimum ration needed before liquidation  
var   _informativeRatio // the current ratio 
var   api,wallet,account


async function setup(){                                                       
                                                                              
  api = new WhaleApiClient({                                                  
    url: 'https://ocean.defichain.com',                                       
    timeout: 60000,                                                           
    version: 'v0',                                                            
    network: 'mainnet'                                                        
  })                                                                          

  await console.log(_priv_key)
  /** 
   * Currrent do not know, what WalletClassic means 
   * Used this example:
   * https://github.com/DeFiCh/jellyfish/blob/main/examples/ocean-dex-bot/src/main.ts   
   **/

  wallet = await new WalletClassic(WIF.asEllipticPair(_priv_key))
  account = await new WhaleWalletAccount(api, wallet, MainNet)
} 


async function getUTXOBalance(){
    return new BigNumber(await api.address.getBalance(_wallet))
}

async function getTokenBalance(symbol){
  const tokens = await api.address.listToken(_wallet, 100)
  /** returns data for one single token requested **/
  return tokens.find(token => {
    return token.isDAT && token.symbol === symbol
  })
}

async function depositToVault(symbol,amount){
 
  const token = await getTokenBalance(symbol)

  if (!token) {
    return false
  }

  const address = await account.getAddress()
  console.log("depositToVault vaultId=" + _vault_id + " from=" + address + " token=" + amount + " " + token.symbol)
  /**
   * What does getScript do  
   **/
  const script = await account.getScript()
  await console.log(script)

  const txn = await account.withTransactionBuilder().loans.depositToVault({
    vaultId: _vault_id,
    from: script,
    tokenAmount: {
      token: parseInt(token?.id),
      amount: amount
    }
  }, script)

  await send(txn)
  return true
}

async function send(txn){

  const hex = new CTransactionSegWit(txn).toHex()
  const txId = await api.rawtx.send({ hex: hex })
  await console.log("Send txId: " + txId)
  return txId

}

async function main(){

   try {
     await console.log('priv key:' + _priv_key)
     await console.log('wallet:' + _wallet)
     await setup()

     var utxos = await getUTXOBalance()
     console.log("start utxos = " + utxos)
     var balance = await getTokenBalance('DFI')
     console.log("start balance = " + balance?.amount + " " + balance?.symbol)


     let balanceAll = utxos.plus(await new BigNumber(balance.amount))
     /**
      * Should we deposit or not  
      **/
     if (balanceAll > await new BigNumber(0.2)){
        
        console.log("balance (all_in_all) " + balanceAll) 
        let balance2Deposit = balanceAll.minus(await new BigNumber(0.1))
        console.log("balance (depositing) " + balance2Deposit)     
        const success = await depositToVault('DFI', balance2Deposit)   

     }
     else {
        console.log("balance (all_in_all) " + balanceAll)
        console.log("Not enough to deposit")

     }

     //utxos = await getUTXOBalance()                        
     //console.log("end utxos = " + utxos)                     
     //balance = await getTokenBalance('DFI')                
     //console.log("end balance = " + balance?.amount + " " + balance?.symbol)
     //let _pairs = await api.poolpairs.list()
     //console.log (_pairs) 

   }
   catch(e){
      console.log(e)

   }
}

async function listVault(){

  api.address.listVault(_wallet).then((data) => { 
    console.log(data)
    _minColRatio = data['0'].loanScheme.minColRatio
    _softMinColRatio = Number(_minColRatio) + Number(_softMinColRatioOffset) 
    console.log(_softMinColRatio)

    /** 
     * Get informative ratio 
     **/
    _informativeRatio = Number(data['0'].informativeRatio)
    console.log('informative Ratio is: ' + _informativeRatio)

    if (_informativeRatio > _softMinColRatio){
       console.log('We can take on more loan')

    }
    else {
       console.log('We must get rid of some loan')

    }

  })
}

setInterval(() => {
  main()
}, 300000); // 1000 = 1s * 60 * 5 (5 minutes)                                                                                

process.on('exit', (code) => {
  // you will never see this
    return console.log(`Stop with code ${code}`);
})
