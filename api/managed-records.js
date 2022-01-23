import fetch from "../util/fetch-fill"
import URI from "urijs"

// records endpoint
window.path = "http://localhost:3000/records"

// max results to process
const MAX_RESULTS = 10

// max retry attempts on failure
const MAX_RETRIES = 3

// retry timeout in ms
const RETRY_TIMEOUT = 2000

// primary colors
const PRIMARY_COLORS = ['blue', 'red', 'yellow']

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
    apiOptions.offset = (options.page - 1) * MAX_RESULTS
  }
  if (options.colors) {
    apiOptions.color = options.colors
    // workaround: add an empty element to single-element array
    // uri.js converts arrays to foo=bar, not foo[]=bar
    // the express api requires an explicit array foo[]=bar
    if (apiOptions.color.length === 1) {
        apiOptions.color.push(null)
    }
  }

  // construct url for records api
  let url = URI(window.path).search(apiOptions)

  // number of network attempts remaining
  let attemptsLeft = MAX_RETRIES

  // note a promise using fetch will not reject on http server errors
  return fetch(url.toString())
    .then(response => {
      if (response.status !== 200) {
        throw new Error("HTTP status " + response.status)
      }
      return response.json()
    })
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
      let previousPage = (options.page > 1) ? options.page - 1 : null
      let nextPage = null

      // set nextPage
      if (MAX_RESULTS < items.length) {
        nextPage = (options.page ?? 1) + 1
      }

      // loop over results
      let start = 0
      if (apiOptions.page > 1) {
        start = (apiOptions.page - 1) * MAX_RESULTS
      }
      const maxRowId = Math.min(10,items.length)
      for (let i = 0; i < maxRowId; i++) {
        // convenient shorthand
        let item = items[i]

        // push id to allIDs array
        allIds.push(item.id)

        // primary color?
        item.isPrimary = (PRIMARY_COLORS.indexOf(item.color) !== -1)

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
    .catch(error => {
      // output the error
      console.log(error)

      // inspired by https://stackoverflow.com/questions/46175660/fetch-retry-request-on-failure
      // try again if allowed
      attemptsLeft--
      if (attemptsLeft) {
        return new Promise((resolve) => setTimeout(resolve, RETRY_TIMEOUT))
      }
      // or bail
      else {
        throw error
      }

    })

}

export default retrieve
