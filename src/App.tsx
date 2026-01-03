import React from 'react';
import { useEffect,  useState } from 'react'
import Select from 'react-select';


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

    if(stockList.some((s)=>s.symbol === selectedOption.value))
      return;

    setStockList(prev=>[...prev,{name:selectedOption.label,symbol:selectedOption.value}]);
  }
  ,[selectedOption]);

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



const StockListItem = React.memo(function StockListItem({stock,handleDelete}:{stock:Stock, handleDelete:()=>void}){

  const [stockCurrentPrice,setStockCurrentPrice] = useState<number>(0.0);
  useEffect(()=>{
    async function getStockCurrentPrice(){
    const stockPrice = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${API_KEY}`);
    const currentPrice = await stockPrice.json();
    console.log(currentPrice);
    setStockCurrentPrice(currentPrice["c"]);
    }
    console.log(stock.symbol);
	  getStockCurrentPrice();
    const currentPriceInterval = setInterval(getStockCurrentPrice,30000);
    return ()=>{
      clearInterval(currentPriceInterval);
    }
  },[stock.symbol]);
  
  return(
    <>
      <td>{stock.name}</td>
      <td>{stock.symbol}</td>
      <td>{stockCurrentPrice}</td>
      <td><button className="btn btn-danger" onClick={handleDelete}>X</button></td>
    </>
  )
});

function StockList({stockList,handleDelete}:{stockList:Stock[],handleDelete:(key:string)=>void}){
  if(!stockList)
    return;
  return(
  <>
  <table className="table table-striped">
    <th>Name</th>
    <th>Symbol</th>
    <th>current Price</th>
    <tbody>
    {stockList.map((stock)=>(
      <tr>
        <StockListItem key={stock.symbol} stock={stock} handleDelete={()=>handleDelete(stock.symbol)}/>
      </tr>
      ))}
    </tbody>
  </table>
  </>
  );
}

function App() {

  const [stockList, setStockList] = useState<Stock[]>([]);

  function handleDelete(key:string){
    const updatedList = stockList.filter((stock)=>stock.symbol!==key);
    console.log(updatedList);
    setStockList(updatedList);
  };

  return (
    <>
    <h2>Track-a-Stock</h2>
      <SearchandSelect stockList={stockList} setStockList={setStockList}/>
      <StockList stockList={stockList} handleDelete={(handleDelete)}/>
    </>
  )
}

export default App
