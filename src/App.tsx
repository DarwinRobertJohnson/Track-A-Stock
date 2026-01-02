import { useEffect, useState } from 'react'
import Select from 'react-select';

// const socket = new WebSocket('wss://ws.finnhub.io?token=removed');

// socket.addEventListener('open', function (event) {
//     socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'AAPL'}))
//     socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'BINANCE:BTCUSDT'}))
//     socket.send(JSON.stringify({'type':'subscribe', 'symbol': 'IC MARKETS:1'}))
// });

// socket.addEventListener('message', function (event) {
//     console.log('Message from server ', event.data);
// });

// const unsubscribe = function(symbol:string) {
//     socket.send(JSON.stringify({'type':'unsubscribe','symbol': symbol}))
// }
const API_KEY = "removed";


interface Stock{
  name:string,
  symbol:string
}

interface StockListProps{
  stockList:Stock[],
  setStockList: React.Dispatch<React.SetStateAction<Stock[]>>
}

function SearchandSelect({stockList, setStockList}:StockListProps){


  const [selectedOption, setSelectedOption] = useState<{value:string,label:string} | null>(null);

  useEffect(()=>{
    if(!selectedOption)
        return;
    setStockList([...stockList,{name:selectedOption.label,symbol:selectedOption.value}]);
  }
  ,[selectedOption,setStockList]);

  const [options,setOptions] = useState<Array<{value:string,label:string}>>();

  
  async function handleSearch(inputValue:string){
    console.log(inputValue)
    if(!inputValue.trim()){
      setOptions([]);
      return;
    }
    const fetchData = await fetch(`https://finnhub.io/api/v1/search?q=${inputValue}&exchange=US&token=${API_KEY}`);
    const jsonData = await fetchData.json();
    
    
    if(jsonData.result.length === 0)
      return;
    const searchResult = jsonData.result.map((stock)=>{
      return {label:stock.description, value:stock.symbol};
    })
    console.log(`search result ${searchResult}`)
    setOptions(searchResult);
  }

  return (
    <div className="App">
      <Select
        options={options}
        value={selectedOption}
        onChange={setSelectedOption}
        onInputChange={(inputValue)=>{handleSearch(inputValue)}}
        isSearchable ={true}
      />
    </div>
  );
}



function StockListItem({stock}:{stock:Stock}){

  const [stockCurrentPrice,setStockCurrentPrice] = useState<number>(0.0);
  useEffect(()=>{
    async function getStockCurrentPrice(){
    const stockPrice = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
    const currentPrice = await stockPrice.json();
    console.log(currentPrice);
    setStockCurrentPrice(currentPrice["c"]);
    }
    const currentPriceInterval = setInterval(getStockCurrentPrice,30000);
    return ()=>{
      clearInterval(currentPriceInterval);
    }
  },[]);
  
  return(
    <>
      <td>{stock.name}</td>
      <td>{stock.symbol}</td>
      <td>{stockCurrentPrice}</td>
    </>
  )
}

function StockList({stockList}:{stockList:Stock[]}){
  if(!stockList)
    return;
  return(
  <>
    <th>Name</th>
    <th>Symbol</th>
    <th>current Price</th>
    {stockList.map((stock)=>(
      <tr>
        <StockListItem key={stock.symbol} stock={stock}/>
      </tr>
      ))}
  </>
  );
}

function App() {
  const [stockList, setStockList] = useState<Stock[]>([]);
  return (
    <>
      <SearchandSelect stockList={stockList} setStockList={setStockList}/>
      <StockList stockList={stockList}/>
    </>
  )
}

export default App
