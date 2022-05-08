import { useState, useEffect } from 'react';
import Head from 'next/head';
import Caver from 'caver-js';
import { BigNumber } from "bignumber.js";
import lotteryContract from '../abi/lottery';
import styles from '../styles/Home.module.css';

import 'bulma/css/bulma.css'  ;

export default function Home() {
  
  const [caver,setCaver] = useState();
  const [address,setAddress] = useState();
  const [lcContract,setLcContract] = useState();
  const [lotteryPot,setLotteryPot] = useState();
  const [lotteryPlayers,setPlayers] = useState([]);
  const [lotteryHistory,setLotteryHistory] = useState([]);
  const [lotteryId, setLotteryId] = useState();
  const [error,setError] = useState('');
  const [successMsg,setSuccessMsg] = useState();
  

  const updateState = () =>{
    if(lcContract) {getPot()}
    if(lcContract) {getPlayers()}
    if(lcContract){getLotteryId()}
  }
  useEffect(()=>{
   updateState()
    // if(lcContract) {getHistory()}
  },
  [lcContract]
  )
  const getPot = async ()=>{
    // console.log('getPot')
    const pot = await lcContract.methods.getBalance().call();
    setLotteryPot(pot);
  }
  const getPlayers = async ()=>{
    // console.log('getPlayers')
    const players = await lcContract.methods.getPlayers().call();
    setPlayers(players);
  }
  const getLotteryId = async ()=>{
    const lotteryId = await lcContract.methods.lotteryId().call();
    console.log(lotteryId);
    setLotteryId(lotteryId);
    await getHistory(lotteryId)
    console.log(JSON.stringify(lotteryHistory));
  }


  const getHistory = async (id)=>{
    setLotteryHistory([])
    for(let i = parseInt(id);i>0;i--){
      
        console.log('get History');
        const winnerAddress = await lcContract.methods.lotteryHistory(i).call();
        const historyObj = {}
        historyObj.id  = i;
        historyObj.address = winnerAddress;
        setLotteryHistory(lotteryHistory=>[...lotteryHistory,historyObj]);
    }
    console.log(JSON.stringify(lotteryHistory))
    
    
  }
  const enterLotteryHandler = async () =>{
    setError('')
    setSuccessMsg('')
    try{
      await lcContract.methods.enter().send({
        from : address,
        value : BigNumber(1000000000000000001),
        gas : 300000,
        gasPrice:null
      })
      updateState();
    }
    catch(err){
      setError('알 수 없는 에러입니다.');
      alert('다시 시도해주십시오.')
    }
    
  }
  const pickWinnerHandler = async () =>{
    setError('')
    setSuccessMsg('')
    console.log(`address from pick Winner :: ${address}`)
    try{
      await lcContract.methods.pickWinner().send({
        from:address,
        gas:300000,
        gasPrice:null
      })
      const winnerAddress = await  lcContract.methods.lotteryHistory(lotteryId).call()
      setSuccessMsg(`The Winner is ${winnerAddress}`)
      updateState();
    }catch(err){
      console.log(err.message);
      setError('알 수 없는 에러입니다.');
      
    }
  }
  const connectWalletHandler = async() =>{
    // 카이카스가 설치되었는지 확인
    setError('')
    if(typeof window !=='undefined' && typeof window.klaytn !== 'undefined'){
      const provider = window['klaytn'];
      try{
        // 지갑 연결 시도
        
        const accounts = await window.klaytn.enable(); 
        const account = window.klaytn.selectedAddress; 
        console.log(account);

        // Caver 인스턴스 생성

        const caver = new Caver(window.klaytn);
        const balance = await caver.klay.getBalance(account);
        console.log(balance);
        setAddress(accounts[0])
        
        const lc = lotteryContract(caver);
        setLcContract(lc);

      }catch(err){
        setError('알 수 없는 에러입니다.');
        alert('다시 시도해주십시오.')
      }
    }
    else{
      // 카이카스가 설치되지 않았을 경우.
      console.log("Kaikas를 설치해주세요");
    }
  }

  return (
    <div>
      <Head>
        <title>Bunny Banny Ball</title>
        <meta name="description" content="Bunny Banny Ball Lottery-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className='navbar mt-4 mb-4'>

          <div className='container'>
            <div className='navbar-brand'>
              
              <h2> Bunny Banny Ball</h2>
            </div>
            <div className='navbar-end'>

              <button onClick = {connectWalletHandler} className='button is-link'> Connect Wallet</button>
            </div>

          </div>
        </nav>


        <div className='container'>
          <section className='mt-5'>
            <div className='columns'>
            <div className='column is-two-thirds'>
              <section className='mt-5'>
              <p><b>Bunny Ball 참가 비용은 <span className='text-purple'>3Klay입니다.</span></b> </p>
              <button onClick={enterLotteryHandler} className='button is-link is-large is-light mt-3'>Enter</button>
              </section>
              

              <section className='mt-6'>
              <p><b>Admin Only</b> : 추첨</p>
              <button onClick={pickWinnerHandler} className='button is-primary is-large is-light mt-3'>추첨하기</button>
              </section>
              <section>
                <div className='container has-text-danger mt-6'>
                  <p>
                    {error}
                  </p>
                </div>
              </section>

              <section>
                <div className='container has-text-success mt-6'>
                  <p>
                    {successMsg}
                  </p>
                </div>
              </section>
            </div>

            <div className= {`${styles.lotteryinfo} column is-one-third`}>
              <section className='mt-5'>
                <div className='card'>
                  <div className='card-content'>
                    <div className='content'>

                      <h2>BBB 당첨 기록</h2>
                      {
                        (lotteryHistory && lotteryHistory.length>0) && lotteryHistory.map(item=>{
                          if(lotteryId != item.id){
                            return <div className='history-entry mt-3' key={item.id}>
                            <div className=''>Bunny Banny Ball {item.id}회 Winner : </div>
    
                            <div>
                              <a href={`https://baobab.scope.klaytn.com/account/${item.address}`} target='_blank'>
                                {item.address}
                              </a>
                              
                            </div>
                          </div>
                          }
                        })
                      }
                      
                    </div>
                  </div>
                </div>
              </section>

              <section className='mt-5'>
                <div className='card'>
                  <div className='card-content'>
                    <div className='content'>
                      <h2>현재 참여 인원 : {lotteryPlayers.length}</h2>
                      



                      <ul className='ml-0'>
                          {
                          (lotteryPlayers && lotteryPlayers.length > 0 ) && lotteryPlayers .map((player,index)=>{
                            
                            return  <li key={`${player} - ${index}`}>
                              <a href={`https://baobab.scope.klaytn.com/account/${player}`}target='_blank'>{player}
                              </a>        
                              </li>
                          })}
                      </ul>                
                        


                    </div>
                  </div>
                </div>
              </section>
              <section className='mt-5'>
                <div className='card'>
                  <div className='card-content'>
                    <div className='content'>
                      <h2>예상 당첨금</h2>
                      <p>현재 모인 금액 : {Number(lotteryPot / 1000000000000000000)} Klay</p>
                    </div>
                  </div>
                </div>
              </section>
             
            </div>
            </div>
          </section>
        </div>
              </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 Bunny Banny Ball</p>
      </footer>
    </div>
  )
}

