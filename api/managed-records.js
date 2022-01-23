import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

/**
 * 
 * @param {*} options 
 * @returns Promise
 */
const retrieve = async (options = {}) => {
  // max results to process
  let maxResults = 10

  // explicitly allow only expected parameters
  // options.page : number
  // options.colors : string[] 
  let allowedOptions = {}
  if (options.page) {
    allowedOptions.page = options.page
  }
  if (options.colors) {
    allowedOptions.colors = options.colors
  }

  // construct url for records api
  let url = URI(window.path).search(allowedOptions)
  //console.log("url!", url.toString())

  // note a promise using fetch will not reject on http server errors
  return fetch(url)
    .then(response => response.json())
    .then(record => {
        // return object should look something like:
        //   ids : number[]
        //   open  : object[] 
        //   closedPrimaryCount : number
        //   previousPage : number
        //   nextPage : number
        let allIds = []
        let openResults = []
        /*
        record.forEach(element => {
          console.log('e', element) 
          allIds.push(element.id)
        });
        console.log(allIds)
        */

        /**
        if (record.length < maxResults) {
          maxResults = record.length
        }
        */
        for (let i = 0; i < maxResults; i++) {
          console.log('i', record[i]) 
          allIds.push(record[i].id)
        }
        //console.log('data', data) 
        //console.log('allowedOptions', allowedOptions) 
        //console.log('allIds', allIds) 
        return {
          'ids': allIds,
          'open': [],
          'closedPrimaryCount': [],
          'previousPage': null,
          'nextPage': null
        }
       
    })

}

export default retrieve;
