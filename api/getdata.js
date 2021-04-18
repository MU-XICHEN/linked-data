import axios from 'axios'

let getData = function(url){
    return new Promise(resolve => {
        axios.get(url)
            .then(({data}) => {
                resolve(data)
            })
    })
}

export {getData}