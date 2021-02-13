/**********************************************************************
 *  XP Score Keeper Project!
 * 
 *  A Google Chat bot script used to store player experience points in
 *  a Cloud Firestore database. We use a Google Apps Script Library 
 *  called FirestoreGoogleAppsScript to make our lives a little easier.
 * 
 *  https://github.com/grahamearley/FirestoreGoogleAppsScript
 * 
 *
 *  Created by: E.Cope                        (Last edit: 2/13/21)
 **********************************************************************
 */

/*** CONSTANTS ***/
const COLLECTION = 'SCOREBOARD'
const NAMESLIST = ['Evan', 'Sara', 'McCauley', 'Brandon', 'Dana', 'Kiersten']
const PROPS = PropertiesService.getUserProperties()

// Retreive Stored Properties:
const [email, key, project_id] = [PROPS.getProperty('client_email'),
                                  PROPS.getProperty('private_key'),
                                  PROPS.getProperty('project_id')]

const doGet = (e) => e      // Performs GET requests.
const doPost = (e) => e     // Performs POST requests.

// Create a Firestore object & authenticate:
const fs = FirestoreApp.getFirestore(email, key, project_id)


/**
 * Retreives a document from a collection based on the document's name/id.
 * 
 * @param {string} name -- the document's id value.
 * @param {string} collection (opt) -- the collection's name.
 * @return {object} -- the document object as JSON.
 */
const getDocumentByName = (name, collection=COLLECTION) => {
  const req = fs.getDocument(`${collection}/${name}`)
  return doGet(req)
}


/**
 * Creates an array of document routes to each document specified in target_ids.
 * 
 * @param {string} collection -- the collection being targetted.
 * @param {array} target_ids (opt) -- the ids/names to makes routes for.
 * @return {array} routes -- the routes to each of the selected docs in the given collection.
 */
const _createRoutes = (collection, target_ids=NAMESLIST) => {
  let routes = []
  for (let id of target_ids) {
    routes.push(`${collection}/${id}`)
  }
  return routes
}


// CONSTANT {Array}: Targetted document routes.
const TARGET = _createRoutes(COLLECTION)  


/**
 * Adds a new document to a collection.
 * 
 * @param {string} doc_name -- the new documents name/id value.
 * @param {object} data (opt) -- key-value data initialized in the document.
 * @param {string} collection (opt) -- the collection to add to.
 */
const _addDocument = (doc_name,
                      data={"_totalXP": 0},
                      collection=COLLECTION) => {
  const req = fs.createDocument(`${collection}/${doc_name}`, data)
  const res = doPost(req)
  const parse = JSON.stringify(res.obj)
  return `Added a new peep to the collection ${collection}!\n${doc_name}: \n${parse}`
}


/**
 * Adds a key-value pair attribute to each document targetted in the given collection.
 * 
 * @param {object} data -- the key-value object to add.
 * @param {array} target (opt) -- the document routes to add the data to.
 * @return {string} -- a confirmation message on completion. 
 */
const addAttribute = (data, target=TARGET) => {
  for (let route of target) {
    doPost(fs.updateDocument(route, data, true))
  }
  // Return something to signify the process is complete.
  return `Added attribute: ${Object.keys(data)[0]} to the XP Score Board!`
}


/**
 * Finds the attribute specified and replaces it with the new key-value data for a specific document in a given collection.
 * 
 * @param {object} find --
 * @param {object} replace_with --
 * @param {string} id --
 * @param {string} collection (opt) --
 * @return {string} --
 */
const updateAttribute = (find,
                         replace_with,
                         id, collection=COLLECTION) => {
  
  //TODO!

}


/**
 * Deletes a key-value pair attribute from each document targetted in the given collection.
 * 
 * @param {object} attribute -- the key-value pair to remove from each document.
 * @param {array} target (opt) -- an array of routes to each document being targetted.
 * @return {string} -- a confirmation the task has been completed.
 */
const _deleteAttribute = (attribute, target=TARGET) => {
  for (let route of target) {
    let req = fs.getDocument(route)
    let doc = doGet(req)
    let data = doc.obj
    // Grab just the key from the attribute object.
    const key = Object.keys(attribute)[0]
    // Delete that specific key-value pair from the data.
    delete data[key]
    // Update with the new PATCH
    doPost(fs.updateDocument(route, data))
  }
  return `Attribute ${attribute} has been successfully deleted.`
}


/**
 * Delete a specific document given the document name/id and collection.
 * With great power comes great responsibility!
 * 
 * @param {string} doc_name -- the name/id of the document to delete.
 * @param {string} collection -- the name of the collection being targetted.
 * @return {string} -- a confirmation upon completion.
 */
/** (USE WITH CAUTION)
const __DELETEthisDOCUMENTatYOURownRISK = (doc_name, collection) => {
  const req = fs.deleteDocument(`${collection}/${doc_name}`)
  doPost(req)
  return `THE DOCUMENT <${doc_name}> HAS BEEN DESTROYED.`
}
*/


// TESTS:
function netrunner(){
  const test = ''
  console.log(email, project_id)
}

