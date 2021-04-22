import axios from 'axios'

let getData = function(url){
    return new Promise(resolve => {
        console.log(url);
        axios.get(url)
            .then(({data}) => {
                resolve(data)
            })
    })
}

export {getData}