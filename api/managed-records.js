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
  // explicitly allow only expected parameters
  // options.page : number
  // options.colors : string[] 
  const allowedOptions = { page: null, colors: []}
  if (options.page) {
    allowedOptions.page = options.page
  }
  if (options.colors) {
    allowedOptions.colors = options.colors
  }

  // max results to process
  let maxResults = 10

  // construct url for records api
  let url = URI(window.path).search(allowedOptions)

  // note a promise using fetch will not reject on http server errors
  return fetch(url)
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
      let previousPage = (allowedOptions.page > 1) ? allowedOptions.page - 1 : null;
      let nextPage = null;
      //console.log('options', options)
      //console.log('allowedOptions', allowedOptions)
      //console.log('maxResults', maxResults)

      // sanity check maxResults
      if (items.length < maxResults) {
        maxResults = items.length
      }

      // loop over results
      for (let i = 0; i < maxResults; i++) {
        // convenient shorthand
        let item = items[i]
        console.log(i, item) 

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
