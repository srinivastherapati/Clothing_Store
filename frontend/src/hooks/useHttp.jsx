import { useCallback, useEffect, useState } from "react";

async function sendHttpRequest(url,config){
   const response= await fetch(url,config);

   const responseData=await response.json();

   if(!response.ok){
    throw new Error(responseData.message || 'something went wrong, cant send request');
   }

   return responseData;
}
export default function useHttp(url,config,initialData){
    function clearData(){
    setResponse(initialData);
    }

    const [isLoading,setIsLoading]= useState(false);
    const [error,setError]= useState();
    const [response,setResponse]= useState(initialData);
    
    const sendRequest=useCallback( async function sendRequest(data){  
        setIsLoading(true);
        try{
       const responseData= await sendHttpRequest(url,{...config, body:data});
       setResponse(responseData);
   }
   catch(error){
    setError(error.message || 'something went wrong');
   }
   setIsLoading(false);
    },[url,config])

    useEffect(()=>{
        if(config && (config.method==='GET' || !config.method) || !config){
            sendRequest()
        }
    },[sendRequest,config]);

return{
    response,
    isLoading,
    error,
    sendRequest,
    clearData
}

}