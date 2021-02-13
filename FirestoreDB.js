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
 *
 **********************************************************************/

/*** CONSTANTS ***/
const COLLECTION = 'SCOREBOARD'
const NAMESLIST = ['Evan', 'Sara', 'McCauley', 'Brandon', 'Dana', 'Kiersten']
const ALLOWDOCDELETION = false
const PROPS = PropertiesService.getUserProperties()

// Retreive Stored Properties:
const [email, key, project_id] = [PROPS.getProperty('client_email'),
                                  PROPS.getProperty('private_key'),
                                  PROPS.getProperty('project_id')]
// Performs GET requests.
const doGet = (e) => e
// Performs POST requests.
const doPost = (e) => e

// Create a Firestore object & authenticate:
const fs = FirestoreApp.getFirestore(email, key, project_id)


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

/*** CONSTANT ***/
// An array of targetted document routes for team members in NAMESLIST.
const TEAM = _createRoutes(COLLECTION)  


// * * * * * * * DOCUMENT CRUD OPERATIONS * * * * * * * \\

/**
 * Adds a new document to a given collection by specifying the name/id and data to add.
 * 
 * @param {string} doc_name -- the new documents name/id value.
 * @param {object} data (opt) -- key-value data initialized in the document.
 * @param {string} collection (opt) -- the collection to add to.
 */
const _CreateDocument_ = (doc_name,
                          data={"_totalXP": 0},
                          collection=COLLECTION) => {

  // Create document request:
  const req = fs.createDocument(`${collection}/${doc_name}`, data)
  // POST request:
  const res = doPost(req)
  // Take object returned by POST request & select just the data.
  const parse = JSON.stringify(res.obj)
  // Return a confirmation message that the doc has been added to the collection.
  return `Created a new peep in ${collection}!\n${doc_name}: ${parse}`
}


/**
 * Retreives a document from a collection based on the document's name/id.
 * 
 * @param {string} doc_name -- the document name/id value to look for.
 * @param {string} collection (opt) -- the collection's name.
 * @param {boolean} just_data (opt) -- whether to read in just the data of the doc.
 * @return {object} -- the document object (or just its data) as JSON.
 */
const _ReadDocument_ = (doc_name,
                        collection=COLLECTION,
                        just_data=false) => {

  const req = fs.getDocument(`${collection}/${doc_name}`)
  const res = doGet(req)
  if (just_data) { return res.obj }
  else { return res }
}


/**
 * Updates the data of a specific document in a given collection.
 * 
 * @param {string} doc_name -- the name/id of the document to update.
 * @param {object} new_data -- the new key-value data used to update the doc.
 * @param {string} collection (opt) -- the collection where the document can be found.
 * @param {boolean} only_specific (opt) -- sets whether the update will only affect the specific data from new_data, or will override all the existing data of the document.
 * @return {string} --
 */
const _UpdateDocument_ = (doc_name,
                          new_data,
                          collection=COLLECTION,
                          only_specific=true) => {

  const req = fs.updateDocument(`${collection}/${doc_name}`,
                                 new_data,
                                 only_specific)
  const res = doPost(req)
  const json = JSON.stringify(res.obj)
  return `Document: ${doc_name} has been updated.\nCurrent data: ${json}`
}


/**
 * Deletes a specific document given the document name/id and collection.
 * With great power comes great responsibility!
 * 
 * @param {string} doc_name -- the name/id of the document to delete.
 * @param {string} collection -- the name of the collection being targetted.
 * @return {string} -- a confirmation upon completion.
 */
const _DeleteDocument_ = (doc_name, collection) => {
  if (ALLOWDOCDELETION) { 
    doPost(fs.deleteDocument(`${collection}/${doc_name}`))
    return `THE DOCUMENT <${doc_name}> HAS BEEN DESTROYED.\n\n\n   u monster`
  } else {
    return `I'm sorry, Dave. I'm afraid I can't do that. 🔴`
  }
}

