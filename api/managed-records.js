import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

// max results to process
const maxResults = 10

// primary colors
const primaryColors = ['blue', 'red', 'yellow']

/**
 * 
 * @param {*} options 
 * @returns Promise
 */
const retrieve = async (options = {}) => {

  // explicitly allow only expected api parameters
  //   options.page : number 
  //     api convert to offset = (page - 1) * 10
  //   options.colors : string[] 
  //     api convert to singular color[]
  const apiOptions = { offset: 0, color: []}
  if (options.page > 1) {
    apiOptions.offset = (options.page - 1) * maxResults
  }
  if (options.colors) {
    apiOptions.color = options.colors
  }

  // construct url for records api
  let url = URI(window.path).search(apiOptions)
  console.log(url.toString())

  // note a promise using fetch will not reject on http server errors
  return fetch(url.toString())
    .then(response => response.json())
    .then(items => {
      // return object should look something like:
      //   ids : number[]
      //   open  : object[] 
      //   closedPrimaryCount : number
      //   previousPage : number
      //   nextPage : number
      let allIds = []
      let openItems = []
      let closedPrimaryCount = 0
      let previousPage = (options.page > 1) ? options.page - 1 : null;
      let nextPage = null;

      // set nextPage
      if (maxResults < items.length) {
        nextPage = (options.page ?? 1) + 1
      }

      // loop over results
      let start = 0
      if (apiOptions.page > 1) {
        start = (apiOptions.page - 1) * maxResults
      }
      console.log('apiOptions', apiOptions)
      console.log('start', start)
      const maxRowId = Math.min(10,items.length)
      console.log('maxRowId', maxRowId)
      console.log(items);
      for (let i = 0; i < maxRowId; i++) {
        // convenient shorthand
        let item = items[i]
        //console.log(i, item) 

        // push id to allIDs array
        allIds.push(item.id)

        // primary color?
        item.isPrimary = (primaryColors.indexOf(item.color) !== -1)

        // check if the record is closed and a primary color
        if (item.disposition === 'closed' && item.isPrimary) {
          closedPrimaryCount++
        }
        else if (item.disposition === 'open') {
          openItems.push(item)
        }
      }

      // return custom object
      return {
        'ids': allIds,
        'open': openItems,
        'closedPrimaryCount': closedPrimaryCount,
        'previousPage': previousPage,
        'nextPage': nextPage
      }
    })

}

function isPrimaryColor(c) {
    
}

export default retrieve;
