import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

const primaryColors = ['blue', 'red', 'yellow']

/**
 * 
 * @param {*} options 
 * @returns Promise
 */
const retrieve = async (options = {}) => {
  // max results to process
  let maxResults = 10

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

      // sanity check maxResults
      if (items.length < maxResults) {
        maxResults = items.length
      }

      // set nextPage
      const currentPage = options.page ?? 1
      //const maxPage = Math.ceil(items.length / maxResults)
      //console.log(currentPage, maxPage, apiOptions.offset)
      //if (currentPage < maxPage) {
        nextPage = currentPage + 1
      //}

      // loop over results
      let start = 0
      if (apiOptions.page > 1) {
        start = (apiOptions.page - 1) * maxResults
      }
      console.log('apiOptions', apiOptions)
      console.log('start', start)
      const maxRowId = start + maxResults
      console.log('maxRowId', maxRowId)
      console.log(items);
      for (let i = start; i < maxRowId; i++) {
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
