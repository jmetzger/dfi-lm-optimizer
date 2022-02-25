console.log('Start ...');
import { WhaleApiClient } from '@defichain/whale-api-client'

console.log (process.env)
const _priv_key       = process.env.DFI_WALLETT_ADDRESS_PRIV_KEY
const _wallet         = process.env.DFI_WALLETT_ADDRESS
const _softMinColRatioOffset = 25
var   _softMinColRatio // calulate -> _minColRatio + _softMinColRatioOffset 
var   _minColRatio // minimum ration needed before liquidation  
var   _informativeRatio // the current ratio 
var   api

async function main(){

   try {
     await console.log('priv key:' + _priv_key)
     await console.log('wallet:' + _wallet)
     await setup()
     await listVault()
     let _pairs = await api.poolpairs.list()
     console.log (_pairs) 

   }
   catch(e){
      console.log(e.message)

   }
}

async function setup(){

  api = new WhaleApiClient({                                            
    url: 'https://ocean.defichain.com',                                         
    timeout: 60000,                                                             
    version: 'v0',                                                              
    network: 'mainnet'                                                          
  })    

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

       /**
        * Decide which load to take on  
        * We take the one with the highest APR 
        **/
 
       //const client = new Client()       
       //const something = await client.poolpair.listPoolPairs()
       //main() 
       

    }
    else {
       console.log('We must get rid of some loan')

    }

  })
}

main()

process.on('exit', (code) => {
  // you will never see this
    return console.log(`Stop with code ${code}`);
})
