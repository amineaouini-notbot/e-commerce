paypal 
    .Buttons({
        createOrder: (data, action)=>{
            // return action.order.create({
            //     purchase_units: [
            //         {
            //             amount: {
            //                 value: 0.5
            //             }
            //         }
            //     ]
            // })
            return fetch('/user/checkout',{
              method: 'POST',
              headers: {
                "Content-type": "application/json",
                body: JSON.stringify({})
              }  
            })
            .then(res=>{
                if(res.ok) return res.json()
                return res.json().then(json=>Promise.reject(json))
            
            })
            .then(({id})=> id)
            .catch(e=> console.error(e.error))
        },
        onApprove: (data, action) =>{
            return action.order.capture()
            .then((detailes)=>{
                alert('Transaction Completed by '
                + detailes.payer.name.given_name)
            })
            .then(()=>{
                fetch('/user/products/checkedout', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            })
        }
    }).render('#paypal')